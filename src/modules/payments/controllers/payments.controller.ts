import { NextFunction, Request, RequestHandler, Response } from 'express'
import env from '../../../config/env'
import { HttpError } from '../../../utils/error'
import logger from '../../../utils/logger'
import { ErrorResponse, SuccessResponse } from '../../../utils/response'
import { OrderService } from '../../orders/services/orders.service'
import { PaymentService } from '../services/payments.service'
import { CreatePaymentIntentDTO } from '../validations/create‑payment-intent.schema'

const service = new PaymentService()
const orderService = new OrderService()

// ---------------------------------------------------------------------------
// Payment Intent flow
// ---------------------------------------------------------------------------
export const createPaymentIntent: RequestHandler = async (
    req: Request<{}, {}, CreatePaymentIntentDTO>,
    res: Response<SuccessResponse<{ clientSecret: string }> | ErrorResponse>,
    next: NextFunction
) => {
    try {
        const data = req.body

        const clientSecret = await service.createPaymentIntent(data)

        const payload: SuccessResponse<{ clientSecret: string }> = {
            data: { clientSecret },
        }

        res.status(201).json(payload)
        return
    } catch (err: any) {
        return next(err)
    }
}

// ---------------------------------------------------------------------------
// Checkout Session flow (kept for potential future use)
// ---------------------------------------------------------------------------
export const createCheckoutSession: RequestHandler = async (
    req: Request<{}, {}, CreatePaymentIntentDTO>,
    res: Response<SuccessResponse<{ clientSecret: string }> | ErrorResponse>,
    next: NextFunction
) => {
    try {
        const data = req.body

        const clientSecret = await service.createCheckoutSession(data)

        const payload: SuccessResponse<{ clientSecret: string }> = {
            data: { clientSecret },
        }

        res.status(201).json(payload)
        return
    } catch (err: any) {
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
    } catch (err: any) {
        return next(err)
    }

    const eventType = event?.type
    switch (eventType) {
        // ------------------------------------------------------------------
        // Payment Intent events
        // ------------------------------------------------------------------
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object
            logger.info(`PaymentIntent succeeded: ${paymentIntent.id}`)

            const orderId = Number(paymentIntent.metadata?.order_id)
            if (!orderId) {
                logger.error('No orderId in PaymentIntent metadata, skipping Excel generation')
                break
            }

            try {
                const order = await orderService.findByIdOrFail(orderId)

                await orderService.markAsPaid(order)
                await orderService.enqueueExcelGeneration(order)

                logger.info(`Excel generated for order ${orderId}`)
            } catch (e) {
                logger.error('Error processing payment_intent.succeeded:', e)
            }

            break
        }
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object
            logger.error(
                `PaymentIntent payment failed: ${paymentIntent.id} — ${paymentIntent.last_payment_error?.message}`
            )
            break
        }

        // ------------------------------------------------------------------
        // Checkout Session events (kept for potential future use)
        // ------------------------------------------------------------------
        case 'checkout.session.completed': {
            const session = event.data.object
            logger.info(`Checkout session completed: ${session.id}`)
            logger.info(`Full metadata payload: ${JSON.stringify(session.metadata)}`)

            const orderId = Number(session.metadata?.order_id)
            if (!orderId) {
                logger.error('No orderId in session metadata, skipping Excel generation')
                break
            }

            if (session.payment_status !== 'paid') {
                logger.info(`Session ${session.id} not yet paid (status: ${session.payment_status}), skipping`)
                break
            }

            try {
                const order = await orderService.findByIdOrFail(orderId)

                await orderService.markAsPaid(order)
                await orderService.enqueueExcelGeneration(order)

                logger.info(`Excel generated for order ${orderId}`)
            } catch (e) {
                logger.error('Error generating order Excel:', e)
            }

            break
        }
        case 'checkout.session.async_payment_failed': {
            const session = event.data.object
            logger.error(`Checkout session async payment failed: ${session.id}`)
            break
        }
        default:
            logger.info(`Unhandled event type ${eventType}`)
    }

    res.json({ received: true })
    return
}
