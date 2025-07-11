import { ExcelWorker } from '../workers/excel.worker'
import { type ExcelGenerationJob, type QueueStatus } from '../../../types/definitions'
import { ExcelService } from '../services/excel.service'
import logger from '../../../utils/logger'

/**
 * Manages Excel generation queue with singleton pattern
 */
class ExcelQueue {
    private readonly worker: ExcelWorker
    private queue: ExcelGenerationJob[] = []
    private isProcessing = false
    private lastProcessed?: Date

    constructor() {
        this.worker = new ExcelWorker(new ExcelService())
    }

    /**
     * Adds new job to processing queue
     * @param job - Excel generation job
     */
    async addJob(job: ExcelGenerationJob): Promise<void> {
        this.queue.push(job)
        if (!this.isProcessing) {
            this.processQueue()
        }
    }

    /**
     * Processes jobs sequentially from the queue
     */
    private async processQueue(): Promise<void> {
        if (this.queue.length === 0) {
            this.isProcessing = false
            return
        }

        this.isProcessing = true
        const job = this.queue.shift()

        if (job) {
            try {
                await this.worker.processJob(job)
                this.lastProcessed = new Date()
            } catch (error) {
                logger.error('Job processing error:', error)
            } finally {
                // Process next job with minimal delay
                setImmediate(() => this.processQueue())
            }
        }
    }

    /**
     * Gets current queue status
     * @returns Queue status information
     */
    getStatus(): QueueStatus {
        return {
            pendingJobs: this.queue.length,
            isProcessing: this.isProcessing,
            lastProcessed: this.lastProcessed,
        }
    }
}

// Singleton export pattern
export const excelQueue = new ExcelQueue()
