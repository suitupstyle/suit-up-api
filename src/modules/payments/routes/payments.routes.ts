import express, { Router } from 'express'
import { createPaymentIntent, handleWebhook } from '../controllers/payments.controller'

const router = Router()

router.post('/create-intent', express.json(), createPaymentIntent)

export default router
