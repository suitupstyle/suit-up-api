import ExcelJS from 'exceljs'

export const readExcelFile = async (filePath: string) => {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    return workbook
}
