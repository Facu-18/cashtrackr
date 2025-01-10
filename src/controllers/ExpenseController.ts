import type { Request, Response } from 'express'
import Expense from '../models/Expense'

export class ExpensesController {
    
    static create = async (req: Request, res: Response) => {
        try{
            const expense = new Expense(req.body)
            expense.budgetId = req.budget.id
            await expense.save()
            res.status(201).json('Gasto agregado correctamente')
        }catch(error){
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }
  
    static getById = async (req: Request, res: Response) => {

    }

    static updateById = async (req: Request, res: Response) => {
 
    }
  
    static deleteById = async (req: Request, res: Response) => {

    }
}