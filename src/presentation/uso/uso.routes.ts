import { Router } from 'express'
import { UsoController } from './uso.controller'

const router = Router()
const ctrl = new UsoController()

router.get('/uso', (req, res) => ctrl.getUsage(req, res))

export { router as usoRoutes }
