import { NextFunction, Request, Response } from 'express'
import logger from './logger'

export class HttpError extends Error {
    public readonly status: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
        Error.captureStackTrace?.(this, HttpError)
    }
}

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: { message: err.message } })
    }

    logger.error('Unhandled error:', err)
    return res.status(500).json({ error: { message: 'Internal Server Error' } })
}
