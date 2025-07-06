import { Router } from 'express'
import { createPreorder, measurePreorder } from '../controllers/preorders.controller'

const router = Router()

router.post('/', createPreorder)
router.post('/:id/measure', measurePreorder)

export default router
