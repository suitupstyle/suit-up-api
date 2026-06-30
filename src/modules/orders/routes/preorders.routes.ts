import { Router } from 'express'

import { validate } from '../../../middlewares/validate'
import {
    createPreorder,
    measurePreorder,
    updatePreorder,
} from '../controllers/preorders.controller'
import { CreatePreorderSchema } from '../validators/create‑preorder.schema'
import { MeasurePreorderSchema } from '../validators/measure‑preorder.schema'
import { UpdatePreorderSchema } from '../validators/update‑preorder.schema'

const router = Router()

/**
 * @openapi
 * /preorders:
 *   post:
 *     summary: Create a new preorder (items only)
 *     tags:
 *       - Preorders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemIds
 *             properties:
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of existing item IDs
 *     responses:
 *       201:
 *         description: The newly created preorder
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse_Preorder'
 *       422:
 *         description: Invalid item IDs provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/', validate(CreatePreorderSchema), createPreorder)

/**
 * @openapi
 * /preorders/{id}/measure:
 *   post:
 *     summary: Attach images and run 3DLOOK measurement
 *     tags:
 *       - Preorders
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Preorder UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeasurePreorderInput'
 *     responses:
 *       200:
 *         description: Updated preorder with measurementData
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse_Preorder'
 *       400:
 *         description: Missing or invalid images
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErrorResponse'
 *       404:
 *         description: Preorder not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErrorResponse'
 *       502:
 *         description: 3DLOOK integration failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ErrorResponse'
 */
router.post('/:id/measure', validate(MeasurePreorderSchema), measurePreorder)

/**
 * @openapi
 * /preorders/{id}:
 *   put:
 *     summary: Update an existing preorder’s metadata or images
 *     tags:
 *       - Preorders
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Preorder UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeasurePreorderInput'
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/SuccessResponse_Preorder'
 *       400:
 *         $ref: '#/components/responses/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.put('/:id', validate(UpdatePreorderSchema), updatePreorder)

export default router
