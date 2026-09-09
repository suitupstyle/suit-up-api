import { randomUUID } from 'node:crypto'

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

import env from '../config/env'

import { HttpError } from './error'
import logger from './logger'

const TOKEN_REFRESH_SKEW_MS = 60_000
const DEFAULT_TOKEN_TTL_MS = 25 * 60 * 1000

export type CreateAirwallexPaymentIntentInput = {
    amount: number
    currency: string
    merchantOrderId: string
    requestId?: string
    returnUrl?: string
    metadata?: Record<string, string>
}

export type AirwallexPaymentIntent = {
    id: string
    request_id: string
    amount: number
    currency: string
    status: string
    merchant_order_id?: string
    client_secret: string
    metadata?: Record<string, string>
    return_url?: string
    created_at?: string
    updated_at?: string
}

type AirwallexLoginResponse = {
    token: string
    expires_at: string
}

type AirwallexErrorBody = {
    code?: string
    message?: string
}

class AirwallexClient {
    private readonly client: AxiosInstance
    private accessToken: string | null = null
    private tokenExpiresAt = 0
    private loginInFlight: Promise<string> | null = null

    constructor() {
        this.client = axios.create({
            baseURL: env.AIRWALLEX_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    async createPaymentIntent(
        input: CreateAirwallexPaymentIntentInput
    ): Promise<AirwallexPaymentIntent> {
        return this.authorizedRequest<AirwallexPaymentIntent>({
            method: 'POST',
            url: '/api/v1/pa/payment_intents/create',
            data: {
                request_id: input.requestId ?? randomUUID(),
                amount: input.amount,
                currency: input.currency.toUpperCase(),
                merchant_order_id: input.merchantOrderId,
                ...(input.metadata ? { metadata: input.metadata } : {}),
                ...(input.returnUrl ? { return_url: input.returnUrl } : {}),
            },
        })
    }

    async retrievePaymentIntent(id: string): Promise<AirwallexPaymentIntent> {
        return this.authorizedRequest<AirwallexPaymentIntent>({
            method: 'GET',
            url: `/api/v1/pa/payment_intents/${id}`,
        })
    }

    private isTokenValid(): boolean {
        return Boolean(this.accessToken) && Date.now() < this.tokenExpiresAt - TOKEN_REFRESH_SKEW_MS
    }

    private clearToken() {
        this.accessToken = null
        this.tokenExpiresAt = 0
    }

    private async login(): Promise<string> {
        try {
            const resp = await axios.post<AirwallexLoginResponse>(
                `${env.AIRWALLEX_BASE_URL}/api/v1/authentication/login`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-client-id': env.AIRWALLEX_CLIENT_ID,
                        'x-api-key': env.AIRWALLEX_API_KEY,
                    },
                }
            )

            this.accessToken = resp.data.token
            this.tokenExpiresAt = parseExpiresAt(resp.data.expires_at)

            logger.info('Airwallex access token obtained', {
                expiresAt: resp.data.expires_at,
            })

            return this.accessToken
        } catch (err) {
            this.clearToken()
            logger.error('Airwallex login failed')
            throw toHttpError(err, 'Airwallex authentication failed')
        }
    }

    private async getAccessToken(): Promise<string> {
        if (this.isTokenValid()) {
            return this.accessToken as string
        }

        if (!this.loginInFlight) {
            this.loginInFlight = this.login().finally(() => {
                this.loginInFlight = null
            })
        }

        return this.loginInFlight
    }

    private async authorizedRequest<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            return await this.sendAuthorized<T>(config)
        } catch (err) {
            if (!isUnauthorized(err)) {
                throw toHttpError(err, 'Airwallex request failed')
            }

            this.clearToken()

            try {
                return await this.sendAuthorized<T>(config)
            } catch (retryErr) {
                throw toHttpError(retryErr, 'Airwallex request failed')
            }
        }
    }

    private async sendAuthorized<T>(config: AxiosRequestConfig): Promise<T> {
        const token = await this.getAccessToken()
        const resp = await this.client.request<T>({
            ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            },
        })

        return resp.data
    }
}

function parseExpiresAt(expiresAt: string): number {
    const normalized = expiresAt.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
    const parsed = Date.parse(normalized)

    if (Number.isNaN(parsed)) {
        return Date.now() + DEFAULT_TOKEN_TTL_MS
    }

    return parsed
}

function isUnauthorized(err: unknown): boolean {
    return axios.isAxiosError(err) && err.response?.status === 401
}

function toHttpError(err: unknown, fallback: string): HttpError {
    if (err instanceof HttpError) {
        return err
    }

    if (axios.isAxiosError<AirwallexErrorBody>(err)) {
        const status = err.response?.status ?? 502
        const message = err.response?.data?.message ?? err.message ?? fallback

        return new HttpError(status, message)
    }

    const message = err instanceof Error ? err.message : fallback
    return new HttpError(502, message)
}

export const airwallex = new AirwallexClient()
