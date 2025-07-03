import express from 'express'
import cors from 'cors'

const app = express()

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
)

app.use(express.json())

app.get('/health', (req, res) => res.send('OK'))

export default app
