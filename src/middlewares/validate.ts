import { RequestHandler } from 'express'
import { z } from 'zod'

/**
 * Higher‑order middleware: takes a Zod schema and returns an Express handler
 * that will parse & validate request data.
 */
export const validate =
    <T extends z.ZodTypeAny>(
        schema: T,
        target: 'body' | 'query' | 'params' = 'body'
    ): RequestHandler =>
    (req, res, next) => {
        const toValidate = req[target]
        const result = schema.safeParse(toValidate)

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.') || '(root)',
                message: issue.message,
            }))

            res.status(422).json({ validation: { errors } })
            return
        }

        req[target] = result.data

        return next()
    }
