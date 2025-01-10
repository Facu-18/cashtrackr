import type { Request, Response } from "express"
import Budget from "../models/Budget"
import Expense from "../models/Expense"

export class BudgetController {
    static getAll = async (req: Request, res: Response) => {
        try{
            const budgets = await Budget.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                // TODO: Filtrar por el usuario autenticado
            })

            res.json(budgets)
        }catch(error){
            console.log(error)
            res.status(500).json({error: 'Error al crear el presupuesto'})
        }
    }

    static create = async (req: Request, res: Response) => {
        try{
            const budget = new Budget(req.body)
        
            await budget.save()
            res.status(201).json('Presupuesto creado correctamente')
        }catch(error){
            console.log(error)
            res.status(500).json({error: 'Error al crear el presupuesto'})
        }
    }

    static getById = async (req: Request, res: Response) => {
        const budget = await Budget.findByPk(req.budget.id,{
            include: [Expense]
        })
        res.json(budget)
    }

    static updateById = async (req: Request, res: Response) => {
        // Escribir los cambios
        await req.budget.update(req.body)
        res.json('Presupuesto actualizado correctamente')
    }

    static deleteById = async (req: Request, res: Response) => {
        // Eliminar presupuesto
        await req.budget.destroy()
        res.json('presupuesto eliminado correctamente')
    }
}