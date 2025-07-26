import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Order } from '../../orders/entities/order'

@Entity({ name: 'customers' })
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'varchar', length: 255 })
    name!: string

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string

    @Column({ type: 'varchar', name: 'supabase_user_id', length: 255, unique: true })
    supabaseUserId!: string

    @OneToMany(() => Order, (order) => order.customer)
    orders!: Order[]
}
