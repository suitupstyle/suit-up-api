import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Preorder } from '../../orders/entities/preorder'

@Entity({ name: 'items' })
export class Item {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'varchar', length: 255 })
    name!: string

    @Column({ type: 'varchar', length: 255 })
    desc!: string

    @ManyToMany(() => Preorder, (preorder) => preorder.items)
    preorders!: Preorder[]
}
