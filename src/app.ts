import cors from 'cors'
import express, { Application } from 'express'
import 'reflect-metadata'
import helmet from 'helmet'
import env from './config/env'
import { verifyAppToken } from './middlewares/verifyAppToken'
import { errorHandler } from './middlewares/errorHandler'
import itemsRouter from './modules/items'
import { ordersRouter, preordersRouter } from './modules/orders'
import paymentsRouter from './modules/payments'
import { handleWebhook } from './modules/payments/controllers/payments.controller'
import { setupSwagger } from './utils/swagger'

const app: Application = express()

app.use(helmet())
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
)

app.post(
    `/api/${env.API_VERSION}/payments/webhook`,
    express.raw({ type: 'application/json' }),
    handleWebhook
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
})

setupSwagger(app)

// TODO: Protect all routes!
// app.use(verifyAppToken)

app.use(`/api/${env.API_VERSION}/items`, itemsRouter)
app.use(`/api/${env.API_VERSION}/preorders`, preordersRouter)
app.use(`/api/${env.API_VERSION}/orders`, ordersRouter)
app.use(`/api/${env.API_VERSION}/payments`, paymentsRouter)

app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Not Found' } })
})

app.use(errorHandler)

export default app
