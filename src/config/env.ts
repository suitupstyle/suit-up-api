import dotenv from 'dotenv'

dotenv.config()

interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test'
    PORT: number
    WINSTON_LOG_LEVEL: string
    WINSTON_LOG_PATH: string
    API_BASE_URL: string
    API_VERSION: string
    SAIA_API_HOST: string
    SAIA_API_KEY: string
    SUPABASE_URL: string
    SUPABASE_PUBLIC_API_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    STRIPE_SECRET_KEY: string
    STRIPE_WEBHOOK_SECRET: string
    DATABASE_HOST: string
    DATABASE_PORT: string
    DATABASE_USER: string
    DATABASE_PASSWORD: string
    DATABASE_NAME: string
    MOCK_3DLOOK: boolean
    APP_TOKEN: string
    TEMPLATE_FILE: string
}

const env: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT ?? '3000', 10),
    WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL ?? 'info',
    WINSTON_LOG_PATH: process.env.WINSTON_LOG_PATH ?? 'logs',
    API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3000',
    API_VERSION: process.env.API_VERSION ?? 'v1',
    SAIA_API_HOST: process.env.SAIA_API_HOST ?? 'https://saia.3dlook.me/api/v2',
    SAIA_API_KEY: process.env.SAIA_API_KEY ?? '',
    SUPABASE_URL: process.env.SUPABASE_URL ?? '',
    SUPABASE_PUBLIC_API_KEY: process.env.SUPABASE_PUBLIC_API_KEY ?? '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    DATABASE_HOST: process.env.DATABASE_HOST ?? '',
    DATABASE_PORT: process.env.DATABASE_PORT ?? '',
    DATABASE_USER: process.env.DATABASE_USER ?? '',
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ?? '',
    DATABASE_NAME: process.env.DATABASE_NAME ?? '',
    MOCK_3DLOOK: process.env.MOCK_3DLOOK === 'true',
    APP_TOKEN: process.env.APP_TOKEN ?? '',
    TEMPLATE_FILE: process.env.TEMPLATE_FILE ?? 'order.xlsx',
}

for (const [key, value] of Object.entries(env)) {
    if (value === undefined || value === null || value === '') {
        throw new Error(`Environment variable is not defined: ${key}`)
    }
}

export default env
