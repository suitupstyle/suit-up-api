import { RequestHandler } from 'express'
import { HttpError } from '../../../utils/error'
import { SuccessResponse } from '../../../utils/response'
import { Preorder } from '../entities/preorder'
import { PreorderService } from '../services/preorders.service'
import { CreatePreorderDTO } from '../validators/create‑preorder.schema'
import { MeasurePreorderDTO } from '../validators/measure‑preorder.schema'
import { UpdatePreorderDTO } from '../validators/update‑preorder.schema'

const service = new PreorderService()

export const createPreorder: RequestHandler<{}, {}, CreatePreorderDTO> = async (req, res, next) => {
    try {
        const { itemIds } = req.body
        const preorder = await service.create(itemIds)

        const payload: SuccessResponse<Preorder> = {
            data: preorder,
        }
        res.status(201).json(payload)
        return
    } catch (err: unknown) {
        return next(err)
    }
}

export const measurePreorder: RequestHandler<{ id: string }, {}, MeasurePreorderDTO> = async (
    req,
    res,
    next
) => {
    try {
        const preorder = await service.findById(req.params.id)

        const data = req.body
        const updated = await service.update(preorder!, data)

        const measured = await service.measure({
            ...updated,
            gender: updated.gender!,
            height: updated.height!,
            weight: updated.weight!,
            frontImage: updated.frontImage!,
            sideImage: updated.sideImage!,
        })

        const payload: SuccessResponse<Preorder> = {
            data: measured,
        }

        res.status(200).json(payload)
        return
    } catch (err: any) {
        if (err.status === 422)
            throw new HttpError(422, 'One or both of the taken photos could not be processed.')
        return next(err)
    }
}

export const updatePreorder: RequestHandler<{ id: string }, {}, UpdatePreorderDTO> = async (
    req,
    res,
    next
) => {
    try {
        const preorder = await service.findById(req.params.id)

        const data = req.body
        const updated = await service.update(preorder!, data)

        const payload: SuccessResponse<Preorder> = {
            data: updated,
        }

        res.status(200).json(payload)
        return
    } catch (err: unknown) {
        return next(err)
    }
}
