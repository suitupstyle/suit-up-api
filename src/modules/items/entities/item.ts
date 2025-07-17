import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Order } from '../../orders/entities/order'
import { Preorder } from '../../orders/entities/preorder'

@Entity({ name: 'items' })
export class Item {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'varchar', length: 255 })
    name!: string

    @Column({ type: 'varchar', length: 255 })
    desc!: string

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number

    @ManyToMany(() => Preorder, (preorder) => preorder.items)
    preorders!: Preorder[]

    @ManyToMany(() => Order, (order) => order.items)
    orders!: Order[]
}
