import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import prismaClient from "../Prisma/PrismaClient";



async function adminMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
    const autorizacao = req.headers.authorization;

    if(!autorizacao) {
        return res.status(401).json({
            erro: "Token não informado"
        });
    }
    const [, token] = autorizacao.split(" ")

    if (!token) {
        return res.status(401).json({
            erro: "Token inválido"
        })
    }

    const decoded = verify(
        token,
        process.env.JWT_SECRETO as string
    ) as {
        sub?: string;
    };

    if (!decoded.sub) {
        return res.status(401).json({
            erro: "Token inválido"
        });
    }

    const id_usuarios = Number(decoded.sub);

    const usuario = await prismaClient.usuario.findUnique({
        where: {
            id_usuarios
        },
        select: {
            id_usuarios: true,
            tipo: true
        }
    })

    if (!usuario) {
        return res.status(401).json({
            erro: "Usuário não encontrado"
        });
    }

    if (usuario.tipo !== "ADMINISTRADOR") {
        return res.status(403).json({
            erro: "Acesso permitido somente para Administradores"
        });

    }

    next ();


    } catch (err) {
    return res.status(401).json({
        erro: "Token inválido ou expirado"
    });
    } 
} 

export { adminMiddleware };