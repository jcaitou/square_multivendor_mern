import { Router } from 'express'
const router = Router()
import {
  getAllContractsVendor,
  getContract,
  getAllContractsAdm,
  createContract,
  startContract,
} from '../controllers/contractController.js'
import { validateIdParam } from '../middleware/validationMiddleware.js'
import { authorizePermissions } from '../middleware/authMiddleware.js'

router.route('/').get(getAllContractsVendor)

router
  .route('/adm/')
  .get([authorizePermissions('admin'), getAllContractsAdm])
  .post([authorizePermissions('admin'), createContract])

router
  .route('/adm/start/:id') //saved /adm/:id route for editContract in case we ever need it
  .post(validateIdParam('Contract'), [
    (authorizePermissions('admin'), startContract),
  ])
router.route('/:id').get(validateIdParam('Contract'), getContract)
export default router
