import app from './app'
import env from './config/env'
import { AppDataSource } from './database/data-source'
import logger from './utils/logger'

AppDataSource.initialize()
    .then(() => {
        logger.info('Data Source has been initialized!')

        app.listen(env.PORT, () => {
            logger.info(`Server running on port ${env.PORT}`)
            // #region agent log H-A/H-C: baseline memory + node flags at startup
            const m = process.memoryUsage()
            fetch('http://127.0.0.1:7863/ingest/f1df4b2f-bd4e-4cb9-bf44-4adbe45acdc4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3f027'},body:JSON.stringify({sessionId:'e3f027',hypothesisId:'H-A/H-C',location:'server.ts:listen',message:'server started - baseline memory + node flags',data:{heapUsedMB:Math.round(m.heapUsed/1024/1024),heapTotalMB:Math.round(m.heapTotal/1024/1024),rssMB:Math.round(m.rss/1024/1024),execArgv:process.execArgv,nodeVersion:process.version},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
        })
    })
    .catch((err) => {
        logger.error('Data Source initialization failed:', err)
        process.exit(1)
    })
