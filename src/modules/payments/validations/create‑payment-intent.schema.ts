import { z } from 'zod'

export const CreatePaymentIntentSchema = z.object({
    currency: z.enum(['usd', 'cny']).optional(),
    orderId: z.number().int(),
})

export type CreatePaymentIntentDTO = z.infer<typeof CreatePaymentIntentSchema>
