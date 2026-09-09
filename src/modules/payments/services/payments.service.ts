import env from '../../../config/env'
import { airwallex } from '../../../utils/airwallex'
import { HttpError } from '../../../utils/error'
import logger from '../../../utils/logger'
import { stripe } from '../../../utils/stripe'
import { OrderService } from '../../orders/services/orders.service'
import { CreatePaymentIntentDTO } from '../validations/create‑payment-intent.schema'

export type CreatedPaymentIntent = {
    intentId: string
    clientSecret: string
    currency: string
}

export class PaymentService {
    private readonly orderService = new OrderService()

    async createPaymentIntent(input: CreatePaymentIntentDTO): Promise<CreatedPaymentIntent> {
        const order = await this.orderService.findByIdOrFail(input.orderId)

        if (order.isPaid) {
            throw new HttpError(409, 'Order is already paid')
        }

        const amount = roundMajorUnits(Number(order.pricingData.price) * (1 + env.TAX_RATE))
        if (!(amount > 0)) {
            throw new HttpError(422, 'Order amount must be greater than 0')
        }

        const currency = (input.currency ?? order.pricingData.currency ?? 'usd').toUpperCase()

        try {
            const paymentIntent = await airwallex.createPaymentIntent({
                amount,
                currency,
                merchantOrderId: String(order.id),
                returnUrl: `${env.FRONTEND_BASE_URL}/orders/payment-confirmation?orderId=${order.id}`,
                metadata: {
                    order_id: String(order.id),
                },
            })

            if (!paymentIntent.client_secret) {
                throw new HttpError(502, 'Airwallex did not return a client secret')
            }

            logger.info('Airwallex PaymentIntent created', {
                orderId: order.id,
                paymentIntentId: paymentIntent.id,
                amount,
                currency: paymentIntent.currency,
            })

            return {
                intentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                currency: paymentIntent.currency,
            }
        } catch (err) {
            if (err instanceof HttpError) {
                throw err
            }

            throw new HttpError(502, 'PaymentIntent creation failed')
        }
    }

    handleWebhookSignature(payload: Buffer, signature: string, webhookSecret: string) {
        try {
            return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'invalid signature'
            throw new HttpError(400, `Webhook Error: ${message}`)
        }
    }
}

function roundMajorUnits(value: number): number {
    return Math.round(value * 100) / 100
}
