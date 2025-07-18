import { HttpError } from '../../../utils/error'
import { stripe } from '../../../utils/stripe'
import { CreatePaymentIntentDTO } from '../validations/create‑payment-intent.schema'

export class PaymentService {
    async createPaymentIntent(input: CreatePaymentIntentDTO): Promise<string> {
        try {
            const intent = await stripe.paymentIntents.create({
                amount: input.amount,
                currency: input.currency ?? 'usd',
                payment_method: input.paymentMethodId,
                confirm: true,
                off_session: true,
                metadata: {
                    order_id: input.orderId.toString(),
                },
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
