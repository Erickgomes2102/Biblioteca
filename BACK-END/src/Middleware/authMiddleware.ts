import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"

interface Payload {
    sub: string
}

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization

    if (!authHeader) { return res.status(401).json({
        Dados: 'Token não existe'
    })
}

    const [, token] = authHeader.split(" ")

    if (!token) {
        return res.status(401).json({ Dados: 'Token Inválido' })
    } 

    try {
    const { sub } = jwt.verify( token, process.env.JWT_SECRETO as string) as Payload

    req.usuarioId = sub 

    return next()
    } catch (err) {
        console.log("Erro ao validar token:", err)


            return res.status(401).json({
            Dados: "Token Inválido"
        })
        
    }
}