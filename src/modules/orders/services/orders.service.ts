import { In, Repository } from 'typeorm'
import env from '../../../config/env'
import { AppDataSource } from '../../../database/data-source'
import { ExcelGenerationJob } from '../../../types/definitions'
import { HttpError } from '../../../utils/error'
import logger from '../../../utils/logger'
import { supabase } from '../../../utils/supabase'
import { ListResult } from '../../common/interfaces/list-result.interface'
import { Customer } from '../../customers/entities/customer'
import { Item } from '../../items/entities/item'
import { Order } from '../entities/order'
import { Preorder } from '../entities/preorder'
import { excelQueue } from '../queues/excel.queue'
import { CreateOrderDTO } from '../validators/create‑order.schema'

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

    async list(page: number, limit: number): Promise<ListResult<Order>> {
        try {
            const skip = (page - 1) * limit

            const [data, total] = await this.orderRepo.findAndCount({
                skip,
                take: limit,
            })

            return { data, total }
        } catch (err) {
            logger.error('OrderService.list error:', err)
            throw err
        }
    }

    async create(data: CreateOrderDTO): Promise<Order> {
        const {
            preorderId,
            orderType,
            orderQuantity,
            orderLeadTime,
            customerName,
            customerEmail,
            customerPassword,
            jacketBook,
            jacketFabric,
        } = data

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
                orderData: {
                    order_type: orderType ?? 'ABC',
                    quantity: orderQuantity ?? 1,
                    lead_time: orderLeadTime ?? 1,
                    customer_height: preorder.height!,
                    customer_weight: preorder.weight!.toFixed(1),
                },
                jacketData: {
                    book: jacketBook ?? 'SUIT 2301',
                    fabric: jacketFabric ?? 'DBK053A',
                },
                measurementData: preorder.measurementData,
                pricingData: {
                    currency: 'USD',
                    price: items.reduce<number>((sum, item) => sum + item.price, 0) * orderQuantity,
                },
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

    async findByIdOrFail(id: number): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['customer'],
        })

        if (!order) {
            throw new HttpError(404, 'Order not found')
        }

        if (!order.measurementData) {
            throw new HttpError(400, 'No measurement data on order')
        }
        return order
    }

    async enqueueExcelGeneration(order: Order): Promise<{
        outputFile: string
        queueStatus: any
    }> {
        const id = order.id
        const m = order.measurementData
        const o = order.orderData
        const j = order.jacketData

        const sheetName = 'BOOKING'
        const job: ExcelGenerationJob = {
            templatePath: `./templates/${env.TEMPLATE_FILE}`,
            outputPath: `./output/order-${id}.xlsx`,
            updates: [
                { sheetName, cellAddress: 'E2', value: o.order_type },
                { sheetName, cellAddress: 'E3', value: o.quantity },
                { sheetName, cellAddress: 'E4', value: o.lead_time },
                { sheetName, cellAddress: 'B7', value: order.customer.name },
                { sheetName, cellAddress: 'G7', value: o.customer_height },
                { sheetName, cellAddress: 'H7', value: o.customer_weight },
                { sheetName, cellAddress: 'D12', value: j.book },
                { sheetName, cellAddress: 'D13', value: j.fabric },

                { sheetName, cellAddress: 'N12', value: m.volume_params.chest },
                { sheetName, cellAddress: 'N13', value: m.volume_params.waist },
                { sheetName, cellAddress: 'N14', value: m.volume_params.low_hips },
                { sheetName, cellAddress: 'N15', value: m.volume_params.bicep },
                { sheetName, cellAddress: 'N16', value: m.front_params.sleeve_length },
                { sheetName, cellAddress: 'N17', value: m.front_params.sleeve_length },
                { sheetName, cellAddress: 'N18', value: m.front_params.new_jacket_length },
                { sheetName, cellAddress: 'N19', value: m.front_params.shoulders },
                { sheetName, cellAddress: 'N23', value: m.volume_params.wrist },
                { sheetName, cellAddress: 'N24', value: m.volume_params.neck },

                { sheetName, cellAddress: 'N27', value: m.volume_params.high_hips },
                { sheetName, cellAddress: 'N28', value: m.volume_params.low_hips },
                { sheetName, cellAddress: 'N29', value: m.volume_params.thigh },
                { sheetName, cellAddress: 'N30', value: m.front_params.crotch_length },
                { sheetName, cellAddress: 'N31', value: m.front_params.outseam },
                { sheetName, cellAddress: 'N32', value: m.front_params.outseam },
                { sheetName, cellAddress: 'N33', value: m.volume_params.knee },
                { sheetName, cellAddress: 'N34', value: m.volume_params.calf },

                { sheetName, cellAddress: 'N37', value: m.volume_params.chest },
                { sheetName, cellAddress: 'N38', value: m.volume_params.waist },
                { sheetName, cellAddress: 'N39', value: m.front_params.jacket_length },
            ],
            metadata: {
                orderId: id,
                customer: order.customer.name,
            },
        }

        logger.info(`Enqueue Excel job for order ${id}`)
        await excelQueue.addJob(job)

        return {
            outputFile: job.outputPath,
            queueStatus: excelQueue.getStatus(),
        }
    }

    async markAsPaid(order: Order) {
        order.isPaid = true
        order.deliveredAt = new Date()

        return this.orderRepo.save(order)
    }
}
