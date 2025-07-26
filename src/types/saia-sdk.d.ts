declare module '@3dlook/saia-sdk' {
    import { AxiosInstance } from 'axios'

    /** Configuration for the main SDK entry point */
    export interface SAIAConfig {
        key: string
        host?: string
    }

    /** Main SDK class */
    export class SAIA {
        /**
         * Exposed API namespaces
         * - person: create/get/update persons
         * - queue: poll tasks
         * - mtmClient: manage MTM clients
         * - product: product lookups & recommendations
         * - sizechart: brand size charts
         */
        public api: {
            person: Person
            queue: Queue
            mtmClient: MTMClient
            product: Product
            sizechart: Sizechart
        }

        constructor(config: SAIAConfig)
    }

    /** Convert File/Blob to base64 (browser) */
    export function getBase64(file: File | Blob): Promise<string>

    /** Extract filename from a Blob */
    export function getFileName(blob: Blob): string

    /** Extract error message from a task list */
    export function getTaskError(tasks: any[]): string

    // ──────────────────────────────────────────────────────────────

    /** Person operations */
    export class Person {
        constructor(host: string, axiosInstance?: AxiosInstance)

        /**
         * Create a new Person or kick off measurements
         * - with metadata only → returns personId
         * - with images → returns taskSetId
         */
        create(params: {
            gender: string
            height: number
            weight?: string
            measurementsType?: string
            hasVirtualTryOn?: boolean
            product?: any
            frontImage?: string // Base64
            sideImage?: string // Base64
            deviceCoordinates?: {
                frontPhoto?: { betaX: number; gammaY: number; alphaZ: number }
                sidePhoto?: { betaX: number; gammaY: number; alphaZ: number }
            }
            photoFlowType?: string
        }): Promise<string | number>

        /** Get full Person record */
        get(id: string | number): Promise<any>

        /** Full or partial update */
        update(
            id: string | number,
            params: Partial<{
                gender: string
                height: number
                weight: string
                frontImage: string
                sideImage: string
                measurementsType: string
                hasVirtualTryOn: boolean
                product: any
                deviceCoordinates: any
                photoFlowType: string
            }>
        ): Promise<any>

        /** Update & start calculation in one call */
        updateAndCalculate(
            id: string | number,
            params: {
                frontImage?: string
                sideImage?: string
                measurementsType?: string
                hasVirtualTryOn?: boolean
                product?: any
            }
        ): Promise<string | number>

        /** Manually trigger calculation */
        calculate(id: string | number, hasVirtualTryOn?: boolean, product?: any): Promise<string>

        /** Virtual try‑on for a specific product */
        virtualTryOn(id: string | number, product: any): Promise<any>
    }

    // ──────────────────────────────────────────────────────────────

    /** Queue operations for polling results */
    export class Queue {
        constructor(host: string, axiosInstance?: AxiosInstance)

        /** Get taskset info */
        get(id: string | number): Promise<any>

        /** Poll until results are ready */
        getResults(id: string | number, delay?: number, personId?: string | number): Promise<any>
    }

    // ──────────────────────────────────────────────────────────────

    /** MTMClient operations (Customer management) */
    export class MTMClient {
        constructor(host: string, axiosInstance?: AxiosInstance)

        /** Create a new MTM client */
        create(params: {
            firstName: string
            lastName?: string
            unit: string
            phone?: string
            email?: string
            source?: string
            notes?: string
            widgetId?: string
        }): Promise<number>

        /** Update an existing MTM client */
        update(
            mtmClientId: number,
            params: Partial<{
                firstName: string
                lastName: string
                unit: string
                phone: string
                email: string
                source: string
                notes: string
                widgetId: string
            }>
        ): Promise<number>

        /**
         * Create a Person for a MTM client
         * - with metadata → returns personId
         * - with images → returns taskSetId
         */
        createPerson(
            mtmClientId: number,
            params: {
                gender: string
                height: number
                weight?: string
                frontImage?: string
                sideImage?: string
                measurementsType?: string
                hasVirtualTryOn?: boolean
                product?: any
                deviceCoordinates?: any
                photoFlowType?: string
            }
        ): Promise<string | number>
    }

    // ──────────────────────────────────────────────────────────────

    /** Product operations */
    export class Product {
        constructor(host: string, axiosInstance?: AxiosInstance)

        /** Fetch product(s) by URL */
        get(url: string): Promise<any>

        /** Get size recommendations (legacy) */
        getSize(params: {
            height: number
            gender: string
            hips: number
            chest: number
            waist: number
            url: string
        }): Promise<any>

        /** Get size recommendations (new) */
        getRecommendations(params: {
            gender: string
            hips: number
            chest: number
            waist: number
            url: string
        }): Promise<any>
    }

    // ──────────────────────────────────────────────────────────────

    /** Sizechart operations */
    export class Sizechart {
        constructor(host: string, axiosInstance?: AxiosInstance)

        getSize(params: {
            gender: string
            hips: number
            chest: number
            waist: number
            body_part: string
            brand: string
            customRecommendation?: string
        }): Promise<any>
    }
}
