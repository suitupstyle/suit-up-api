import { z } from 'zod'

export const OrderDataSchema = z.object({
    orderType: z.string(),
    quantity: z.number(),
    leadTime: z.number(),
    customerHeight: z
        .number()
        .int('`height` must be an integer')
        .min(150, '`height` must be at least 150 cm')
        .max(220, '`height` must be at most 220 cm'),
    customerWeight: z
        .number()
        .min(30, '`weight` must be at least 30 kg')
        .max(200, '`weight` must be at most 200 kg'),
})

export type OrderDataDTO = z.infer<typeof OrderDataSchema>
