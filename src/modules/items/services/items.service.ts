import { Repository } from 'typeorm'

import { AppDataSource } from '../../../database/data-source'
import logger from '../../../utils/logger'
import { ListResult } from '../../common/interfaces/list-result.interface'
import { Item } from '../entities/item'

export class ItemService {
    private readonly repo: Repository<Item>

    constructor() {
        this.repo = AppDataSource.getRepository(Item)
    }

    async list(page: number, limit: number): Promise<ListResult<Item>> {
        try {
            const skip = (page - 1) * limit

            const [data, total] = await this.repo.findAndCount({
                skip,
                take: limit,
            })

            return { data, total }
        } catch (err) {
            logger.error('ItemService.list error:', err)
            throw err
        }
    }
}
