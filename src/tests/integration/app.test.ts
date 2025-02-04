import request from 'supertest'
import server from '../../server'
import { AuthController } from '../../controllers/AuthController'
import User from '../../models/User'
import * as authUtils from '../../utils/auth'
import * as jwtUtils from '../../utils/jwt'

describe('Authentication - Create Account', () => {
    it('should display validation errors when form is empty', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({})
        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(3)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('should return 400 status code when the email is invalid', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": "Facu",
                "password": "12345678",
                "email": "not_valid_email"
            })
        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('El email no es válido')
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('should return 400 status code when the password is lees than 8 characteres', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": "Facu",
                "password": "1234",
                "email": "email@email.com"
            })
        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('La contraseña debe tener un mínimo de 8 caracteres')
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('should return 201 status code when the data is correct', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": "Facu",
                "password": "password",
                "email": "test@test.com"
            })
        expect(response.status).toBe(201)
        expect(response.status).not.toBe(400)
        expect(response.body).not.toHaveProperty('errors')
    })

    it('should return 409 confilct when a user is already registered', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": "Facu",
                "password": "password",
                "email": "test@test.com"
            })


        expect(response.status).toBe(409)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Ya existe un usuario con ese email')
        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('errors')
    })
})

describe('Authentication - Account Confirmartion with Token', () => {
    it('should display error if token is empty or token is not valid', async () => {
        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({
                token: "not_valid"
            })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Token no válido')
    })

    it('should display error if token doesnt exists', async () => {
        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({
                token: "123456"
            })

        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Token no válido')
        expect(response.status).not.toBe(200)
    })

    it('should confirm account with a valid token', async () => {
        const token = globalThis.cashtrackrConfirmationToken

        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({ token })

        expect(response.status).toBe(200)
        expect(response.body).toBe('Cuenta Confirmada Correctamente')
        expect(response.status).not.toBe(400)
    })
})

describe('Authentication - Login', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display validation errors when the form is empty', async () => {
        const response = await request(server)
            .post('/api/auth/login')
            .send({})

        const loginMock = jest.spyOn(AuthController, 'login')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(2)
        expect(loginMock).not.toHaveBeenCalled()
    })

    it('should return 400 status code bad request when te email is invalid', async () => {
        const response = await request(server)
            .post('/api/auth/login')
            .send({
                "password": "password",
                "email": "not_valid"
            })

        const loginMock = jest.spyOn(AuthController, 'login')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('El email no es válido')
        expect(loginMock).not.toHaveBeenCalled()
    })

    it('should return a 400 error if the user is not found', async () => {
        const response = await request(server)
            .post('/api/auth/login')
            .send({
                "password": "password",
                "email": "user_not_found@test.com"
            })

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Usuario no encontrado')

        expect(response.status).not.toBe(200)
    })

    it('should return a 403 error if the user account is not confirmed', async () => {
        (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue({
            id: 1,
            confirm: false,
            password: 'hashedPassoword',
            email: 'user_not_confirmed@test.com'
        })

        const response = await request(server)
            .post('/api/auth/login')
            .send({
                "password": "password",
                "email": "user_not_confirmed@test.com"
            })

        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Debes confirmar la cuenta')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)
    })

    it('should return a 403 error if the user account is not confirmed', async () => {
        const userData = {
            name: "Test",
            email: "user_not_confirmed@test.com",
            password: "password",
        }

        await request(server).post('/api/auth/create-account').send(userData)

        const response = await request(server)
            .post('/api/auth/login')
            .send({
                "password": userData.password,
                "email": userData.email
            })

        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Debes confirmar la cuenta')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)
    })

    it('should return a 401 error if the password is incorrect', async () => {
        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue({
            id: 1,
            confirm: true,
            password: 'hashedPassoword',
        })

        const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(false)

        const response = await request(server)
            .post('/api/auth/login')
            .send({
                "password": "wrongPassword",
                "email": "test@test.com"
            })

        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('La contraseña es incorrecta')
        expect(findOne).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledTimes(1)

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(403)
    })

    it('should return a jwt', async () => {
        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue({
            id: 1,
            confirm: true,
            password: 'hashedPassoword',
        })

        const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(true)
        const generateJWT = jest.spyOn(jwtUtils, 'generateJWT').mockReturnValue('jwt_token')

        const response = await request(server)
            .post('/api/auth/login')
            .send({
                "password": "password",
                "email": "test@test.com"
            })

        expect(response.status).toBe(200)
        expect(response.body).toEqual('jwt_token')
        expect(findOne).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledWith('password', 'hashedPassoword')
        expect(generateJWT).toHaveBeenCalledTimes(1)
        expect(generateJWT).toHaveBeenCalledWith(1)
    })
})

