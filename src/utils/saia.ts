import { SAIA } from '@3dlook/saia-sdk'
import env from '../config/env'

export const saia = new SAIA({
    key: env.SAIA_API_KEY,
})
