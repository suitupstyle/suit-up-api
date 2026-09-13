import { NextFunction, Request, RequestHandler, Response } from 'express'

import logger from '../../../utils/logger'
import { ErrorResponse, SuccessResponse } from '../../../utils/response'
import { CreatedPaymentIntent, PaymentService } from '../services/payments.service'
import { CreatePaymentIntentDTO } from '../validations/create‑payment-intent.schema'

const service = new PaymentService()

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
        event = service.parseWebhook(
            req.body as Buffer,
            headerValue(req.headers['x-timestamp']),
            headerValue(req.headers['x-signature'])
        )
    } catch (err: unknown) {
        return next(err)
    }

    try {
        await service.handleWebhookEvent(event)
    } catch (e) {
        logger.error('Error processing Airwallex webhook', {
            err: e,
            eventId: event.id,
            eventName: event.name,
        })
    }

    res.json({ received: true })
    return
}

function headerValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
        return value[0]
    }

    return value
}
