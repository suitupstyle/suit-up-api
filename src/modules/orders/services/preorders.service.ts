import { In, Repository } from 'typeorm'
import { AppDataSource } from '../../../database/data-source'
import { HttpError } from '../../../utils/error'
import logger from '../../../utils/logger'
import { initSaia } from '../../../utils/saia'
// import { urlToBase64 } from '../../../utils/url-to-base64'
import { Item } from '../../items/entities/item'
import { Preorder } from '../entities/preorder'
import { MeasurePreorderInput } from '../interfaces/measure-preorder-input.interface'

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

    async update(preorder: Preorder, data: MeasurePreorderInput): Promise<Preorder> {
        preorder.gender = data.gender
        preorder.height = data.height
        preorder.weight = data.weight
        preorder.frontImage = data.frontImage
        preorder.sideImage = data.sideImage

        return this.preorderRepo.save(preorder)
    }

    async measure(preorder: Preorder): Promise<Preorder> {
        const { gender, height, weight, frontImage, sideImage } = preorder
        if (!frontImage || !sideImage) {
            throw new HttpError(400, 'Image URLs not set on preorder')
        }

        try {
            // Images already received as Base64 from the frontend!
            // const frontBase64 = await urlToBase64(frontImageUrl)
            // const sideBase64 = await urlToBase64(sideImageUrl)
            const { person, queue } = await initSaia()

            const taskSetId = await person.create({
                gender: gender!,
                height: height!,
                weight: weight?.toFixed(1),
                frontImage,
                sideImage,
            })

            const results = await queue.getResults(taskSetId)

            if (!results?.id) {
                // Task was unsuccessful
                throw new HttpError(504, '3DLOOK measurement error')
            }

            preorder.measurementData = results
            return this.preorderRepo.save(preorder)
        } catch (err: any) {
            logger.error('3DLOOK API error:', err.response?.data ?? err.message)
            if (err instanceof HttpError) throw err
            throw new HttpError(err.response?.status ?? 502, '3DLOOK integration failed')
        }
    }
}
