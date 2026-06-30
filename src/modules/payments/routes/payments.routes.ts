import { Router } from 'express'

import { validate } from '../../../middlewares/validate'
import { createCheckoutSession, createPaymentIntent } from '../controllers/payments.controller'
import { CreatePaymentIntentSchema } from '../validations/create‑payment-intent.schema'

const router = Router()

/**
 * @openapi
 * /payments/create-payment-intent:
 *   post:
 *     summary: Create a Stripe PaymentIntent
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
 *                     clientSecret:
 *                       type: string
 *                       description: The client_secret used to confirm payment via the Payment Element on the frontend.
 *       '422':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.post('/create-payment-intent', validate(CreatePaymentIntentSchema), createPaymentIntent)

/**
 * @openapi
 * /payments/create-checkout-session:
 *   post:
 *     summary: Create a new Stripe Checkout Session
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
 *                     clientSecret:
 *                       type: string
 *                       description: The client_secret to confirm the payment on the frontend.
 *       '422':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.post('/create-checkout-session', validate(CreatePaymentIntentSchema), createCheckoutSession)

export default router
