# Airwallex operations

How to pair SuitUp with Airwallex after the Stripe cutover. Payment code lives in the API PaymentIntent + webhook path and the web Drop-in; this file is env, dashboard, and hosting only.

## Environment pairing

Use one pair end to end. Mixing sandbox API with `prod` Drop-in (or the reverse) fails checkout.

| Role | Sandbox | Production |
| --- | --- | --- |
| API `AIRWALLEX_BASE_URL` | `https://api.sandbox.airwallex.com` | `https://api.airwallex.com` |
| Web `NEXT_PUBLIC_AIRWALLEX_ENV` | `demo` | `prod` |
| Tax | API `TAX_RATE=0.08` | Web `NEXT_PUBLIC_TAX_RATE=0.08` (same value) |

There is no Airwallex publishable key. Drop-in uses `NEXT_PUBLIC_AIRWALLEX_ENV` only.

API also needs `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY`, and `AIRWALLEX_WEBHOOK_SECRET`. `FRONTEND_BASE_URL` must be the real checkout origin (PaymentIntent `return_url`).

## Airwallex web app

1. Create an **account-level** API key with Payment Acceptance **Write** (includes Read). If the key is linked to multiple accounts, login must send `x-login-as` with the payments account ID (Settings → Account details), not the org ID. Single-account keys omit it.
2. Payments → Payment methods: keep **Card** enabled. Drop-in is already limited to `methods: ['card']`.
3. Developer → Webhooks → New webhook:
   - Notification URL: `https://<api-host>/api/v1/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.cancelled`
4. Copy that notification URL’s secret into `AIRWALLEX_WEBHOOK_SECRET`. Each webhook URL has its own secret. Local development needs a public tunnel to the same path on port 3000.

Dashboard “test event” buttons may sign with a `client-secret-key` header instead of the webhook secret; a real sandbox payment is the reliable check.

## Render (`suit-up-api`)

[`render.yaml`](../render.yaml) declares Airwallex keys as `sync: false`. Updating the Blueprint does **not** fill secrets on an existing service.

In the Render Dashboard for `suit-up-api`:

1. Set `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY`, `AIRWALLEX_WEBHOOK_SECRET`, and `AIRWALLEX_BASE_URL` (sandbox or live URL from the table above).
2. Confirm `TAX_RATE` is `0.08` and `FRONTEND_BASE_URL` is the live web origin.
3. Delete `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.

Redeploy after the env change.

## Web host

The frontend README lists Vercel or Netlify. Set:

- `NEXT_PUBLIC_AIRWALLEX_ENV` — `demo` or `prod` to match the API base URL
- `NEXT_PUBLIC_TAX_RATE=0.08`

If a gitignored `.env.prod` (or host env) still has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, remove it and use `NEXT_PUBLIC_AIRWALLEX_ENV=prod` instead.

## Local leftovers

API `.env` / `.env.local` may still contain unused `STRIPE_*` lines; they are no longer read. You can delete them. Do not commit those files.
