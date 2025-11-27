import { Router } from 'express'
import petController from '../controllers/PetController.js'
import loginRequired from '../middlewares/loginRequired.js'

const router = new Router()

router.post('/', loginRequired, petController.store)
router.get('/', loginRequired, petController.index)
router.get('/:id', loginRequired, petController.show)
router.put('/:id', loginRequired, petController.update)
router.delete('/:id', loginRequired, petController.delete)

export default router
