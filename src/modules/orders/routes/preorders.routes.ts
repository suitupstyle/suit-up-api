import { Router } from 'express'
import { createPreorder } from '../controllers/preorders.controller'

const router = Router()

router.post('/', createPreorder)

export default router
