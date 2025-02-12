import type { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        
        const { email, password } = req.body
        
        // Evitar duplicados
        const userExist = await User.findOne({where: {email}})
        if(userExist){
            const error = new Error('Ya existe un usuario con ese email')
            res.status(409).json({error: error.message})
            return;
        }
        
        try{
            const user = await User.create(req.body)
            user.password = await hashPassword(password)
            const token = generateToken()
            user.token = token;
            
            if(process.env.NODE_ENV !== 'production'){
                globalThis.cashtrackrConfirmationToken = token
            }

            await user.save()
            
            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })

            res.status(201).json('Cuenta creada correctamente')   
        }catch (error){
            console.log(error)
            res.status(500).json({error : 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body

        const user = await User.findOne({where: {token}})
        if(!user){
            const error = new Error('Token no válido')
            res.status(401).json({error: error.message})
            return;
        } 
        user.confirm = true
        user.token = null
        await user.save()

        res.json('Cuenta Confirmada Correctamente')
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body
        
        // Verificar si el usuario existe
        const user = await User.findOne({where: {email}})
        if(!user){
            const error = new Error('Usuario no encontrado')
            res.status(404).json({error: error.message})
            return;
        }
        
        if(!user.confirm){
            const error = new Error('Debes confirmar la cuenta')
            res.status(403).json({error: error.message})
            return;
        }

        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect){
            const error = new Error('La contraseña es incorrecta')
            res.status(401).json({error: error.message})
            return;
        }

        const token= generateJWT(user.id)
        res.json(token)
    }

    static forgotPassowrd = async (req: Request, res: Response) => {
        const { email } = req.body
        
        // Verificar si el usuario existe
        const user = await User.findOne({where: {email}})
        if(!user){
            const error = new Error('Usuario no encontrado')
            res.status(404).json({error: error.message})
            return;
        }
        user.token = generateToken()
        await user.save()

        await AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.json('Reevisa tu email y sigue las instrucciones')

    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body

        const tokenExists = await User.findOne({where: {token: req.body.token}})
        if(!tokenExists){
            const error = new Error('Token no válido')
            res.status(404).json({error: error.message})
            return;
        }
        
        res.json('Token Válido')

    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({where: {token}})
        if(!user){
            const error = new Error('Token no válido')
            res.status(404).json({error: error.message})
            return;
        }
        
        // Asignar el nuevo password
        user.password = await hashPassword(password)
        user.token = null
        await user.save()

        res.json('La contraseña se actualizo correctamente')
    }

    static user = async (req: Request, res: Response) => {
       res.json(req.user)
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body
        const { id } = req.user
        const user = await User.findByPk(id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if(!isPasswordCorrect){
            const error = new Error('La contraseña actual no es correcta')
            res.status(401).json({error: error.message})
            return;
        }

       user.password = await hashPassword(password)
       await user.save()

       res.json('La contraseña se cambio correctamente')
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body
        const { id } = req.user
        const user = await User.findByPk(id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect){
            const error = new Error('La contraseña no es correcta')
            res.status(401).json({error: error.message})
            return;
        }

       res.json('Contraseña correcta')
    }

    static updateUser = async (req: Request, res: Response) => {
        const { name, email } = req.body
        const { id } = req.user
        const user = await User.findByPk(id)

        try{
            const userExist = await User.findOne({where: {email}})
            if(userExist && userExist.id !== id){
                const error = new Error('El correo ya esta registrado por otro usuario')
                res.status(409).json({error: error.message})
                return;
            }

            await user.update({email, name}, {where: {id}})
            res.json('Perfil actualizado correctamente')
        }catch(error){
            console.log(error)
        }
    }

}