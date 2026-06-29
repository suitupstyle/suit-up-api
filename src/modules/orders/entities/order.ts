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
import { JacketData } from '../interfaces/jacket-data'
import { MeasurementData } from '../interfaces/measurement-data'
import { OrderData } from '../interfaces/order-data'
import { PricingData } from '../interfaces/pricing-data'

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer!: Customer

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt!: Date

    @Column({ type: 'jsonb', name: 'order_data' })
    orderData!: OrderData

    @Column({ type: 'jsonb', name: 'jacket_data' })
    jacketData!: JacketData

    @Column({ type: 'jsonb', name: 'measurement_data' })
    measurementData!: MeasurementData

    @Column({ type: 'jsonb', name: 'pricing_data' })
    pricingData!: PricingData

    @Column({ type: 'timestamptz', name: 'delivered_at', nullable: true })
    deliveredAt!: Date

    @Column({ type: 'boolean', name: 'is_paid', default: false })
    isPaid: boolean = false

    @Column({ type: 'text', name: 'excel_url', nullable: true })
    excelUrl: string | null = null

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
