import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Customer } from '../../customers/entities/customer'
import { Item } from '../../items/entities/item'

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer!: Customer

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt!: Date

    @Column({ type: 'jsonb', name: 'measurement_data', nullable: true })
    measurementData?: Record<string, unknown>

    @CreateDateColumn({ type: 'timestamptz', name: 'delivered_at', nullable: true })
    deliveredAt!: Date

    @Column({ type: 'boolean', name: 'is_paid', default: false })
    is_paid: boolean = false

    @ManyToMany(() => Item, (item) => item.orders, {
        cascade: true,
    })
    @JoinTable({
        name: 'orders_items',
        joinColumn: { name: 'order_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'item_id', referencedColumnName: 'id' },
    })
    items!: Item[]
}
