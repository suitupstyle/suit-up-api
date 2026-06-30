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

        const { error } = await supabaseAdmin.storage
            .from(job.storageBucket)
            .upload(job.storageKey, buffer, {
                contentType: XLSX_CONTENT_TYPE,
                upsert: true,
            })

        if (error) {
            logger.error('Supabase Storage upload failed', {
                storageKey: job.storageKey,
                storageBucket: job.storageBucket,
                orderId: job.metadata?.orderId,
                errorMessage: error.message,
            })
            throw new Error(`Storage upload failed: ${error.message}`)
        }

        logger.info('Successfully uploaded to Supabase Storage', {
            storageKey: job.storageKey,
            storageBucket: job.storageBucket,
            orderId: job.metadata?.orderId,
        })

        const orderId = job.metadata?.orderId as number | undefined
        if (orderId) {
            const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 10 // 10 years

            const { data: signedData, error: signError } = await supabaseAdmin.storage
                .from(job.storageBucket)
                .createSignedUrl(job.storageKey, SIGNED_URL_TTL_SECONDS)

            if (signError || !signedData?.signedUrl) {
                logger.error('Failed to create signed URL for order', {
                    orderId,
                    storageKey: job.storageKey,
                    storageBucket: job.storageBucket,
                    errorMessage: signError?.message,
                })
                return
            }

            const orderRepo = AppDataSource.getRepository(Order)
            await orderRepo.update(orderId, { excelUrl: signedData.signedUrl })
            logger.info('Excel URL saved for order', { orderId })
        }
    }
}
