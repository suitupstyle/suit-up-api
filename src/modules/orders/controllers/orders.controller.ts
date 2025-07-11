import { RequestHandler } from 'express'
import { HttpError } from '../../../utils/error'
import { SuccessResponse } from '../../../utils/response'
import { Order } from '../entities/order'
import { OrderService } from '../services/orders.service'
import { ExcelGenerationJob } from '../../../types/definitions'
import { excelQueue } from '../queues/excel.queue'

const service = new OrderService()

export const createOrder: RequestHandler = async (req, res, next) => {
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
    } catch (err) {
        next(err)
    }
}
