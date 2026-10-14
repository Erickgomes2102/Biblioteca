import prismaClient from "../Prisma/PrismaClient";
import { hash } from "bcryptjs";
import { validarEmail } from "../Middleware/validarEmail";

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
    avatar?: string | null;
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
        if(!validarEmail(email)) {
            throw new Error( "Informe um e-mail válido, contendo @ e terminando com .com.")
        }


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
    return await prismaClient.usuario.findMany({
        where: {
            ativo: true
        },
        select: {
            id_usuarios: true,
            nome: true,
            email: true,
            tipo: true,
            avatar: true,
            ativo: true
        },
        orderBy: {
            nome: "asc"
        }
    });
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

            if(!validarEmail(dados.email)) {
                throw new Error("Informe um e-mail válido, contendo @ e terminando em .com.")
            }

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

  async excluirUsuario(id_usuarios: number) {
    const usuario = await prismaClient.usuario.findUnique({
        where: { id_usuarios },
        select: {
            id_usuarios: true,
            ativo: true
        }
    });

    if (!usuario) {
        throw new Error("Usuário não encontrado.");
    }

    if (!usuario.ativo) {
        throw new Error("Este usuário já está desativado.");
    }

    const usuarioAtualizado = await prismaClient.usuario.update({
        where: { id_usuarios },
        data: { ativo: false },
        select: {
            id_usuarios: true,
            ativo: true
        }
    });

    return {
        mensagem: "Usuário desativado com sucesso.",
        usuario: usuarioAtualizado
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


async editarMeuPerfil(
    id_usuarios: number,
    dados: {
        nome?: string;
        email?: string;
        senha?: string;
        avatar?: string | null;
    }
) {
    const usuario = await prismaClient.usuario.findUnique({
        where: {
            id_usuarios
        }
    });

    if (!usuario) {
        throw new Error("Usuário não encontrado");
    }

    // =================================================
    // VALIDAR EMAIL
    // =================================================

    if (dados.email !== undefined) {
        if (!validarEmail(dados.email)) {
            throw new Error(
                "Informe um e-mail válido, contendo @ e terminando em .com."
            );
        }

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

    // =================================================
    // PREPARAR DADOS
    // =================================================

    const dadosAtualizacao: {
        nome?: string;
        email?: string;
        senha?: string;
        avatar?: string | null;
    } = {};

    if (dados.nome !== undefined) {
        dadosAtualizacao.nome = dados.nome;
    }

    if (dados.email !== undefined) {
        dadosAtualizacao.email = dados.email;
    }

    if (dados.avatar !== undefined) {
        dadosAtualizacao.avatar = dados.avatar;
    }

    if (dados.senha !== undefined && dados.senha.trim() !== "") {
        dadosAtualizacao.senha = await hash(dados.senha, 8);
    }

    // =================================================
    // ATUALIZAR PERFIL
    // =================================================

    return await prismaClient.usuario.update({
        where: {
            id_usuarios
        },
        data: dadosAtualizacao,
        select: {
            id_usuarios: true,
            nome: true,
            email: true,
            tipo: true,
            avatar: true
        }
    });
}

}

export { usuariosServices };