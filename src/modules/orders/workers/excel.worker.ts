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

        // #region agent log H-F: log exact bucket/key before upload
        logger.info('[dbg:e3f027] pre-upload', { hyp: 'H-F', bucket: job.storageBucket, key: job.storageKey, bufferByteLength: buffer.byteLength })
        // #endregion

        const { data, error } = await supabaseAdmin.storage
            .from(job.storageBucket)
            .upload(job.storageKey, buffer, {
                contentType: XLSX_CONTENT_TYPE,
                upsert: true,
            })

        // #region agent log H-F: log full Supabase upload response
        logger.info('[dbg:e3f027] post-upload', { hyp: 'H-F', bucket: job.storageBucket, key: job.storageKey, data, errorMessage: error?.message ?? null, errorName: (error as any)?.error ?? null, statusCode: (error as any)?.statusCode ?? null })
        // #endregion

        if (error) {
            logger.error(`Supabase Storage upload failed for ${job.storageKey}: ${error.message}`)
            throw new Error(`Storage upload failed: ${error.message}`)
        }

        logger.info(`Successfully uploaded to Supabase Storage: ${job.storageBucket}/${job.storageKey}`)
    }
}
