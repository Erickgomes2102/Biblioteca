import prismaClient from "../Prisma/PrismaClient";
import { hash } from "bcryptjs";

interface cadastrarUsuario {
    nome: string,
    email: string,
    senha: string,
    tipo: string
}

interface editarUsuarios {
    nome?: string,
    email?: string,
    senha?: string,
    tipo?: string
}

class usuariosServices {

    async criarUsuario({
        nome,
        email,
        senha,
        tipo
    }: cadastrarUsuario) {

        if (tipo !== "BIBLIOTECÁRIO" && tipo !== "ADMINISTRADOR") {
            throw new Error("O tipo deve ser BIBLIOTECÁRIO ou ADMINISTRADOR");
        }

        const usuarioExistente = await prismaClient.usuario.findUnique({
            where: {
                email
            }
        });

        if (usuarioExistente) {
            throw new Error("Email já cadastrado");
        }

        const senhaHash = await hash(senha, 8)

        const usuario = await prismaClient.usuario.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                tipo
            }
        });

        return usuario;
    }

    async listarUsuarios() {

        const usuarios = await prismaClient.usuario.findMany({
            orderBy: {
                nome: "asc"
            }
        });

        return usuarios;
    }

    async buscarUsuarioPorId(id_usuarios: number) {

        const usuario = await prismaClient.usuario.findUnique({
            where: {
                id_usuarios
            }
        });

        if (!usuario) {
            throw new Error("Usuário não encontrado");
        }

        return usuario;
    }

    async buscarUsuarioPorEmail(email: string) {

        const usuario = await prismaClient.usuario.findUnique({
            where: {
                email
            }
        });

        if (!usuario) {
            throw new Error("Usuário não encontrado");
        }

        return usuario;
    }

    async editarUsuario(
        id_usuarios: number,
        dados: editarUsuarios
    ) {

        const usuario = await prismaClient.usuario.findUnique({
            where: {
                id_usuarios
            }
        });

        if (!usuario) {
            throw new Error("Usuário não encontrado");
        }

        if (dados.tipo !== undefined) {

            if (
                dados.tipo !== "BIBLIOTECÁRIO" &&
                dados.tipo !== "ADMINISTRADOR"
            ) {
                throw new Error("O tipo deve ser BIBLIOTECÁRIO ou ADMINISTRADOR");
            }
        }

        if (dados.email !== undefined) {

            const emailExistente = await prismaClient.usuario.findFirst({
                where: {
                    email: dados.email,
                    NOT: {
                        id_usuarios
                    }
                }
            });

            if (emailExistente) {
                throw new Error("Email já cadastrado em outro usuário");
            }
        }

        const usuarioAtualizado = await prismaClient.usuario.update({
            where: {
                id_usuarios
            },
            data: dados
        });

        return usuarioAtualizado;
    }

    async excluirUsuario(id_usuarios: number) {

        const usuario = await prismaClient.usuario.findUnique({
            where: {
                id_usuarios
            }
        });

        if (!usuario) {
            throw new Error("Usuário não encontrado");
        }

        await prismaClient.usuario.delete({
            where: {
                id_usuarios
            }
        });

        return {
            Dados: "Usuário excluído"
        };
    }
}

export { usuariosServices };