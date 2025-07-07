import { NextFunction, Request, Response } from 'express'
import { In } from 'typeorm'
import { AppDataSource } from '../../../database/data-source'
import logger from '../../../utils/logger'
import { Item } from '../../items/entities/item'
import { Preorder } from '../entities/preorder'

export const createPreorder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            itemIds,
        }: {
            itemIds: number[]
        } = req.body

        const itemRepo = AppDataSource.getRepository(Item)
        const items = await itemRepo.find({
            where: { id: In(itemIds) },
        })
        if (items.length !== itemIds.length) {
            return res.status(404).json({ message: 'One or more items not found' })
        }

        const preorderRepo = AppDataSource.getRepository(Preorder)
        const preorder = preorderRepo.create({
            items,
        })
        await preorderRepo.save(preorder)

        return res.status(201).json({
            data: preorder,
        })
    } catch (err) {
        logger.error('Error creating preorder:', err)
        return next(err)
    }
}
