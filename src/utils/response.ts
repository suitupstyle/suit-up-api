export interface SuccessResponse<T> {
    data: T
    meta?: Record<string, unknown>
}
