import { RequestHandler } from 'express'
import { ExcelGenerationJob } from '../../../types/definitions'
import { SuccessResponse } from '../../../utils/response'
import { Order } from '../entities/order'
import { excelQueue } from '../queues/excel.queue'
import { OrderService } from '../services/orders.service'
import { CreateOrderDTO } from '../validators/create‑order.schema'

const service = new OrderService()

export const listOrders: RequestHandler<
    {},
    SuccessResponse<Order[]>,
    any,
    {
        page?: string
        limit?: string
    }
> = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page ?? '1', 10))
        const limit = Math.max(1, parseInt(req.query.limit ?? '20', 10))

        const { data, total } = await service.list(page, limit)

        const payload: SuccessResponse<Order[]> = {
            data,
            meta: {
                page,
                limit,
                total,
            },
        }

        res.status(200).json(payload)
        return
    } catch (err: unknown) {
        return next(err)
    }
}

export const createOrder: RequestHandler<{}, {}, CreateOrderDTO> = async (req, res, next) => {
    try {
        const order = await service.create(req.body)
        const payload: SuccessResponse<Order> = { data: order }
        res.status(201).json(payload)
        return
    } catch (err: unknown) {
        return next(err)
    }
}

export const wasPaidOrder: RequestHandler<{ id: number }, {}, any> = async (req, res, next) => {
    try {
        const order = await service.findByIdOrFail(req.params.id)

        const payload: SuccessResponse<boolean> = { data: order.isPaid }
        res.status(201).json(payload)
        return
    } catch (err: unknown) {
        return next(err)
    }
}

/**
 * Example method of Excel generation using the queue system
 */
export const generateExcelExample: RequestHandler = async (req, res, next) => {
    const job: ExcelGenerationJob = {
        templatePath: './templates/report.xlsx',
        outputPath: `./output/report-${Date.now()}.xlsx`,
        updates: [], // <-- Here goes the data to update, just check the type definition
        metadata: {}, // <-- Context additional data, optional
    }

    try {
        await excelQueue.addJob(job)
        res.json({
            success: true,
            queueStatus: excelQueue.getStatus(), // <-- You can make a stream for this, or an endpoint to check it regularly
        })
        return
    } catch (err) {
        return next(err)
    }
}
