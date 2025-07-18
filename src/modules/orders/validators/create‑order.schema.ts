import { z } from 'zod'

export const CreateOrderSchema = z.object({
    preorderId: z.uuid(),
    orderType: z.string(),
    orderQuantity: z.number(),
    orderLeadTime: z.number(),
    customerName: z.string(),
    customerEmail: z.email(),
    customerPassword: z.string(),
    jacketBook: z.string(),
    jacketFabric: z.string(),
})

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>
