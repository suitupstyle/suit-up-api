/**
 * Represents a single cell update operation in an Excel file
 */
export interface ExcelCellUpdate {
    sheetName: string
    cellAddress: string
    value: string | number | Date | boolean
}

/**
 * Configuration for Excel file generation job
 */
export interface ExcelGenerationJob {
    templatePath: string
    /** Supabase Storage bucket name */
    storageBucket: string
    /** Object key within the bucket, e.g. "orders/order-1.xlsx" */
    storageKey: string
    updates: ExcelCellUpdate[] | Record<string, unknown>
    metadata?: Record<string, unknown>
}

/**
 * Queue status information
 */
export interface QueueStatus {
    pendingJobs: number
    isProcessing: boolean
    lastProcessed?: Date
}
