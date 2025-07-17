import { RequestHandler } from 'express'
import { z } from 'zod'

/**
 * Higher‑order middleware: takes a Zod schema and returns an Express handler
 * that will parse & validate req.body, then either:
 *  • attach `req.body = parsed` and call next()
 *  • respond 422 with a structured list of field errors
 */
export const validate =
    (schema: z.ZodTypeAny): RequestHandler =>
    (req, res, next) => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.') || '(root)',
                message: issue.message,
            }))

            res.status(422).json({ validation: { errors } })
            return
        }

        req.body = result.data
        return next()
    }
