import { Router } from 'express'
const router = Router()
import {
  getAllContractsVendor,
  getContract,
  getAllContractsAdm,
  createContract,
  startContract,
} from '../controllers/contractController.js'
import {
  validateRegisterInput,
  validateLoginInput,
  validatePasswordInput,
  validatePasswordUpdateInput,
  validateContractIdParam,
} from '../middleware/validationMiddleware.js'
import {
  authorizePermissions,
  authenticateUser,
} from '../middleware/authMiddleware.js'

router.route('/').get(getAllContractsVendor)

router
  .route('/adm/')
  .get([authorizePermissions('admin'), getAllContractsAdm])
  .post([authorizePermissions('admin'), createContract])

router
  .route('/adm/start/:id') //saved /adm/:id route for editContract in case we ever need it
  .post([authorizePermissions('admin'), startContract])
router.route('/:id').get(validateContractIdParam, getContract)
export default router
