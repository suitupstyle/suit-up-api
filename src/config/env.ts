import dotenv from 'dotenv'

dotenv.config()

interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test'
    PORT: number
    WINSTON_LOG_LEVEL: string
    STRIPE_PUBLISHABLE_KEY: string | undefined
    STRIPE_SECRET_KEY: string | undefined
}

const env: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT ?? '3000', 10),
    WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL ?? 'info',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
}

for (const [key, value] of Object.entries(env)) {
    if (value === undefined || value === null || value === '') {
        throw new Error(`Environment variable is not defined: ${key}`)
    }
}

export default env
