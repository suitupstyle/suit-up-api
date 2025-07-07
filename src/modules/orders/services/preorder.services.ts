import { In, Repository } from 'typeorm'
import { AppDataSource } from '../../../database/data-source'
import threeDLookClient from '../../../utils/3dlook'
import { HttpError } from '../../../utils/error'
import logger from '../../../utils/logger'
import { Item } from '../../items/entities/item'
import { Preorder } from '../entities/preorder'

export class PreorderService {
    private readonly preorderRepo: Repository<Preorder>
    private readonly itemRepo: Repository<Item>

    constructor() {
        this.preorderRepo = AppDataSource.getRepository(Preorder)
        this.itemRepo = AppDataSource.getRepository(Item)
    }

    async create(itemIds: number[]): Promise<Preorder> {
        const items = await this.itemRepo.find({
            where: { id: In(itemIds) },
        })
        if (items.length !== itemIds.length) {
            throw new HttpError(422, 'Invalid item IDs provided')
        }

        const preorder = this.preorderRepo.create({ items })
        return this.preorderRepo.save(preorder)
    }

    async findById(id: string): Promise<Preorder | null> {
        return this.preorderRepo.findOne({
            where: { id },
            relations: ['items'],
        })
    }

    async measure(preorder: Preorder): Promise<Preorder> {
        if (!preorder.frontImageUrl || !preorder.sideImageUrl) {
            throw new HttpError(400, 'Both front and side images are required')
        }

        try {
            const response = await threeDLookClient.post('/persons/', {
                front_image_url: preorder.frontImageUrl,
                side_image_url: preorder.sideImageUrl,
            })

            preorder.measurementData = response.data
            return this.preorderRepo.save(preorder)
        } catch (err: any) {
            logger.error('3DLOOK API error:', err.response?.data ?? err.message)
            throw new HttpError(err.response?.status ?? 502, '3DLOOK integration failed')
        }
    }
}
