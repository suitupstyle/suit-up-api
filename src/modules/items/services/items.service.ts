import { Repository } from 'typeorm'
import { AppDataSource } from '../../../database/data-source'
import logger from '../../../utils/logger'
import { Item } from '../entities/item'

export interface ListResult<T> {
    data: T[]
    total: number
}

export class ItemService {
    private readonly repo: Repository<Item>

    constructor() {
        this.repo = AppDataSource.getRepository(Item)
    }

    async list(): Promise<ListResult<Item>> {
        try {
            const [data, total] = await this.repo.findAndCount()
            return { data, total }
        } catch (err) {
            logger.error('ItemService.list error:', err)
            throw err
        }
    }
}
