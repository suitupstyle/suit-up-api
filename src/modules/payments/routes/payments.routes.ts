import { Router } from 'express'

import { validate } from '../../../middlewares/validate'
import { createPaymentIntent } from '../controllers/payments.controller'
import { CreatePaymentIntentSchema } from '../validations/create‑payment-intent.schema'

const router = Router()

/**
 * @openapi
 * /payments/create-payment-intent:
 *   post:
 *     summary: Create an Airwallex PaymentIntent
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentIntentInput'
 *     responses:
 *       '201':
 *         description: The PaymentIntent was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     intentId:
 *                       type: string
 *                       description: Airwallex PaymentIntent id used by Drop-in as intent_id.
 *                     clientSecret:
 *                       type: string
 *                       description: The client_secret used to confirm payment via Drop-in on the frontend.
 *                     currency:
 *                       type: string
 *                       description: ISO 4217 currency code of the PaymentIntent (e.g. USD).
 *       '409':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '422':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.post('/create-payment-intent', validate(CreatePaymentIntentSchema), createPaymentIntent)

export default router
