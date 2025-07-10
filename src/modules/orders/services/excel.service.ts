import ExcelJS, { type CellValue } from 'exceljs';
import { type ExcelCellUpdate, type ExcelGenerationJob } from '../../../types/definitions';

/**
 * Handles low-level Excel file operations
 */
export class ExcelService {
  /**
   * Generates new Excel file from template with provided updates
   * @param job - Generation job configuration
   * @throws Error when file operations fail
   */
  async generateFromTemplate(job: ExcelGenerationJob): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(job.templatePath);

    if (Array.isArray(job.updates)) {
      this.applyCellUpdates(workbook, job.updates);
    } else {
      this.applyBulkUpdates(workbook, job.updates);
    }

    await workbook.xlsx.writeFile(job.outputPath);
  }

  /**
   * Applies discrete cell updates to workbook
   * @param workbook - ExcelJS workbook instance
   * @param updates - Array of cell updates
   */
  private applyCellUpdates(workbook: ExcelJS.Workbook, updates: ExcelCellUpdate[]): void {
    updates.forEach(({ sheetName, cellAddress, value }) => {
      const worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        throw new Error(`Worksheet ${sheetName} not found`);
      }
      worksheet.getCell(cellAddress).value = value;
    });
  }

  /**
   * Applies bulk updates using key-value pairs (sheet!cell format)
   * @param workbook - ExcelJS workbook instance
   * @param updates - Key-value pairs of updates
   */
  private applyBulkUpdates(workbook: ExcelJS.Workbook, updates: Record<string, unknown>): void {
    Object.entries(updates).forEach(([key, value]) => {
      const [sheetName, cellAddress] = key.split('!');
      if (!sheetName || !cellAddress) {
        throw new Error(`Invalid cell reference format: ${key}`);
      }
      const worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        throw new Error(`Worksheet ${sheetName} not found`);
      }
      worksheet.getCell(cellAddress).value = value as CellValue;
    });
  }
}