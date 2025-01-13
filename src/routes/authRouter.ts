import { Router } from 'express'
import { body } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'

const router = Router()

router.post('/create-account', 
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña debe tener un mínimo de 8 caracteres'),
    body('email')
        .isEmail().withMessage('El email no es válido'),
handleInputErrors,       
AuthController.createAccount)

export default router