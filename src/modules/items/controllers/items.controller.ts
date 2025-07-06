import { NextFunction, Request, Response } from 'express'
import { SuccessResponse } from '../../../utils/response'
import { Item } from '../entities/item'
import { ItemService } from '../services/items.service'

const service = new ItemService()

export const listItems = async (
    _req: Request,
    res: Response<SuccessResponse<Item[]>>,
    next: NextFunction
) => {
    try {
        const { data, total } = await service.list()

        const payload: SuccessResponse<Item[]> = {
            data,
            meta: {
                page: 1,
                limit: data.length,
                total,
            },
        }

        return res.status(200).json(payload)
    } catch (err) {
        next(err)
    }
}
