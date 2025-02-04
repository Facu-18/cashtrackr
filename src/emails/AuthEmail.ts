import { transport } from "../config/nodemailer"

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async(user: EmailType) =>{
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTrackr - Confirma tu cuenta',
            html: `<p>¡Hola ${user.name}!</p> 
            <p>Para confirmar tu cuenta Visitia el siguiente enlace:</p>
            <a href='#'>Confirmar cuenta</a>
            <p> e ingreas el codigo:<b>${user.token}</b></p>`
        })
        
        // console.log('Mensaje enviado', email.messageId)
    
    }

    static sendPasswordResetToken = async(user: EmailType) =>{
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTrackr - Recupera tu contraseña',
            html: `<p>¡Hola ${user.name}!</p> 
            <p>Para recuperar tu contraseña</p> 
            <p>Visitia el siguiente enlace:</p>
            <a href='#'>Reestablecer contraseña</a>
            <p> e ingreas el codigo:<b>${user.token}</b></p>`
        })
        
        // console.log('Mensaje enviado', email.messageId)
    
    }
}