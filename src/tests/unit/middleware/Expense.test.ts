import { createRequest, createResponse } from 'node-mocks-http'
import { validateExpenseExists } from '../../../middleware/expense'
import Expense from '../../../models/Expense'
import { expenses } from '../../mocks/expense'
import { hasAccess } from '../../../middleware/budget'
import { budgets } from '../../mocks/budgets'

jest.mock('../../../models/Expense', ()=>({
    findByPk: jest.fn()
}))

describe('Expense Middleware - validateExpenseExists', ()=>{
    beforeEach(()=>{
        (Expense.findByPk as jest.Mock).mockImplementation((id)=>{
            const expense = expenses.filter( e => e.id === id)[0] ?? null
            return Promise.resolve(expense)
        })
    })
    
    it('should handle a non-existent budget', async()=>{
        const req = createRequest({
            params: { expenseId: 120 }
        });
        const res = createResponse()
        const next = jest.fn()

        await validateExpenseExists(req, res, next)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(404)
        expect(data).toEqual({error: 'Gasto no encontrado'})
        expect(next).not.toHaveBeenCalled()
    })

    it('should call next middleware if expense exists', async()=>{
        const req = createRequest({
            params: { expenseId: 1 }
        });
        const res = createResponse()
        const next = jest.fn()

        await validateExpenseExists(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(req.expense).toEqual(expenses[0])
    })

    it('should hanlde internal server error', async()=>{
        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error)
        
        const req = createRequest({
            params: { expenseId: 1 }
        });
        const res = createResponse()
        const next = jest.fn()

        await validateExpenseExists(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(500)
        const data = res._getJSONData()
        expect(data).toEqual({error: 'Error al crear el Gasto'})
    })

    it('should prevent unauthorized users form adding expenses', async()=>{
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            budget: budgets[0],
            user: { id: 20 },
            body: {name: 'Expense Test', amount: 100}
        })
        const res = createResponse()
        const next = jest.fn()

        hasAccess(req,res,next)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(401)
        expect(data).toEqual({error: 'Accion no válida'})
        expect(next).not.toHaveBeenCalled()
    })
})