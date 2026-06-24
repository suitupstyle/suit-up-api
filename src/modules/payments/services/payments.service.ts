import { HttpError } from '../../../utils/error'
import { stripe } from '../../../utils/stripe'
import { CreatePaymentIntentDTO } from '../validations/create‑payment-intent.schema'

export class PaymentService {
    async createCheckoutSession(input: CreatePaymentIntentDTO): Promise<string> {
        try {
            const session = await stripe.checkout.sessions.create({
                ui_mode: 'elements',
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: input.currency ?? 'usd',
                            product_data: { name: 'Suit Order' },
                            unit_amount: input.amount,
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    order_id: input.orderId.toString(),
                },
            })

            return session.client_secret!
        } catch (err: any) {
            const message = err.raw?.message ?? err.message ?? 'Checkout session creation failed'
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
