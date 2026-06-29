import { ExcelService } from '../services/excel.service'
import { type ExcelGenerationJob } from '../../../types/definitions'
import { supabaseAdmin } from '../../../utils/supabase'
import { AppDataSource } from '../../../database/data-source'
import { Order } from '../entities/order'
import logger from '../../../utils/logger'

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/**
 * Processes individual Excel generation jobs
 */
export class ExcelWorker {
    constructor(private readonly excelService: ExcelService) {}

    /**
     * Executes a single Excel generation job: generates the workbook in memory,
     * uploads it to Supabase Storage, and persists the public URL on the Order record.
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

        const orderId = job.metadata?.orderId as number | undefined
        if (orderId) {
            const { data: urlData } = supabaseAdmin.storage
                .from(job.storageBucket)
                .getPublicUrl(job.storageKey)

            const orderRepo = AppDataSource.getRepository(Order)
            await orderRepo.update(orderId, { excelUrl: urlData.publicUrl })

            // #region agent log H-F: verify URL saved to order
            logger.info(`[dbg:e3f027] excelUrl saved orderId=${orderId} url=${urlData.publicUrl}`)
            // #endregion
        }
    }
}
