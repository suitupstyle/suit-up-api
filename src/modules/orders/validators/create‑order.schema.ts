import { z } from 'zod'

export const CreateOrderSchema = z.object({
    preorderId: z.uuid({ message: '`preorderId` must be a valid UUID' }),
    orderType: z.string().min(1, '`orderType` cannot be empty'),
    orderQuantity: z
        .number('`orderQuantity` must be a number')
        .int('`orderQuantity` must be an integer')
        .positive('`orderQuantity` must be at least 1'),
    orderLeadTime: z
        .number('`orderLeadTime` must be a number')
        .int('`orderLeadTime` must be an integer'),
    customerName: z.string().min(2, '`customerName` must be at least 2 characters'),
    customerEmail: z.email('`customerEmail` must be a valid email'),
    customerPassword: z.string().min(8, '`customerPassword` must be at least 8 characters'),
    jacketBook: z
        .string()
        .min(1, '`jacketBook` cannot be empty')
        .max(50, '`jacketBook` is too long'),
    jacketFabric: z
        .string()
        .min(1, '`jacketFabric` cannot be empty')
        .max(50, '`jacketFabric` is too long'),
})

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>
