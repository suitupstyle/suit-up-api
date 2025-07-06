import { Request, Response, NextFunction } from 'express'
import { AppDataSource } from '../../../database/data-source'
import { Item } from '../entities/item'
import logger from '../../../utils/logger'

export const listItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const repo = AppDataSource.getRepository(Item)

        const items = await repo.find()

        return res.status(200).json({
            data: items,
            meta: {
                page: 1,
                limit: 20,
                total: items.length,
            },
        })
    } catch (err) {
        logger.error('Error fetching items:', err)
        return next(err)
    }
}
