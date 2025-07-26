import app from './app'
import env from './config/env'
import { AppDataSource } from './database/data-source'
import logger from './utils/logger'

AppDataSource.initialize()
    .then(() => {
        logger.info('Data Source has been initialized!')

        app.listen(env.PORT, () => {
            logger.info(`Server running on port ${env.PORT}`)
        })
    })
    .catch((err) => {
        logger.error('Data Source initialization failed:', err)
        process.exit(1)
    })
