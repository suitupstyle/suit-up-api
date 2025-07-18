import { In, Repository } from 'typeorm'
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
        // const order = await this.orderRepo.findOne({
        //     where: { id },
        //     relations: ['customer'],
        // });
        const order = {
            id,
            createdAt: new Date('2025-07-14T12:00:00Z'),
            customer: {
                id: 7,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                supabaseUserId: 'auth0|1234567890abcdef',
                orders: [],
            },
            items: [
                {
                    id: 1,
                    name: 'Classic Suit',
                    desc: 'Two‑button, navy',
                    price: 99.0,
                    preorders: [],
                    orders: [],
                },
            ],
            orderData: {
                order_type: 'ABC',
                quantity: 1,
                lead_time: 1,
                customer_height: 100,
                customer_weight: '100.0',
            },
            jacketData: {
                book: 'SUIT 2301',
                fabric: 'DBK053A',
            },
            measurementData: {
                id: 3,
                url: 'https://saia.3dlook.me/api/v2/persons/3/',
                gender: 'male',
                height: 200,
                volume_params: {
                    chest: 102.92,
                    waist: 79.64,
                    low_hips: 102.19,
                    high_hips: 91.44,
                    bicep: 32.63,
                    knee: 39.76,
                    ankle: 28.1,
                    wrist: 19.09,
                    calf: 40.2,
                    thigh: 62.43,
                    mid_thigh_girth: 52.88,
                    neck: 40.7,
                    forearm: 28.79,
                    neck_girth: 38.46,
                    neck_girth_relaxed: 34.38,
                    under_bust_girth: 91.97,
                    upper_chest_girth: 103.8,
                    elbow_girth: 29.2,
                    abdomen: 86.78,
                    armscye_girth: 53.29,
                },
                front_params: {
                    soft_validation: { messages: '' },
                    body_height: 53.77,
                    outseam: 130.96,
                    outseam_from_upper_hip_level: 96.04,
                    inseam: 86.37,
                    inside_crotch_length_to_mid_thigh: 45,
                    inside_crotch_length_to_knee: 33,
                    inside_crotch_length_to_calf: 23,
                    crotch_length: 35.11,
                    sleeve_length: 69.86,
                    underarm_length: 45.61,
                    legs_distance: 21.67,
                    high_hips: 33.75,
                    hip_height: 108.96,
                    shoulders: 46.01,
                    chest_top: 37.61,
                    jacket_length: 78.15,
                    shoulder_length: 13.94,
                    neck: 14.71,
                    waist: 29.94,
                    waist_to_low_hips: 23.19,
                    waist_to_knees: 70.88,
                    nape_to_waist_centre_back: 51.39,
                    bust_height: 149.63,
                    shoulder_slope: 22.8,
                    shoulder_to_waist: 47.69,
                    side_neck_point_to_armpit: 22.46,
                    back_neck_height: 173.1,
                    back_neck_point_to_wrist_length: 93.55,
                    upper_hip_height: 118.17,
                    waist_height: 132.15,
                    across_back_width: 41.43,
                    outer_ankle_height: 10.66,
                    knee_height: 61.27,
                    across_back_shoulder_width: 47.57,
                    total_crotch_length: 84.24,
                    inside_leg_height: 97.04,
                    neck_length: 10.1,
                    upper_arm_length: 36.88,
                    lower_arm_length: 32.98,
                    upper_hip_to_hip_length: 9.21,
                    back_shoulder_width: 50.67,
                    rise: 27.69,
                    back_neck_to_hip_length: 68.92,
                    torso_height: 79.11,
                    front_crotch_length: 36.14,
                    back_crotch_length: 45.78,
                },
                side_params: {
                    soft_validation: { messages: '' },
                    neck_to_chest: 26.21,
                    chest_to_waist: 21.47,
                    waist_to_ankle: 122.73,
                    shoulders_to_knees: 115.7,
                    side_upper_hip_level_to_knee: 59.38,
                    side_neck_point_to_upper_hip: 56.28,
                },
            },
            pricingData: {
                currency: 'USD',
                price: 99.0,
            },
            deliveredAt: new Date('2025-07-14T12:00:00Z'),
            isPaid: true,
        } satisfies Order

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
            templatePath: './templates/order.xlsx',
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
                { sheetName, cellAddress: 'N18', value: m.front_params.jacket_length },
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
}
