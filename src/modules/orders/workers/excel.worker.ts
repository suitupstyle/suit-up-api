import { ExcelService } from '../services/excel.service'
import { type ExcelGenerationJob } from '../../../types/definitions'
import { supabaseAdmin } from '../../../utils/supabase'
import logger from '../../../utils/logger'

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/**
 * Processes individual Excel generation jobs
 */
export class ExcelWorker {
    constructor(private readonly excelService: ExcelService) {}

    /**
     * Executes a single Excel generation job: generates the workbook in memory
     * and uploads it to Supabase Storage (no local disk writes).
     * @param job - Job to process
     */
    async processJob(job: ExcelGenerationJob): Promise<void> {
        const buffer = await this.excelService.generateFromTemplate(job)

        // #region agent log H-F: exact bucket/key + buffer size
        logger.info(`[dbg:e3f027] pre-upload bucket=${job.storageBucket} key=${job.storageKey} bufferBytes=${buffer.byteLength}`)
        // #endregion

        const { data, error } = await supabaseAdmin.storage
            .from(job.storageBucket)
            .upload(job.storageKey, buffer, {
                contentType: XLSX_CONTENT_TYPE,
                upsert: true,
            })

        // #region agent log H-F: full Supabase upload response inline
        logger.info(`[dbg:e3f027] post-upload data=${JSON.stringify(data)} error=${JSON.stringify(error)}`)
        // #endregion

        if (error) {
            logger.error(`Supabase Storage upload failed for ${job.storageKey}: ${error.message}`)
            throw new Error(`Storage upload failed: ${error.message}`)
        }

        // #region agent log H-F: verify file exists after upload
        const { data: listData, error: listError } = await supabaseAdmin.storage
            .from(job.storageBucket)
            .list('', { search: job.storageKey })
        logger.info(`[dbg:e3f027] post-list found=${JSON.stringify(listData?.map(f => f.name))} listError=${JSON.stringify(listError)}`)
        // #endregion

        logger.info(`Successfully uploaded to Supabase Storage: ${job.storageBucket}/${job.storageKey}`)
    }
}
