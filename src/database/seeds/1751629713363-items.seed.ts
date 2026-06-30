import { DataSource } from 'typeorm'
import { Seeder, SeederFactoryManager } from 'typeorm-extension'

import { Item } from '../../modules/items/entities/item'

export class ItemsSeed1751629713363 implements Seeder {
    track = false

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const repository = dataSource.getRepository(Item)
        await repository.insert([
            {
                name: 'Black Professional Business Suit',
                desc: 'Merino, notch lapel, two-button jacket + flat-front trousers',
                price: 99.0,
            },
        ])
    }
}
