import { RequestHandler } from 'express'

import env from '../config/env'

export const verifyAppToken: RequestHandler = (req, res, next) => {
    const authHeader = req.headers['authorization']

    const token = Array.isArray(authHeader)
        ? authHeader[0].split(' ')[1]
        : authHeader?.split(' ')[1]

    const expectedToken = env.APP_TOKEN
    if (!token || token !== expectedToken) {
        res.status(401).json({
            error: { message: 'Unauthorized: Invalid or missing application token.' },
        })
        return
    }

    return next()
}
