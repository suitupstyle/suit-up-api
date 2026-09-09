import { NextFunction, Request, RequestHandler, Response } from 'express'

import env from '../../../config/env'
import { HttpError } from '../../../utils/error'
import logger from '../../../utils/logger'
import { ErrorResponse, SuccessResponse } from '../../../utils/response'
import { OrderService } from '../../orders/services/orders.service'
import { CreatedPaymentIntent, PaymentService } from '../services/payments.service'
import { CreatePaymentIntentDTO } from '../validations/create‑payment-intent.schema'

const service = new PaymentService()
const orderService = new OrderService()

export const createPaymentIntent: RequestHandler<
    Record<string, never>,
    SuccessResponse<CreatedPaymentIntent> | ErrorResponse,
    CreatePaymentIntentDTO
> = async (req, res, next) => {
    try {
        const paymentIntent = await service.createPaymentIntent(req.body)
        const payload: SuccessResponse<CreatedPaymentIntent> = { data: paymentIntent }

        res.status(201).json(payload)
        return
    } catch (err: unknown) {
        return next(err)
    }
}

export const handleWebhook: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let event
    try {
        const payload = req.body as Buffer
        const sig = req.headers['stripe-signature']
        if (typeof sig !== 'string') {
            throw new HttpError(400, 'Missing stripe-signature header')
        }
        event = service.handleWebhookSignature(payload, sig, env.STRIPE_WEBHOOK_SECRET)
    } catch (err: unknown) {
        return next(err)
    }

    const eventType = event?.type
    switch (eventType) {
        // ------------------------------------------------------------------
        // Payment Intent events
        // ------------------------------------------------------------------
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object
            logger.info('PaymentIntent succeeded', {
                paymentIntentId: paymentIntent.id,
                orderId: Number(paymentIntent.metadata?.order_id) || undefined,
                eventType,
            })

            const orderId = Number(paymentIntent.metadata?.order_id)
            if (!orderId) {
                logger.error('No orderId in PaymentIntent metadata, skipping Excel generation', {
                    paymentIntentId: paymentIntent.id,
                    eventType,
                })
                break
            }

            try {
                const order = await orderService.findByIdOrFail(orderId)

                const wasPaid = await orderService.markAsPaid(order)
                if (wasPaid) {
                    await orderService.enqueueExcelGeneration(order)
                }

                logger.info('Excel generated for order', { orderId })
            } catch (e) {
                logger.error('Error processing payment_intent.succeeded', {
                    err: e,
                    orderId,
                    eventType,
                })
            }

            break
        }
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object
            logger.error('PaymentIntent payment failed', {
                paymentIntentId: paymentIntent.id,
                errorMessage: paymentIntent.last_payment_error?.message,
                eventType,
            })
            break
        }

        default:
            logger.info('Unhandled Stripe webhook event type', { eventType })
    }

    res.json({ received: true })
    return
}
