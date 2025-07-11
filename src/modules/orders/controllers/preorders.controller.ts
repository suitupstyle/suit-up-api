import { RequestHandler } from 'express'
import { SuccessResponse } from '../../../utils/response'
import { Preorder } from '../entities/preorder'
import { PreorderService } from '../services/preorders.service'

const service = new PreorderService()

export const createPreorder: RequestHandler = async (req, res, next) => {
    try {
        // TODO: validate data
        const { itemIds } = req.body
        const preorder = await service.create(itemIds)

        const payload: SuccessResponse<Preorder> = {
            data: preorder,
        }
        res.status(201).json(payload)
    } catch (err: unknown) {
        next(err)
    }
}

export const measurePreorder: RequestHandler = async (req, res, next) => {
    try {
        // TODO: validate data
        const preorder = await service.findById(req.params.id)

        const data = req.body
        const updated = await service.update(preorder!, data)

        const measured = await service.measure(updated)

        const payload: SuccessResponse<Preorder> = {
            data: measured,
        }

        res.status(200).json(payload)
    } catch (err: unknown) {
        return next(err)
    }
}
