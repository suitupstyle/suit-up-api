import { Router } from 'express'
import { validate } from '../../../middlewares/validate'
import { verifyAppToken } from '../../../middlewares/verifyAppToken'
import { createOrder, wasPaidOrder, listOrders } from '../controllers/orders.controller'
import { CreateOrderSchema } from '../validators/create‑order.schema'

const router = Router()

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Retrieve a paginated list of orders
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A paginated list of orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse_OrderList'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErrorResponse'
 */
router.get('/', verifyAppToken, listOrders)

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create a new order from a preorder
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *       201:
 *         description: The newly created order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse_Order'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Preorder not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: External integration failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validate(CreateOrderSchema), createOrder)

/**
 * @openapi
 * /orders/{id}/is-paid:
 *   get:
 *     summary: Check if an order has been paid
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the order
 *     responses:
 *       200:
 *         description: Returns whether the order is paid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *                   description: true if paid, otherwise false
 *               required:
 *                 - data
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErrorResponse'
 */
router.get('/:id/is-paid', wasPaidOrder)

export default router
