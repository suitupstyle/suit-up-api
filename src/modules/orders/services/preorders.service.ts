import { In, Repository } from 'typeorm'
import { AppDataSource } from '../../../database/data-source'
import { HttpError } from '../../../utils/error'
import logger from '../../../utils/logger'
import { SAIA } from '../../../utils/saia'
// import { urlToBase64 } from '../../../utils/url-to-base64'
import { Item } from '../../items/entities/item'
import { Preorder } from '../entities/preorder'
import { MeasurePreorderDTO } from '../validators/measure‑preorder.schema'
import { UpdatePreorderDTO } from '../validators/update‑preorder.schema'

export class PreorderService {
    private readonly preorderRepo: Repository<Preorder>
    private readonly itemRepo: Repository<Item>

    constructor() {
        this.preorderRepo = AppDataSource.getRepository(Preorder)
        this.itemRepo = AppDataSource.getRepository(Item)
    }

    async create(itemIds: number[]): Promise<Preorder> {
        if (itemIds.length === 0) {
            throw new HttpError(400, 'No item IDs provided')
        }

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

    async update(preorder: Preorder, data: UpdatePreorderDTO): Promise<Preorder> {
        preorder.gender = data.gender
        preorder.height = data.height
        preorder.weight = data.weight
        preorder.frontImage = data.frontImage
        preorder.sideImage = data.sideImage
        preorder.measurementData = data.measurementData

        return this.preorderRepo.save(preorder)
    }

    async measure(data: MeasurePreorderDTO): Promise<Preorder> {
        const { gender, height, weight, frontImage, sideImage } = data
        if (!frontImage || !sideImage) {
            throw new HttpError(400, 'Image URLs not set on preorder')
        }

        try {
            // Images already received as Base64 from the frontend!
            // const frontBase64 = await urlToBase64(frontImageUrl)
            // const sideBase64 = await urlToBase64(sideImageUrl)
            const saia = new SAIA()

            const result = await saia.createPerson({
                gender: gender,
                height: height,
                weight: weight?.toFixed(1),
                front_image: frontImage,
                side_image: sideImage,
            })

            let person
            if ('task_set_id' in result) {
                const taskSetId = result.task_set_id
                const results = await saia.getQueueResults(taskSetId)

                if (!results?.id) {
                    throw new HttpError(504, '3DLOOK measurement error')
                }

                person = results
            } else {
                person = result.person
            }

            data.measurementData = person
            return this.preorderRepo.save(data)
        } catch (err: any) {
            logger.error('3DLOOK API error:', JSON.stringify(err))
            if (err instanceof HttpError) throw err
            throw new HttpError(
                err.response?.status ?? 502,
                `3DLOOK integration failed: ${err.message}`
            )
        }
    }
}
