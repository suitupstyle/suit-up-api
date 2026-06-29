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

        const { error } = await supabaseAdmin.storage
            .from(job.storageBucket)
            .upload(job.storageKey, buffer, {
                contentType: XLSX_CONTENT_TYPE,
                upsert: true,
            })

        if (error) {
            logger.error(`Supabase Storage upload failed for ${job.storageKey}: ${error.message}`)
            throw new Error(`Storage upload failed: ${error.message}`)
        }

        logger.info(`Successfully uploaded to Supabase Storage: ${job.storageBucket}/${job.storageKey}`)
    }
}
