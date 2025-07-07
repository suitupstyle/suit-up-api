import { In, Repository } from 'typeorm'
import { AppDataSource } from '../../../database/data-source'
import { HttpError } from '../../../utils/error'
import logger from "../../../utils/logger";
import { supabase } from '../../../utils/supabase' // your Supabase client
import { Customer } from '../../customers/entities/customer'
import { Item } from '../../items/entities/item'
import { Order } from '../entities/order'
import { Preorder } from '../entities/preorder'
import { CreateOrderInput } from '../interfaces/create-order-input.interface'

export class OrderService {
    private readonly preorderRepo: Repository<Preorder>
    private readonly itemRepo: Repository<Item>
    private readonly customerRepo: Repository<Customer>
    private readonly orderRepo: Repository<Order>

    constructor() {
        this.preorderRepo = AppDataSource.getRepository(Preorder)
        this.itemRepo = AppDataSource.getRepository(Item)
        this.customerRepo = AppDataSource.getRepository(Customer)
        this.orderRepo = AppDataSource.getRepository(Order)
    }

    async create(data: CreateOrderInput): Promise<Order> {
        const { preorderId, customerName, customerEmail, customerPassword } = data

        const preorder = await this.preorderRepo.findOne({
            where: { id: preorderId },
            relations: ['items'],
        })
        if (!preorder) {
            throw new HttpError(404, 'Preorder not found')
        }

        const itemIds = preorder.items.map((i) => i.id)
        const items = await this.itemRepo.find({ where: { id: In(itemIds) } })
        if (items.length !== itemIds.length) {
            throw new HttpError(422, 'One or more items not found')
        }

        let customer = await this.customerRepo.findOne({
            where: { email: customerEmail },
        })

        try {
            if (!customer) {
                const { data, error } = await supabase.auth.admin.createUser({
                    email: customerEmail,
                    password: customerPassword,
                    email_confirm: true,
                    user_metadata: {
                        name: customerName,
                        role: 'customer',
                    },
                })
                if (error || !data?.user?.id) {
                    throw new HttpError(502, 'Customer could not be created')
                }
                customer = this.customerRepo.create({
                    name: customerName,
                    email: customerEmail,
                    supabaseUserId: data.user.id,
                })
                await this.customerRepo.save(customer)
            }

            const order = this.orderRepo.create({
                measurementData: preorder.measurementData,
                customer,
                items,
            })
            const saved = await this.orderRepo.save(order)

            await this.preorderRepo.delete({ id: preorderId })

            return saved
        } catch (err: any) {
            logger.error('Create order error:', err.response?.data ?? err.message)
            throw new HttpError(err.response?.status ?? 502, '3DLOOK integration failed')
        }
    }
}
