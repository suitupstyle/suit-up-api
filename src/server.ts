import app from './app'
import env from './config/env'
import { AppDataSource } from './database/data-source'
import logger from './utils/logger'

AppDataSource.initialize()
    .then(() => {
        logger.info('Data Source has been initialized!')

        app.listen(env.PORT, () => {
            logger.info(`Server running on port ${env.PORT}`)
            // #region agent log H-A/H-C
            const m = process.memoryUsage()
            logger.info('[dbg:e3f027] startup', { hyp: 'H-A/H-C', heapUsedMB: Math.round(m.heapUsed/1024/1024), heapTotalMB: Math.round(m.heapTotal/1024/1024), rssMB: Math.round(m.rss/1024/1024), execArgv: process.execArgv, nodeVersion: process.version })
            // #endregion
        })
    })
    .catch((err) => {
        logger.error('Data Source initialization failed:', err)
        process.exit(1)
    })
