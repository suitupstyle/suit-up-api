import { Router } from 'express'
import { validate } from '../../../middlewares/validate'
import { createPaymentIntent } from '../controllers/payments.controller'
import { CreatePaymentIntentSchema } from '../validations/create‑payment-intent.schema'

const router = Router()

/**
 * @openapi
 * /payments/create-intent:
 *   post:
 *     summary: Create a new Stripe PaymentIntent
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
router.post('/create-intent', validate(CreatePaymentIntentSchema), createPaymentIntent)

export default router
