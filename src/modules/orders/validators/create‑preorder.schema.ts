import { z } from 'zod'

export const CreatePreorderSchema = z.object({
    itemIds: z
        .array(z.number().int().positive(), {
            error: '`itemIds` must be an array of positive integers',
        })
        .nonempty('`itemIds` cannot be empty'),
})

export type CreatePreorderDTO = z.infer<typeof CreatePreorderSchema>
