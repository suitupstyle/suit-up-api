import { RequestHandler } from 'express'
import { HttpError } from '../../../utils/error'
import { SuccessResponse } from '../../../utils/response'
import { Order } from '../entities/order'
import { OrderService } from '../services/orders.service'

const service = new OrderService()

export const createOrder: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    // TODO: Data validation
    const order = await service.create(req.body)
    const payload: SuccessResponse<Order> = { data: order }
    res.status(201).json(payload)
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: { message: err.message } })
    }
    next(err)
  }
}
