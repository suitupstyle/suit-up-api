const assert = require('node:assert/strict')
const { test } = require('node:test')

// Exercise the actual order/payment services without external accounts or charges.
function stub(path, exports) {
    const id = require.resolve(path)
    require.cache[id] = { id, filename: id, loaded: true, exports: { __esModule: true, ...exports } }
}

const env = { TAX_RATE: 0.08, FRONTEND_BASE_URL: 'https://example.test' }
stub('../dist/config/env', { default: env })
stub('../dist/utils/logger', { default: { info() {}, error() {} } })
stub('../dist/utils/supabase', { supabaseAdmin: {} })
stub('../dist/modules/orders/queues/excel.queue', { excelQueue: {} })

let catalog = []
let savedOrder
let paymentInput
const repositories = {
    Preorder: {
        findOne: async () => ({ items: catalog, height: 180, weight: 75, measurementData: {} }),
        delete: async () => {},
    },
    Item: { find: async () => catalog },
    Customer: { findOne: async () => ({ id: 1, name: 'Test Customer' }) },
    Order: {
        create: (data) => ({ id: 1, isPaid: false, ...data }),
        save: async (order) => (savedOrder = order),
        findOne: async () => savedOrder,
    },
}
stub('../dist/database/data-source', {
    AppDataSource: { getRepository: (entity) => repositories[entity.name] },
})
stub('../dist/utils/airwallex', {
    airwallex: {
        createPaymentIntent: async (input) => {
            paymentInput = input
            return { id: 'test-intent', client_secret: 'test-secret', currency: input.currency }
        },
    },
})

const { OrderService } = require('../dist/modules/orders/services/orders.service')
const { PaymentService } = require('../dist/modules/payments/services/payments.service')
const { ItemsSeed1751629713363 } = require('../dist/database/seeds/1751629713363-items.seed')

test('single-suit seed flows through order pricing to the Airwallex amount', async () => {
    await new ItemsSeed1751629713363().run({
        getRepository: () => ({ insert: async (items) => { catalog = items } }),
    })
    assert.equal(catalog[0].price, 479.99)
    // Match the decimal strings returned by PostgreSQL.
    catalog = catalog.map((item, i) => ({ ...item, id: i + 1, price: item.price.toFixed(2) }))
    const order = await new OrderService().create({ orderQuantity: 1 })
    assert.equal(order.pricingData.price, 479.99)
    assert.equal(order.pricingData.currency, 'USD')
    await new PaymentService().createPaymentIntent({ orderId: order.id })
    assert.equal(paymentInput.amount, 518.39)
    assert.equal(paymentInput.currency, 'USD')
    assert.equal(paymentInput.merchantOrderId, '1')

    env.TAX_RATE = 0
    await new PaymentService().createPaymentIntent({ orderId: order.id })
    assert.equal(paymentInput.amount, 479.99)
    env.TAX_RATE = 0.08
})

test('decimal catalog prices sum numerically and quantities keep exact cents', async () => {
    catalog = [{ id: 1, price: '479.99' }]
    assert.equal((await new OrderService().create({ orderQuantity: 3 })).pricingData.price, 1439.97)
    catalog = [{ id: 1, price: '479.99' }, { id: 2, price: '20.01' }]
    assert.equal((await new OrderService().create({ orderQuantity: 2 })).pricingData.price, 1000)
})

test('existing order prices remain authoritative and paid orders cannot be charged again', async () => {
    savedOrder = { id: 2, isPaid: false, measurementData: {}, pricingData: { price: 439, currency: 'USD' } }
    await new PaymentService().createPaymentIntent({ orderId: 2 })
    assert.equal(paymentInput.amount, 474.12)
    savedOrder.isPaid = true
    await assert.rejects(new PaymentService().createPaymentIntent({ orderId: 2 }), /already paid/)
})
