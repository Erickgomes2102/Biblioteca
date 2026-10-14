import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prismaClient from "../Prisma/PrismaClient";

interface Payload {
    sub: string;
}

declare global {
    namespace Express {
        interface Request {
            usuarioId: string;
        }
    }
}

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            Dados: "Token não existe"
        });
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
        return res.status(401).json({
            Dados: "Token Inválido"
        });
    }

    try {
        const { sub } = jwt.verify(
            token,
            process.env.JWT_SECRETO as string
        ) as Payload;

        if (!sub || !/^\d+$/.test(sub)) {
            return res.status(401).json({
                Dados: "Token Inválido"
            });
        }

        req.usuarioId = sub;

        const usuario = await prismaClient.usuario.findUnique({
            where: {
                id_usuarios: Number(sub)
            },
            select: {
                id_usuarios: true,
                ativo: true
            }
        });

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({
                Dados: "Usuário inativo ou não autenticado"
            });
        }

        return next();

    } catch (err) {
        console.log("Erro ao validar token:", err);

        return res.status(401).json({
            Dados: "Token Inválido"
        });
    }
}