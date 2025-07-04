import cors from 'cors'
import express, { Application } from 'express'
import 'reflect-metadata'
import helmet from 'helmet'
import env from './config/env'
import itemsRouter from './modules/items'

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

export default app
