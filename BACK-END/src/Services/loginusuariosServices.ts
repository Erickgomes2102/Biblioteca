import prismaClient from "../Prisma/PrismaClient";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

interface LogarUsuarios {
    email: string,
    senha: string
}

class LogarUsuariosServices {
    async logarUsuarios({ email, senha }: LogarUsuarios) {

        const emailExiste = await prismaClient.usuario.findFirst({
            where: {
                email: email
            }
        })
        if (!emailExiste)
            throw new Error('Email Incorreto')
        const senhaCrypt = await compare(senha, emailExiste.senha)
        if (!senhaCrypt) throw new Error('Senha Incorreta')

        const token = sign({
            id: emailExiste.id_usuarios,
            nome: emailExiste.nome,
            email: emailExiste.email
        },
            process.env.JWT_SECRETO as string, {
            subject: emailExiste.id_usuarios.toString(),
            expiresIn: "8h"
        }
        )
            return {

                usuario: {
                    id: emailExiste.id_usuarios,
                    nome: emailExiste.nome,
                    email: emailExiste.email
                },
                token
            }

    }
}

export {LogarUsuariosServices} 
 