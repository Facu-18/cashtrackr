import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    message: {"error": 'Alcanzaste el limite de intentos, porfavor intenta de nuevo más tarde.'}
})