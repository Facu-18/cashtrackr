import { Router } from 'express'
import { body, param } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'
import { limiter } from '../config/limiter'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(limiter)

router.post('/create-account', 
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña debe tener un mínimo de 8 caracteres'),
    body('email')
        .isEmail().withMessage('El email no es válido'),
    handleInputErrors,       
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token')
        .notEmpty().isLength({min:6 , max:6}).withMessage('Token no válido'),
    handleInputErrors,    
    AuthController.confirmAccount
)

router.post('/login',
    body('email')
        .isEmail().withMessage('El email no es válido'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    handleInputErrors,
    AuthController.login
)

router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('El email no es válido'),
    handleInputErrors,
    AuthController.forgotPassowrd    
)

router.post('/validate-token',
    body('token')
        .notEmpty().isLength({min:6 , max:6}).withMessage('Token no válido'),
    handleInputErrors,    
    AuthController.validateToken   
)

router.post('/reset-password/:token',
    param('token')
        .notEmpty().isLength({min:6 , max:6}).withMessage('Token no válido'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña debe tener un mínimo de 8 caracteres'),
    handleInputErrors,
    AuthController.resetPasswordWithToken
)

router.get('/user', 
    authenticate,
    AuthController.user
)

router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('Debes indicar tu contraseña actual'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña nueva es muy corta, debe tener un mínimo de 8 caracteres'),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('Debes indicar tu contraseña actual'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router