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

    // =====================================================
    // CRIAR USUÁRIO
    // =====================================================

    async criarUsuario({
        nome,
        email,
        senha,
        tipo
    }: cadastrarUsuario) {

        if (
            tipo !== "BIBLIOTECÁRIO" &&
            tipo !== "ADMINISTRADOR"
        ) {
            throw new Error(
                "O tipo deve ser BIBLIOTECÁRIO ou ADMINISTRADOR"
            );
        }

        const usuarioExistente =
            await prismaClient.usuario.findUnique({
                where: {
                    email
                }
            });

        if (usuarioExistente) {
            throw new Error(
                "Email já cadastrado"
            );
        }

        const senhaHash =
            await hash(senha, 8);

        const usuario =
            await prismaClient.usuario.create({
                data: {
                    nome,
                    email,
                    senha: senhaHash,
                    tipo
                }
            });

        return usuario;
    }


    // =====================================================
    // LISTAR USUÁRIOS
    // =====================================================

    async listarUsuarios() {

        const usuarios =
            await prismaClient.usuario.findMany({
                orderBy: {
                    nome: "asc"
                }
            });

        return usuarios;
    }


    // =====================================================
    // BUSCAR USUÁRIO POR ID
    // =====================================================

    async buscarUsuarioPorId(
        id_usuarios: number
    ) {

        const usuario =
            await prismaClient.usuario.findUnique({
                where: {
                    id_usuarios
                }
            });

        if (!usuario) {
            throw new Error(
                "Usuário não encontrado"
            );
        }

        return usuario;
    }


    // =====================================================
    // BUSCAR USUÁRIO POR EMAIL
    // =====================================================

    async buscarUsuarioPorEmail(
        email: string
    ) {

        const usuario =
            await prismaClient.usuario.findUnique({
                where: {
                    email
                }
            });

        if (!usuario) {
            throw new Error(
                "Usuário não encontrado"
            );
        }

        return usuario;
    }


    // =====================================================
    // EDITAR USUÁRIO
    // =====================================================

    async editarUsuario(
        id_usuarios: number,
        dados: editarUsuarios
    ) {

        const usuario =
            await prismaClient.usuario.findUnique({
                where: {
                    id_usuarios
                }
            });

        if (!usuario) {
            throw new Error(
                "Usuário não encontrado"
            );
        }


        // =================================================
        // VALIDAR TIPO
        // =================================================

        if (dados.tipo !== undefined) {

            if (
                dados.tipo !== "BIBLIOTECÁRIO" &&
                dados.tipo !== "ADMINISTRADOR"
            ) {
                throw new Error(
                    "O tipo deve ser BIBLIOTECÁRIO ou ADMINISTRADOR"
                );
            }
        }


        // =================================================
        // VERIFICAR EMAIL
        // =================================================

        if (dados.email !== undefined) {

            const emailExistente =
                await prismaClient.usuario.findFirst({
                    where: {
                        email: dados.email,
                        NOT: {
                            id_usuarios
                        }
                    }
                });

            if (emailExistente) {
                throw new Error(
                    "Email já cadastrado em outro usuário"
                );
            }
        }


        // =================================================
        // ATUALIZAR USUÁRIO
        // =================================================

        const usuarioAtualizado =
            await prismaClient.usuario.update({
                where: {
                    id_usuarios
                },
                data: dados
            });

        return usuarioAtualizado;
    }


    // =====================================================
    // EXCLUIR USUÁRIO
    // =====================================================

    async excluirUsuario(
        id_usuarios: number
    ) {

        const usuario =
            await prismaClient.usuario.findUnique({
                where: {
                    id_usuarios
                }
            });

        if (!usuario) {
            throw new Error(
                "Usuário não encontrado"
            );
        }


        // =================================================
        // EXCLUIR SOMENTE O USUÁRIO
        // =================================================

        await prismaClient.usuario.delete({
            where: {
                id_usuarios
            }
        });

        return {
            Dados: "Usuário excluído"
        };
    }


    // =====================================================
    // ALTERAR PRIVILÉGIO
    // =====================================================

    async alterarPrivilegio(
        id_usuarios: number,
        tipo: string
    ) {

        if (
            tipo !== "ADMINISTRADOR" &&
            tipo !== "BIBLIOTECÁRIO"
        ) {
            throw new Error(
                "Tipo de usuário inválido"
            );
        }


        const usuario =
            await prismaClient.usuario.findUnique({
                where: {
                    id_usuarios
                }
            });

        if (!usuario) {
            throw new Error(
                "Usuário não encontrado"
            );
        }


        // =================================================
        // ALTERAR SOMENTE O TIPO
        // =================================================

        const usuarioAtualizado =
            await prismaClient.usuario.update({
                where: {
                    id_usuarios
                },
                data: {
                    tipo
                },
                select: {
                    id_usuarios: true,
                    nome: true,
                    email: true,
                    tipo: true,
                    avatar: true
                }
            });

        return usuarioAtualizado;
    }

}

export { usuariosServices };