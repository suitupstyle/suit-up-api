import cors from 'cors'
import express, { Application } from 'express'
import 'reflect-metadata'
import helmet from 'helmet'
import env from './config/env'
import itemsRouter from './modules/items'
import { preordersRouter } from './modules/orders'
import { errorHandler } from './utils/error'

const app: Application = express()

app.use(helmet())
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
)
app.use(express.json())

app.use(`/api/${env.API_VERSION}/items`, itemsRouter)
app.use(`/api/${env.API_VERSION}/preorders`, preordersRouter)

app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Not Found' } })
})

app.use(errorHandler)

export default app
