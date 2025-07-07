import dotenv from 'dotenv'

dotenv.config()

interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test'
    PORT: number
    WINSTON_LOG_LEVEL: string
    WINSTON_LOG_PATH: string
    API_VERSION: string
    THREE_D_LOOK_API_URL: string
    THREE_D_LOOK_API_KEY: string
    STRIPE_PUBLISHABLE_KEY: string
    STRIPE_SECRET_KEY: string
    DATABASE_HOST: string
    DATABASE_PORT: string
    DATABASE_USER: string
    DATABASE_PASSWORD: string
    DATABASE_NAME: string
}

const env: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT ?? '3000', 10),
    WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL ?? 'info',
    WINSTON_LOG_PATH: process.env.WINSTON_LOG_PATH ?? 'logs',
    API_VERSION: process.env.API_VERSION ?? 'v1',
    THREE_D_LOOK_API_URL: process.env.THREE_D_LOOK_API_URL ?? '',
    THREE_D_LOOK_API_KEY: process.env.THREE_D_LOOK_API_URL ?? '',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
    DATABASE_HOST: process.env.DATABASE_HOST ?? '',
    DATABASE_PORT: process.env.DATABASE_PORT ?? '',
    DATABASE_USER: process.env.DATABASE_USER ?? '',
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ?? '',
    DATABASE_NAME: process.env.DATABASE_NAME ?? '',
}

for (const [key, value] of Object.entries(env)) {
    if (value === undefined || value === null || value === '') {
        throw new Error(`Environment variable is not defined: ${key}`)
    }
}

export default env
