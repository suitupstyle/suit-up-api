import { Router } from 'express'
import { listItems } from '../controllers/items.controller'

const router = Router()

router.get('/', listItems)

export default router
