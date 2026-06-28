import env from '../../../config/env'
import { HttpError } from '../../../utils/error'
import logger from "../../../utils/logger";
import { stripe } from '../../../utils/stripe'
import { CreatePaymentIntentDTO } from '../validations/create‑payment-intent.schema'

export class PaymentService {
    // ---------------------------------------------------------------------------
    // Payment Intent flow
    // ---------------------------------------------------------------------------
    async createPaymentIntent(input: CreatePaymentIntentDTO): Promise<string> {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: input.amount,
                currency: input.currency ?? 'usd',
                metadata: {
                    order_id: input.orderId.toString(),
                },
                // Omitting payment_method_types enables dynamic payment methods
                // (Stripe auto-selects based on currency, location, amount, etc.)
            })

            return paymentIntent.client_secret!
        } catch (err: any) {
            const message = err.raw?.message ?? err.message ?? 'PaymentIntent creation failed'
            const status = err.statusCode ?? 502

            throw new HttpError(status, message)
        }
    }

    // ---------------------------------------------------------------------------
    // Checkout Session flow (kept for potential future use)
    // ---------------------------------------------------------------------------
    async createCheckoutSession(input: CreatePaymentIntentDTO): Promise<string> {
        try {
            const session = await stripe.checkout.sessions.create({
                ui_mode: 'embedded_page',
                mode: 'payment',
                return_url: `${env.FRONTEND_BASE_URL}/orders/payment-confirmation?session_id={CHECKOUT_SESSION_ID}`,
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

            return session.client_secret!;
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
