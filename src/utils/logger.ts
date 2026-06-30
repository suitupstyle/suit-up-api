import util from 'node:util'
import { addColors, createLogger, format, Logger, Logform, transports } from 'winston'
import env from '../config/env'

const { combine, timestamp, ms, printf, colorize, prettyPrint, json, errors, splat } = format

const WINSTON_INTERNAL_KEYS = new Set(['level', 'message', 'timestamp', 'ms', 'stack', 'splat'])

function formatMessage(message: unknown): string {
    if (typeof message === 'object' && message !== null) {
        return util.format('%o', message)
    }
    return String(message)
}

function formatMetadata(info: Logform.TransformableInfo): string {
    const meta: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(info)) {
        if (typeof key === 'string' && !WINSTON_INTERNAL_KEYS.has(key)) {
            meta[key] = value
        }
    }

    if (Object.keys(meta).length === 0) {
        return ''
    }

    return util.inspect(meta, { depth: 4, colors: false, breakLength: Infinity })
}

addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    verbose: 'cyan',
    silly: 'magenta',
})

const sharedFormat = combine(errors({ stack: true }), splat())

const productionConsoleFormat = combine(sharedFormat, timestamp(), json())

const developmentConsoleFormat = combine(
    sharedFormat,
    colorize(),
    timestamp(),
    ms(),
    printf((info) => {
        const { timestamp: ts, level, message, ms: elapsed, stack } = info
        const formatted = formatMessage(message)
        const meta = formatMetadata(info)
        const base = `[${level}]: ${formatted} --${ts}-- ${elapsed}`
        const withMeta = meta ? `${base} ${meta}` : base
        if (stack && typeof stack === 'string') {
            return `${withMeta}\n${stack}`
        }
        return withMeta
    })
)

const fileFormat = combine(sharedFormat, json(), timestamp(), ms(), prettyPrint())

const consoleFormat = env.NODE_ENV === 'production' ? productionConsoleFormat : developmentConsoleFormat

const loggerTransports: Logger['transports'] = [new transports.Console({ format: consoleFormat })]

if (env.NODE_ENV !== 'production') {
    loggerTransports.push(
        new transports.File({
            filename: `${env.WINSTON_LOG_PATH}/combined.log`,
            level: 'info',
            format: fileFormat,
        })
    )
}

const logger: Logger = createLogger({
    level: env.WINSTON_LOG_LEVEL,
    transports: loggerTransports,
})

export default logger
