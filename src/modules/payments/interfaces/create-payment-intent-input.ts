export interface CreatePaymentIntentInput {
    amount: number
    currency?: string
    metadata?: Record<string, string>
}
