import { Router } from 'express'
import clienteController from '../controllers/ClienteController.js'
import loginRequired from '../middlewares/loginRequired.js'

const router = new Router()

router.post('/', loginRequired, clienteController.store)
router.get('/', loginRequired, clienteController.index)
router.get('/:id', loginRequired, clienteController.show)
router.put('/:id', loginRequired, clienteController.update)
router.delete('/:id', loginRequired, clienteController.delete)

export default router
