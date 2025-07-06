import axios, { AxiosInstance } from 'axios'
import env from '../config/env'

const threeDLookClient: AxiosInstance = axios.create({
    baseURL: env.THREE_D_LOOK_API_URL,
    headers: {
        Authorization: `APIKey ${env.THREE_D_LOOK_API_KEY}`,
        'Content-Type': 'application/json',
    },
    timeout: 30_000,
})

export default threeDLookClient
