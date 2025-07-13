import { NextFunction, Request, RequestHandler, Response } from 'express'
import env from '../../../config/env'
import { HttpError } from '../../../utils/error'
import logger from '../../../utils/logger'
import { ErrorResponse, SuccessResponse } from '../../../utils/response'
import { CreatePaymentIntentInput } from '../interfaces/create-payment-intent-input'
import { PaymentService } from '../services/payments.service'

const service = new PaymentService()

export const createPaymentIntent: RequestHandler = async (
    req: Request<{}, {}, CreatePaymentIntentInput>,
    res: Response<SuccessResponse<{ clientSecret: string }> | ErrorResponse>,
    next: NextFunction
) => {
    try {
        const { amount, currency, metadata } = req.body
        if (!amount || amount <= 0) {
            throw new HttpError(422, 'Invalid amount')
        }
        const clientSecret = await service.createPaymentIntent({ amount, currency, metadata })
        res.status(201).json({ data: { clientSecret } })
    } catch (err: any) {
        next(err)
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
        next(err)
    }

    const eventType = event?.type
    switch (eventType) {
        case 'payment_intent.succeeded': {
            // TODO: Generate Excel with measures from the order and store
            const intent = event.data.object
            logger.info(`PaymentIntent succeeded: ${intent.id}`)
            break
        }
        case 'payment_intent.payment_failed': {
            const failure = event.data.object
            logger.error(`Payment failed: ${failure.last_payment_error?.message}`)
            break
        }
        default:
            logger.info(`Unhandled event type ${eventType}`)
    }

    res.json({ received: true })
}
