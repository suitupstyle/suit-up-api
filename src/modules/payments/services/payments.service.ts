import env from '../../../config/env'
import {
    AirwallexPaymentIntent,
    AirwallexWebhookEvent,
    airwallex,
    parseAirwallexWebhook,
} from '../../../utils/airwallex'
import { HttpError } from '../../../utils/error'
import logger from '../../../utils/logger'
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

    parseWebhook(
        payload: Buffer,
        timestamp: string | undefined,
        signature: string | undefined
    ): AirwallexWebhookEvent {
        return parseAirwallexWebhook(payload, timestamp, signature, env.AIRWALLEX_WEBHOOK_SECRET)
    }

    async handleWebhookEvent(event: AirwallexWebhookEvent): Promise<void> {
        const eventName = event.name
        const paymentIntent = event.data?.object

        switch (eventName) {
            case 'payment_intent.succeeded': {
                if (!paymentIntent) {
                    logger.error('payment_intent.succeeded missing data.object', {
                        eventId: event.id,
                        eventName,
                    })
                    return
                }

                await this.fulfillSucceededPayment(paymentIntent, eventName)
                return
            }
            case 'payment_intent.cancelled': {
                logger.info('PaymentIntent cancelled', {
                    paymentIntentId: paymentIntent?.id,
                    orderId: paymentIntent ? resolveOrderId(paymentIntent) : undefined,
                    eventName,
                })
                return
            }
            default:
                logger.info('Ignored Airwallex webhook event', {
                    eventId: event.id,
                    eventName,
                })
        }
    }

    private async fulfillSucceededPayment(
        paymentIntent: AirwallexPaymentIntent,
        eventName: string
    ): Promise<void> {
        const orderId = resolveOrderId(paymentIntent)

        logger.info('PaymentIntent succeeded', {
            paymentIntentId: paymentIntent.id,
            orderId,
            eventName,
        })

        if (!orderId) {
            logger.error('No orderId on PaymentIntent, skipping fulfillment', {
                paymentIntentId: paymentIntent.id,
                merchantOrderId: paymentIntent.merchant_order_id,
                eventName,
            })
            return
        }

        try {
            const order = await this.orderService.findByIdOrFail(orderId)
            const wasPaid = await this.orderService.markAsPaid(order)

            if (wasPaid) {
                await this.orderService.enqueueExcelGeneration(order)
                logger.info('Excel queued for order', { orderId })
            }
        } catch (e) {
            logger.error('Error processing payment_intent.succeeded', {
                err: e,
                orderId,
                eventName,
            })
        }
    }
}

function resolveOrderId(paymentIntent: AirwallexPaymentIntent): number | undefined {
    const fromMerchant = Number(paymentIntent.merchant_order_id)
    if (Number.isInteger(fromMerchant) && fromMerchant > 0) {
        return fromMerchant
    }

    const fromMeta = Number(paymentIntent.metadata?.order_id)
    if (Number.isInteger(fromMeta) && fromMeta > 0) {
        return fromMeta
    }

    return undefined
}

function roundMajorUnits(value: number): number {
    return Math.round(value * 100) / 100
}
