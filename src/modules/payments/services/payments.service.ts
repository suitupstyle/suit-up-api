import { HttpError } from '../../../utils/error'
import { stripe } from '../../../utils/stripe'
import { CreatePaymentIntentInput } from '../interfaces/create-payment-intent-input'

export class PaymentService {
    async createPaymentIntent(input: CreatePaymentIntentInput): Promise<string> {
        try {
            const intent = await stripe.paymentIntents.create({
                amount: input.amount,
                currency: input.currency ?? 'usd',
                payment_method_types: ['card', 'alipay'],
                metadata: input.metadata,
            })

            return intent.client_secret!
        } catch (err: any) {
            const message = err.raw?.message ?? err.message ?? 'PaymentIntent creation failed'
            const status = err.statusCode ?? 502
            throw new HttpError(status, message)
        }
    }

    handleWebhookSignature(payload: Buffer, signature: string, webhookSecret: string) {
        try {
            return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
        } catch (err: any) {
            throw new HttpError(400, `Webhook Error: ${err.message}`)
        }
    }
}
