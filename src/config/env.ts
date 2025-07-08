import dotenv from 'dotenv'

dotenv.config()

interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test'
    PORT: number
    WINSTON_LOG_LEVEL: string
    WINSTON_LOG_PATH: string
    API_VERSION: string
    SAIA_API_KEY: string
    SUPABASE_URL: string
    SUPABASE_KEY: string
    STRIPE_PUBLISHABLE_KEY: string
    STRIPE_SECRET_KEY: string
    DATABASE_HOST: string
    DATABASE_PORT: string
    DATABASE_USER: string
    DATABASE_PASSWORD: string
    DATABASE_NAME: string
    MOCK_3DLOOK: boolean
}

const env: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT ?? '3000', 10),
    WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL ?? 'info',
    WINSTON_LOG_PATH: process.env.WINSTON_LOG_PATH ?? 'logs',
    API_VERSION: process.env.API_VERSION ?? 'v1',
    SAIA_API_KEY: process.env.SAIA_API_KEY ?? '',
    SUPABASE_URL: process.env.SUPABASE_URL ?? '',
    SUPABASE_KEY: process.env.SUPABASE_KEY ?? '',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
    DATABASE_HOST: process.env.DATABASE_HOST ?? '',
    DATABASE_PORT: process.env.DATABASE_PORT ?? '',
    DATABASE_USER: process.env.DATABASE_USER ?? '',
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ?? '',
    DATABASE_NAME: process.env.DATABASE_NAME ?? '',
    MOCK_3DLOOK: process.env.MOCK_3DLOOK === 'true',
}

for (const [key, value] of Object.entries(env)) {
    if (value === undefined || value === null || value === '') {
        throw new Error(`Environment variable is not defined: ${key}`)
    }
}

export default env