let jwt: string
async function authenticateUser() {
    const response = await request(server)
        .post('/api/auth/login')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
    jwt = response.body
    expect(response.status).toBe(200)
}

describe('GET /api/budgets', () => {

    beforeAll(() => {
        jest.restoreAllMocks() // restaurar las funciones de los jest.spy a su implementación original
    })

    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unauthenticatd access to budgets without a jwt', async () => {
        const response = await request(server)
            .get('/api/budgets')

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No se proporcionó token de autenticación')
    })

    it('should reject unauthenticatd access to budgets without a valid jwt', async () => {
        const response = await request(server)
            .get('/api/budgets')
            .auth('not_valid', { type: 'bearer' })
        expect(response.status).toBe(500)
        expect(response.body.error).toBe('Token no válido')
    })

    it('should allow authenticated access to budgets with a valid jwt', async () => {
        const response = await request(server)
            .get('/api/budgets')
            .auth(jwt, { type: 'bearer' })

        expect(response.body).toHaveLength(0)
        expect(response.status).not.toBe(401)
        expect(response.body.error).not.toBe('No se proporcionó token de autenticación')
    })

})

describe('POST /api/budgets', () => {

    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unauthenticatd post request to budgets without a jwt', async () => {
        const response = await request(server)
            .post('/api/budgets')

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No se proporcionó token de autenticación')
    })

    it('should display validation when the form is submitted with invalid data', async () => {
        const response = await request(server)
            .post('/api/budgets')
            .auth(jwt, { type: 'bearer' })
            .send({})

        expect(response.status).toBe(400)
        expect(response.body.errors).toHaveLength(4)
    })

    it('should return 201 status code if the form is submitted with valid data', async () => {
        const response = await request(server)
            .post('/api/budgets')
            .auth(jwt, { type: 'bearer' })
            .send({
                name: 'budget test',
                amount: 100
            })

        expect(response.status).toBe(201)
        expect(response.body).toBe('Presupuesto creado correctamente')
    })
})

describe('GET /api/budgets/:id', ()=>{
    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unauthenticatd get request to budget id without a jwt', async () => {
        const response = await request(server)
            .get('/api/budgets/1')

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No se proporcionó token de autenticación')
    })

    it('should return 400 bad request when id is not valid ', async () => {
        const response = await request(server)
            .get('/api/budgets/not_valid')
            .auth(jwt, {type :'bearer'})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('El id no es valido')
        expect(response.status).not.toBe(401)
        expect(response.body.error).not.toBe('No se proporcionó token de autenticación')
    })

    it('should return 404 bad request when if not exist ', async () => {
        const response = await request(server)
            .get('/api/budgets/3000')
            .auth(jwt, {type :'bearer'})

        expect(response.status).toBe(404)
        expect(response.body.error).toBe('Presupuesto no encontrado')
        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(400)
    })

    it('should return a single budget by id ', async () => {
        const response = await request(server)
            .get('/api/budgets/1')
            .auth(jwt, {type :'bearer'})

        expect(response.status).toBe(200)
        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(404)
    })
})

describe('PUT /api/budgets/:id', ()=>{
    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unauthenticatd put request to budget id without a jwt', async () => {
        const response = await request(server)
            .put('/api/budgets/1')

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No se proporcionó token de autenticación')
    })

    it('should display validation erros if the form is empty', async () => {
        const response = await request(server)
            .put('/api/budgets/1')
            .auth(jwt, {type :'bearer'})
            .send({})

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeTruthy()
        expect(response.body.errors).toHaveLength(4)
    })

    it('should update a budget by id and return a succes message', async () => {
        const response = await request(server)
            .put('/api/budgets/1')
            .auth(jwt, {type :'bearer'})
            .send({
                name: 'Test Budget Update',
                amount: 1000
            })

        expect(response.status).toBe(200)
        expect(response.body).toBe('Presupuesto actualizado correctamente')
    })
})

describe('DELETE /api/budgets/:id', ()=>{
    beforeAll(async () => {
        await authenticateUser()
    })

    it('should reject unauthenticatd put request to budget id without a jwt', async () => {
        const response = await request(server)
            .delete('/api/budgets/1')

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No se proporcionó token de autenticación')
    })

    it('should return 404 not found when a budget doesnt exists', async () => {
        const response = await request(server)
            .delete('/api/budgets/3000')
            .auth(jwt, {type :'bearer'})

        expect(response.status).toBe(404)
        expect(response.body.error).toBe('Presupuesto no encontrado')
    })

    it('should delete a budget and return a succes message', async () => {
        const response = await request(server)
            .delete('/api/budgets/1')
            .auth(jwt, {type :'bearer'})

        expect(response.status).toBe(200)
        expect(response.body).toBe('presupuesto eliminado correctamente')
    })
})