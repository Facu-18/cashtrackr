import { createRequest, createResponse } from 'node-mocks-http'
import Budget from '../../../models/Budget';
import { validateBudgetExists, hasAccess } from '../../../middleware/budget';
import { budgets } from '../../mocks/budgets';

jest.mock('../../../models/Budget', () => ({
    findByPk: jest.fn()
}));


describe('Budget Middleware - validateBudgetExists', ()=>{
    it('should hanlde non-existent budget', async ()=>{
        (Budget.findByPk as jest.Mock).mockResolvedValue(null)
    
        const req = createRequest({
            params:{
                budgetId: 1
            }
        })
        
        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)
    
        expect(res.statusCode).toBe(404)
        const data = res._getJSONData()
        expect(data).toEqual({error: 'Presupuesto no encontrado'})
        expect(next).not.toHaveBeenCalled()
    })

    it('should handle existing budget and call next fuction', async()=>{
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0])
    
        const req = createRequest({
            params:{
                budgetId: 1
            }
        })
        
        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(req.budget).toEqual(budgets[0])
    })

    it('should hanlde non-existent budget and falling in the error', async ()=>{
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error)
    
        const req = createRequest({
            params:{
                budgetId: 1
            }
        })
        
        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)
    
        expect(res.statusCode).toBe(500)
        const data = res._getJSONData()
        expect(data).toEqual({error: 'Hubo un error'})
        expect(next).not.toHaveBeenCalled()
    })

})

describe ('Budget Middleware - hasAccess', ()=>{
    it('should call next() if a user has access to the budget', async()=>{
  
        const req = createRequest({
            budget: budgets[0],
            user: { id: 1 }
        })
        
        const res = createResponse()
        const next = jest.fn()

        hasAccess(req,res,next)
        
        expect(res.statusCode).not.toBe(401)
        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1);
    })

    it('should return 401 error if userId does not have acces to budget', async()=>{
  
        const req = createRequest({
            budget: budgets[0],
            user: { id: 2 }
        })
        
        const res = createResponse()
        const next = jest.fn()

        hasAccess(req,res,next)
        
        expect(res.statusCode).toBe(401)
        expect(next).not.toHaveBeenCalled()
        const data = res._getJSONData()
        expect(data).toEqual({error: 'Accion no válida'})
    })
})