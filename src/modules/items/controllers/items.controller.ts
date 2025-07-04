import { Request, Response } from 'express'
import logger from '../../../utils/logger'
import { Item } from '../entities/item'

export async function listItems(_req: Request, res: Response) {
    try {
        const items = await Item.find()

        res.json({
            data: items,
            meta: {
                page: 1,
                limit: 20,
                total: items.length,
            },
        })
    } catch (err) {
        logger.error('Error fetching items:', err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
