import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm'
import { Item } from '../../items/entities/item'
import { MeasurementData } from '../interfaces/measurement-data'

@Entity({ name: 'preorders' })
export class Preorder {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt!: Date

    @Column({ type: 'varchar', length: 255, nullable: true })
    gender?: string

    @Column({ type: 'integer', nullable: true })
    height?: number

    @Column({ type: 'float', nullable: true })
    weight?: number

    @Column({ type: 'varchar', name: 'front_image', nullable: true })
    frontImage?: string

    @Column({ type: 'varchar', name: 'side_image', nullable: true })
    sideImage?: string

    @Column({ type: 'jsonb', name: 'measurement_data', nullable: true })
    measurementData?: MeasurementData

    @ManyToMany(() => Item, (item) => item.preorders, {
        cascade: true,
    })
    @JoinTable({
        name: 'preorders_items',
        joinColumn: { name: 'preorder_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'item_id', referencedColumnName: 'id' },
    })
    items!: Item[]
}
