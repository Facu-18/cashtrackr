import { Request, Response, NextFunction } from 'express'
import { validationResult, param, body } from 'express-validator'
import Budget from '../models/Budget'

declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}

export const validateBudgetId =  async (req: Request, res: Response, next: NextFunction) => {

    await param('budgetId')
    .isInt().withMessage('El id no es valido')
    .custom(value => value > 0).withMessage('ID no válido')
    .run(req)

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

export const validateBudgetExists =  async (req: Request, res: Response, next: NextFunction) => {
    const { budgetId } = req.params
    try{
        const budget = await Budget.findByPk(budgetId)

        if(!budget){
            const error = new Error('Presupuesto no encontrado')
            res.status(404).json({error: error.message})
            return;
        }
        req.budget = budget
        
        next()
    }catch(error){
        console.log(error)
        res.status(500).json({error: 'Error al crear el presupuesto'})
    }
   
}

export const validateBudgetInput =  async (req: Request, res: Response, next: NextFunction) => {
    
    await body('name')
        .notEmpty().withMessage('el nombre del presupuesto es obligatorio')
        .run(req)
    await body('amount')
        .notEmpty().withMessage(' debes indicar la cantidad del presupuesto')
        .isNumeric().withMessage('La cantidad no es valida')
        .custom(value => value > 0).withMessage('El presupuesto debe ser mayor a 0')
        .run(req)
        
    next()
}