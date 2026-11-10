# Single suit: USD 479.99 before tax

The `items.price` database value is the source of truth for the storefront and
new orders. The seed now inserts 479.99. Migration
`1794268800000-UpdateSingleSuitPrice` updates existing catalog rows named
`Black Professional Business Suit`; it does not rewrite existing orders.

## Tax setup remains unresolved

The seller is the Shanghai WFOE, as specified by the owner. The existing 8%
code default is not a verified tax treatment for that entity. Do not deploy
this price rollout until its accountant-confirmed checkout treatment is set
in both API `TAX_RATE` and web `NEXT_PUBLIC_TAX_RATE`. Export and domestic
sales may require different treatment; this application currently has one
global rate and does not determine tax from the shipping destination.
Airwallex merchant entity configuration must also be verified in the account.

## Production rollout

1. Deploy the API changes and run `pnpm build` followed by
   `pnpm migration:run:prod` with the production database environment configured.
   Do not rerun the item seed against production: it inserts duplicate products.
2. Verify `GET /api/v1/items` returns `479.99` for the intended suit. If the live
   product has been renamed, identify its ID and adjust the migration before
   running it. Other products are intentionally untouched.
3. Deploy the companion web change (aligned demo fixtures). Live storefront
   pricing already comes from `/items`; checkout and confirmation use the
   order's API-supplied `pricingData.price`.
4. Create a fresh single-suit order and confirm the API subtotal and UI show
   USD 479.99. Keep API `TAX_RATE` and web `NEXT_PUBLIC_TAX_RATE` equal.
   For arithmetic testing only, 8% yields USD 38.40 tax and a USD 518.39 total.
   This example is not a tax recommendation for the WFOE.
5. In an Airwallex sandbox checkout, confirm the payment intent has that same
   total and USD currency, then verify the payment confirmation. No Airwallex
   catalog price ID needs changing: this API sends the stored order price plus
   tax directly when creating a payment intent.

Existing orders and already-created payment intents retain their quoted amounts.
Use a new order to receive the new price. Paid orders must never be repriced.
The migration rollback restores this product to USD 439.00 only if its current
catalog price is still USD 479.99; it does not undo a later price change.

## Verification

`pnpm test` builds the API and exercises the real order and payment services
with stubbed database/payment adapters. It covers the seed price, PostgreSQL
decimal strings, quantities, tax rounding, the Airwallex request, and existing
orders. It makes no external payment requests.
