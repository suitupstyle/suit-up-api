import { z } from 'zod'

export const CreatePaymentIntentSchema = z.object({
    amount: z.number().gt(0, '`amount` must be greater than $0.00'),
    currency: z.enum(['usd', 'rmb'], 'Accepted currencies are `USD` and `RMB`'),
    paymentMethodId: z.string(),
    orderId: z.number().int(),
})

export type CreatePaymentIntentDTO = z.infer<typeof CreatePaymentIntentSchema>
