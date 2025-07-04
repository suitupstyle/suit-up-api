import 'reflect-metadata'
import { DataSource } from 'typeorm'
import env from '../config/env'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT),
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    entities: [__dirname + '/modules/*/entities/*.{ts,js}'],
    migrations: [__dirname + '/modules/*/migrations/*.{ts,js}'],
    synchronize: false,
    logging: env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})
