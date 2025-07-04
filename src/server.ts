import app from './app'
import { AppDataSource } from './utils/data-source'
import logger from './utils/logger'

const PORT = process.env.PORT ?? 3000

AppDataSource.initialize()
    .then(() => {
        logger.info('Data Source has been initialized!')

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`)
        })
    })
    .catch((err) => {
        logger.error('Data Source initialization failed:', err)
        process.exit(1)
    })
