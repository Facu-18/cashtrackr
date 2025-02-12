import { body, param, validationResult } from "express-validator"
import { Request, Response, NextFunction } from 'express'
import Expense from "../models/Expense"

declare global {
    namespace Express {
        interface Request {
            expense?: Expense
        }
    }
}

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

export const validateExpenseExists =  async (req: Request, res: Response, next: NextFunction) => {
    const { expenseId } = req.params
    try{
        const expense = await Expense.findByPk(expenseId)

        if(!expense){
            const error = new Error('Gasto no encontrado')
            res.status(404).json({error: error.message})
            return;
        }
        req.expense = expense
        
        next()
    }catch(error){
        console.log(error)
        res.status(500).json({error: 'Error al crear el Gasto'})
    }
   
}

export const belongsToBudget = async (req: Request, res: Response, next: NextFunction) => {

    if(req.budget.id !== req.expense.budgetId){
        const error = new Error('Gasto no pertenece a este presupuesto')
        return res.status(403).json({error: error.message})
    }

    next()
}