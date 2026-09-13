# Airwallex QA checklist

Walk this list against sandbox. Pair `AIRWALLEX_BASE_URL=https://api.sandbox.airwallex.com` with `NEXT_PUBLIC_AIRWALLEX_ENV=demo`. Create a **new PaymentIntent** for every card attempt.

Local webhooks need a public tunnel to `http://localhost:3000/api/v1/payments/webhook`. Test cards: [Airwallex test card numbers](https://www.airwallex.com/docs/payments/test-and-go-live/test-card-numbers).

## Error UI (no card required)

| Step | Action | Expect |
| --- | --- | --- |
| `/` | Stop the API, reload the landing page | Banner: can't reach the SuitUp API. Pre-Order is disabled until **Try again** after the API is back. |
| `/` | API up, then fail the preorder create (e.g. API down after items loaded) | Banner with the API/network message. Button says **Try again**, not **Error**. |
| `/orders/instructions` | Upload a file that is not JPEG/PNG/WebP or is over 2 MB | Banner: Use a JPEG, PNG, or WebP under 2 MB. |
| `/orders/instructions` | Submit without both photos | Banner: Please upload both front and side pictures. |
| `/orders/instructions` | Height/weight below API minimums (e.g. 0) | Banner shows the API validation messages (e.g. `` `height` must be at least 150 cm ``), not `Request failed (422)`. |
| `/orders/instructions` | Unclear/unusable photos that 3DLOOK rejects | Banner shows the API message (e.g. photos could not be processed), not `Request failed (422)`. |

## Payments (walk together)

| Case | Card (sandbox) | Expect |
| --- | --- | --- |
| Success | `4035501000000008` (any future expiry/CVC) | Drop-in `success` → `/orders/payment-confirmation`. Webhook `payment_intent.succeeded`. Order `is_paid`. Excel queued. |
| 3DS challenge | `4012000300000088`, OTP `1234` | Completes after the challenge. |
| 3DS fail | `4012000300000013` | Drop-in error banner. Order stays unpaid. |
| Webhook replay | Re-send `payment_intent.succeeded` from the Airwallex dashboard | Idempotent (`is_paid` already true). No second Excel job. |

Also confirm `/orders/details` and measurement Save on `/orders/confirmation` show the shared red banner if those API calls fail.
