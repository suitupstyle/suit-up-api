import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../../../utils/error'
import { ErrorResponse, SuccessResponse } from '../../../utils/response'
import { Order } from '../entities/order'
import { CreateOrderInput } from '../interfaces/create-order-input.interface'
import { OrderService } from '../services/orders.service'

const service = new OrderService()

export const createOrder = async (
    req: Request<{}, {}, CreateOrderInput>,
    res: Response<SuccessResponse<Order> | ErrorResponse>,
    next: NextFunction
) => {
    try {
        const order = await service.create(req.body)
        const payload: SuccessResponse<Order> = { data: order }
        return res.status(201).json(payload)
    } catch (err: any) {
        if (err instanceof HttpError) {
            return res.status(err.status).json({ error: { message: err.message } })
        }
        next(err)
    }
}
