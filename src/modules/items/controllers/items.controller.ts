import { RequestHandler } from 'express'
import { SuccessResponse } from '../../../utils/response'
import { Item } from '../entities/item'
import { ItemService } from '../services/items.service'

const service = new ItemService()

export const listItems: RequestHandler = async (
  _req,
  res,
  next
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

    res.status(200).json(payload)
  } catch (err) {
    next(err)
  }
}
