import { ErrorRequestHandler } from 'express'
import logger from '../utils/logger'
import { HttpError } from '../utils/error'

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
    if (err instanceof HttpError) {
        logger.error('HttpError error:', err)
        res.status(err.status).json({ error: { message: err.message } })
        return
    }

    logger.error('Unhandled error:', err)
    res.status(500).json({ error: { message: 'Internal Server Error' } })
    return
}
