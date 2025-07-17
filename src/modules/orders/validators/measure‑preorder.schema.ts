import { z } from 'zod'

export const MeasurePreorderSchema = z.object({
    gender: z.enum(['male', 'female']).refine((val) => ['male', 'female'].includes(val), {
        message: '`gender` must be "male" or "female"',
    }),
    height: z
        .number()
        .int('`height` must be an integer')
        .min(150, '`height` must be at least 150 cm')
        .max(220, '`height` must be at most 220 cm'),
    weight: z
        .number()
        .min(30, '`weight` must be at least 30 kg')
        .max(200, '`weight` must be at most 200 kg'),
    frontImage: z
        .string()
        .regex(/^data:image\/(png|jpe?g|webp);base64,/, '`frontImage` must be a data URL'),
    sideImage: z
        .string()
        .regex(/^data:image\/(png|jpe?g|webp);base64,/, '`sideImage` must be a data URL'),
})

export type MeasurePreorderDTO = z.infer<typeof MeasurePreorderSchema>
