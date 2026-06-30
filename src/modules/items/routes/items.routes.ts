import { Router } from 'express'

import { listItems } from '../controllers/items.controller'

const router = Router()

/**
 * @openapi
 * /items:
 *   get:
 *     summary: Retrieve a paginated list of items
 *     tags:
 *       - Items
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of items with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse_ItemList'
 *       500:
 *         description: Internal server error
 */
router.get('/', listItems)

export default router
