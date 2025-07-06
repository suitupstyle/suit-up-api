export interface SuccessResponse<T> {
    data: T
    meta?: Record<string, unknown>
}

export interface ErrorResponse {
    error: {
        code?: number
        message: string
    }
}
