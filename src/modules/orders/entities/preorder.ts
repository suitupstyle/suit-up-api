import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm'
import { Item } from '../../items/entities/item'

@Entity({ name: 'preorders' })
export class Preorder {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt!: Date

    @Column({ type: 'varchar', name: 'front_image_url', nullable: true })
    frontImageUrl?: string

    @Column({ type: 'varchar', name: 'side_image_url', nullable: true })
    sideImageUrl?: string

    @Column({ type: 'jsonb', name: 'measurement_data', nullable: true })
    measurementData?: Record<string, unknown>

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
