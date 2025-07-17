import { MeasurementData } from './measurement-data'

export interface MeasurePreorderInput {
    gender: 'male' | 'female'
    height: number
    weight: number
    frontImage: string
    sideImage: string
    measurementData?: MeasurementData
}
