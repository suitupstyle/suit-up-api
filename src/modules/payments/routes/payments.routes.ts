import { Router } from 'express'
import { createPaymentIntent } from '../controllers/payments.controller'

const router = Router()

router.post('/create-intent', createPaymentIntent)

export default router
