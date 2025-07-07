import { NextFunction, Request, Response } from 'express'
import { SuccessResponse } from '../../../utils/response'
import { PreorderService } from '../services/preorder.services'

const service = new PreorderService()

export async function createPreorder(
    req: Request<{}, {}, { itemIds: number[] }>,
    res: Response<SuccessResponse<any>>,
    next: NextFunction
) {
    try {
        const { itemIds } = req.body
        const preorder = await service.create(itemIds)

        const payload: SuccessResponse<typeof preorder> = { data: preorder }
        return res.status(201).json(payload)
    } catch (err: any) {
        // Pass structured errors to your error handler
        return next(err)
    }
}

export async function measurePreorder(
    req: Request<{ id: string }>,
    res: Response<SuccessResponse<any>>,
    next: NextFunction
) {
    let preorder = null
    try {
        preorder = await service.findById(req.params.id)
    } catch (err: any) {
        return next(err)
    }

    try {
        const updated = await service.measure(preorder!)
        const payload: SuccessResponse<typeof updated> = { data: updated }

        return res.status(200).json(payload)
    } catch (err: any) {
        return next(err)
    }
}
