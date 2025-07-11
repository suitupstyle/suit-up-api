// import { Person, Queue } from '@3dlook/saia-sdk'
import axios, { AxiosInstance } from 'axios'
import env from '../config/env'
import { setupSaiaMock } from './setup-saia-mock'

const saiaHttp: AxiosInstance = axios.create({
    baseURL: env.SAIA_API_HOST,
    headers: {
        Authorization: `APIKey ${env.SAIA_API_KEY}`,
        'Content-Type': 'application/json',
    },
})

// export const saia = new SAIA({
//     key: env.SAIA_API_KEY,
// })

if (env.MOCK_3DLOOK) {
    setupSaiaMock(saiaHttp)
}

// export const person = new Person(env.SAIA_API_HOST, saiaHttp)
// export const queue = new Queue(env.SAIA_API_HOST, saiaHttp)
export async function initSaia() {
    // dynamic ESM import from CJS
    const { Person, Queue } = await import('@3dlook/saia-sdk')

    const person = new Person(env.SAIA_API_HOST, saiaHttp)
    const queue = new Queue(env.SAIA_API_HOST, saiaHttp)

    return { person, queue }
}
