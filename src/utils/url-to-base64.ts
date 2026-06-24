import { getBase64 } from '@3dlook/saia-sdk'
import axios from 'axios'

export async function urlToBase64(url: string): Promise<string> {
    const response = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
    })

    const mimeType = String(response.headers['content-type'] ?? 'application/octet-stream')

    const blob = new Blob([response.data], { type: mimeType })

    return await getBase64(blob)
}
