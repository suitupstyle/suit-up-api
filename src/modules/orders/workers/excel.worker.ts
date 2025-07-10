import { ExcelService } from '../services/excel.service';
import { type ExcelGenerationJob } from '../../../types/definitions';

/**
 * Processes individual Excel generation jobs
 */
export class ExcelWorker {
  constructor(private readonly excelService: ExcelService) { }

  /**
   * Executes a single Excel generation job
   * @param job - Job to process
   * @returns Promise that resolves when job completes
   */
  async processJob(job: ExcelGenerationJob): Promise<void> {
    try {
      await this.excelService.generateFromTemplate(job);
      console.log(`Successfully generated: ${job.outputPath}`);
    } catch (error) {
      console.error(`Failed to process job: ${error}`);
      throw error;
    }
  }
}