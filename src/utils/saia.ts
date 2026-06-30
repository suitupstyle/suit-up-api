import axios, { AxiosInstance } from 'axios'

import env from '../config/env'
import {
    FrontParams,
    MeasurementData,
    SideParams,
    VolumeParams,
} from '../modules/orders/interfaces/measurement-data'

import { HttpError } from './error'
import logger from './logger'
import { setupSaiaMock } from "./setup-saia-mock";

export interface CreatePersonRequest {
    gender: 'male' | 'female'
    height: number
    weight: string
    front_image: string
    side_image: string
}

export interface SubTask {
    name: string
    status: string
    task_id: string
    message: string
}

export interface GetTaskSetResponse {
    is_successful: boolean
    is_ready: boolean
    sub_tasks: SubTask[]
}

export interface GetPersonResponse {
    id: number
    url: string
    gender: 'male' | 'female'
    height: number
    weight: string
    volume_params: VolumeParams
    front_params: FrontParams
    side_params: SideParams
}

class SAIA {
    private readonly client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: `${env.SAIA_API_HOST}`,
            headers: {
                Authorization: `APIKey ${env.SAIA_API_KEY}`,
                'Content-Type': 'application/json',
            },
        })

        if (env.MOCK_3DLOOK) {
            setupSaiaMock(this.client)
        }
    }

    async createPerson(data: CreatePersonRequest): Promise<{ task_set_id: string }> {
        try {
            const resp = await this.client.post('/persons/', data)

            const taskSetUrl = resp.data.task_set_url
            const taskSetId = /\/queue\/(.*)\//g.exec(taskSetUrl)?.[1]!

            return { task_set_id: taskSetId }
        } catch (e) {
            logger.error('Saia createPerson failed', { err: e })
            throw e
        }
    }

    async getPerson(id: number): Promise<GetPersonResponse> {
        const resp = await this.client.get<GetPersonResponse>(`/persons/${id}/`)

        return resp.data
    }

    async getTaskSet(id: string) {
        try {
            const resp = await this.client.get(`/queue/${id}/`)

            return resp.data
        } catch (e) {
            logger.error('Saia getTaskSet failed', { err: e })
            throw e
        }
    }

    async checkQueueStatus(id: string, delay: number = 2000): Promise<GetPersonResponse> {
        const isTaskSet = (
            resp: GetTaskSetResponse | GetPersonResponse
        ): resp is GetTaskSetResponse => {
            return (resp as GetTaskSetResponse).is_successful !== undefined
        }

        return new Promise((resolve, reject) => {
            const timer = setInterval(async () => {
                try {
                    const resp = await this.getTaskSet(id)

                    if (!isTaskSet(resp)) {
                        clearInterval(timer)
                        return resolve(resp)
                    }

                    if (resp.is_ready && !resp.is_successful) {
                        clearInterval(timer)

                        return reject(new Error('3DLOOK task failed'))
                    }
                } catch (err: any) {
                    clearInterval(timer)

                    return reject(
                        err instanceof HttpError
                            ? err
                            : new HttpError(
                                  err.response?.status ?? 500,
                                  '3DLOOK integration failed'
                              )
                    )
                }
            }, delay)
        })
    }

    async getQueueResults(id: string, personId?: number): Promise<MeasurementData> {
        return new Promise((resolve, reject) => {
            this.checkQueueStatus(id)
                .then((person) => {
                    resolve(person)
                })
                .catch((err) => {
                    if (
                        (err.message === 'Network Error' ||
                            err.message === 'Request failed with status code 401') &&
                        personId
                    ) {
                        return this.getPerson(personId)
                            .then((r) => resolve(r))
                            .catch((e) =>
                                reject(
                                    e instanceof Error
                                        ? e
                                        : new HttpError(e.response?.status ?? 500, err)
                                )
                            )
                    }

                    return reject(
                        err instanceof Error ? err : new HttpError(err.response?.status ?? 500, err)
                    )
                })
        })
    }
}

export const saia = Object.freeze(new SAIA())
