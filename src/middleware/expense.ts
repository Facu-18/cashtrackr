import { body, param, validationResult } from "express-validator"
import { Request, Response, NextFunction } from 'express'

export const validateExpenseInput =  async (req: Request, res: Response, next: NextFunction) => {
    
    await body('name')
        .notEmpty().withMessage('el nombre del gasto es obligatorio')
        .run(req)
    await body('amount')
        .notEmpty().withMessage(' debes indicar la cantidad del gasto')
        .isNumeric().withMessage('La cantidad no es valida')
        .custom(value => value > 0).withMessage('El gasto debe ser mayor a 0')
        .run(req)
        
    next()
}

export const validateExpenseId =  async (req: Request, res: Response, next: NextFunction) => {
    await param('expenseId')
        .isInt()
        .custom(value=> value > 0)
        .withMessage('ID no válido')
        .run(req)

        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
            return
        }    

    next()
}