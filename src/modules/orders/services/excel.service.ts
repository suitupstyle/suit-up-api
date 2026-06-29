import ExcelJS, { type CellValue } from 'exceljs'
import { type ExcelCellUpdate, type ExcelGenerationJob } from '../../../types/definitions'

/**
 * Handles low-level Excel file operations
 */
export class ExcelService {
    /**
     * Generates Excel file from template with provided updates and returns it as a Buffer.
     * No local disk write — caller is responsible for persisting the buffer.
     * @param job - Generation job configuration
     * @returns Buffer containing the generated xlsx file
     * @throws Error when file operations fail
     */
    async generateFromTemplate(job: ExcelGenerationJob): Promise<Buffer> {
        // #region agent log H-B/H-C: memory before readFile
        const memBefore = process.memoryUsage()
        fetch('http://127.0.0.1:7863/ingest/f1df4b2f-bd4e-4cb9-bf44-4adbe45acdc4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3f027'},body:JSON.stringify({sessionId:'e3f027',hypothesisId:'H-B/H-C',location:'excel.service.ts:before-readFile',message:'heap before readFile',data:{templatePath:job.templatePath,heapUsedMB:Math.round(memBefore.heapUsed/1024/1024),heapTotalMB:Math.round(memBefore.heapTotal/1024/1024),rssMB:Math.round(memBefore.rss/1024/1024)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.readFile(job.templatePath)

        // #region agent log H-B: memory after readFile
        const memAfterRead = process.memoryUsage()
        fetch('http://127.0.0.1:7863/ingest/f1df4b2f-bd4e-4cb9-bf44-4adbe45acdc4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3f027'},body:JSON.stringify({sessionId:'e3f027',hypothesisId:'H-B',location:'excel.service.ts:after-readFile',message:'heap after readFile',data:{heapUsedMB:Math.round(memAfterRead.heapUsed/1024/1024),heapTotalMB:Math.round(memAfterRead.heapTotal/1024/1024),rssMB:Math.round(memAfterRead.rss/1024/1024),deltaHeapMB:Math.round((memAfterRead.heapUsed-memBefore.heapUsed)/1024/1024)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if (Array.isArray(job.updates)) {
            this.applyCellUpdates(workbook, job.updates)
        } else {
            this.applyBulkUpdates(workbook, job.updates)
        }

        const buf = await workbook.xlsx.writeBuffer() as unknown as Buffer

        // #region agent log H-E: memory after writeBuffer + buffer size
        const memAfterWrite = process.memoryUsage()
        fetch('http://127.0.0.1:7863/ingest/f1df4b2f-bd4e-4cb9-bf44-4adbe45acdc4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3f027'},body:JSON.stringify({sessionId:'e3f027',hypothesisId:'H-E',location:'excel.service.ts:after-writeBuffer',message:'heap after writeBuffer',data:{heapUsedMB:Math.round(memAfterWrite.heapUsed/1024/1024),heapTotalMB:Math.round(memAfterWrite.heapTotal/1024/1024),rssMB:Math.round(memAfterWrite.rss/1024/1024),bufferSizeKB:Math.round(buf.length/1024)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        return buf
    }

    /**
     * Applies discrete cell updates to workbook
     * @param workbook - ExcelJS workbook instance
     * @param updates - Array of cell updates
     */
    private applyCellUpdates(workbook: ExcelJS.Workbook, updates: ExcelCellUpdate[]): void {
        updates.forEach(({ sheetName, cellAddress, value }) => {
            const worksheet = workbook.getWorksheet(sheetName)
            if (!worksheet) {
                throw new Error(`Worksheet ${sheetName} not found`)
            }
            worksheet.getCell(cellAddress).value = value
        })
    }

    /**
     * Applies bulk updates using key-value pairs (sheet!cell format)
     * @param workbook - ExcelJS workbook instance
     * @param updates - Key-value pairs of updates
     */
    private applyBulkUpdates(workbook: ExcelJS.Workbook, updates: Record<string, unknown>): void {
        Object.entries(updates).forEach(([key, value]) => {
            const [sheetName, cellAddress] = key.split('!')
            if (!sheetName || !cellAddress) {
                throw new Error(`Invalid cell reference format: ${key}`)
            }
            const worksheet = workbook.getWorksheet(sheetName)
            if (!worksheet) {
                throw new Error(`Worksheet ${sheetName} not found`)
            }
            worksheet.getCell(cellAddress).value = value as CellValue
        })
    }
}
