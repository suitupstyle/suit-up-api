import util from 'node:util'
import { addColors, createLogger, format, Logger, transports } from 'winston'
import env from '../config/env'

const { combine, timestamp, ms, printf, colorize, prettyPrint, json } = format

function formatMessage(message: unknown): string {
    if (typeof message === 'object' && message !== null) {
        return util.format('%o', message)
    }
    return String(message)
}

addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    verbose: 'cyan',
    silly: 'magenta',
})

const consoleFormat = combine(
    colorize(),
    timestamp(),
    ms(),
    printf(({ timestamp, level, message, ms: elapsed }) => {
        const formatted = formatMessage(message)
        return `[${level}]: ${formatted} --${timestamp}-- ${elapsed}`
    })
)

const fileFormat = combine(json(), timestamp(), ms(), prettyPrint())

const logger: Logger = createLogger({
    level: env.WINSTON_LOG_LEVEL,
    transports: [
        new transports.Console({ format: consoleFormat }),
        new transports.File({
            filename: `${env.WINSTON_LOG_PATH}/combined.log`,
            level: 'info',
            format: fileFormat,
        }),
    ],
})

export default logger
