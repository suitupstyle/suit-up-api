import { Router } from 'express'
import { verifyAppToken } from '../../../middlewares/verifyAppToken'
import { createOrder, listOrders } from '../controllers/orders.controller'

const router = Router()

router.get('/', verifyAppToken, listOrders)
router.post('/', createOrder)

export default router
