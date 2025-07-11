import { RequestHandler } from 'express'
import { SuccessResponse } from '../../../utils/response'
import { Item } from '../entities/item'
import { ItemService } from '../services/items.service'

const service = new ItemService()

export const listItems: RequestHandler = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10))
        const limit = Math.max(1, parseInt((req.query.limit as string) ?? '20', 10))

        const { data, total } = await service.list(page, limit)

        const payload: SuccessResponse<Item[]> = {
            data,
            meta: {
                page: 1,
                limit: data.length,
                total,
            },
        }

        res.status(200).json(payload)
    } catch (err) {
        next(err)
    }
}
