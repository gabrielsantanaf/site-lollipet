import { Router } from 'express'
import prontuarioArquivoController from '../controllers/ProntuarioArquivoController.js'
import loginRequired from '../middlewares/loginRequired.js'

const router = new Router()

// Permite desabilitar checagem de auth em dev definindo DISABLE_AUTH=true no .env
const authMiddleware = process.env.DISABLE_AUTH === 'true' ? (req, res, next) => next() : loginRequired

// Rotas para operações em arquivos individuais
router.get('/:id/download', authMiddleware, prontuarioArquivoController.download)
router.delete('/:id', authMiddleware, prontuarioArquivoController.remove)

export default router
