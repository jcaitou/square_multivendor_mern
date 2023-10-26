import { Router } from 'express'
import { register, login, logout } from '../controllers/authController.js'
import {
  validateRegisterInput,
  validateLoginInput,
} from '../middleware/validationMiddleware.js'

const router = Router()

router.post('/orders', function (req, res) {
  console.log('-------------- New Request --------------')
  console.log('Headers:' + JSON.stringify(req.headers, null, 3))
  console.log('Body:' + JSON.stringify(req.body, null, 3))
  res.json({ message: 'Thank you for the message' })
})
router.get('/orders', function (req, res) {
  res.json({ message: 'get req' })
})

export default router
