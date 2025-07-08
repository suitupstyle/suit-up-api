import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../../../utils/error'
import { ErrorResponse, SuccessResponse } from '../../../utils/response'
import { Preorder } from '../entities/preorder'
import { MeasurePreorderInput } from '../interfaces/measure-preorder-input.interface'
import { PreorderService } from '../services/preorders.service'

const service = new PreorderService()

export const createPreorder = async (
    req: Request<{}, {}, { itemIds: number[] }>,
    res: Response<SuccessResponse<Preorder> | ErrorResponse>,
    next: NextFunction,
) => {
    try {
        const { itemIds } = req.body
        const preorder = await service.create(itemIds)

        const payload: SuccessResponse<Preorder> = {
            data: preorder,
        }
        return res.status(201).json(payload)
    } catch (err: any) {
        if (err instanceof HttpError) {
            return res.status(err.status).json({ error: { message: err.message } })
        }
        return next(err)
    }
}

export const measurePreorder = async (
    req: Request<{ id: string }, {}, MeasurePreorderInput>,
    res: Response<SuccessResponse<Preorder> | ErrorResponse>,
    next: NextFunction,
) => {
    try {
        const preorder = await service.findById(req.params.id)

        const data = req.body
        const updated = await service.update(preorder!, data)

        const measured = await service.measure(updated)

        const payload: SuccessResponse<Preorder> = {
            data: measured,
        }

        return res.status(200).json(payload)
    } catch (err: any) {
        if (err instanceof HttpError) {
            return res.status(err.status).json({ error: { message: err.message } })
        }
        return next(err)
    }
}
