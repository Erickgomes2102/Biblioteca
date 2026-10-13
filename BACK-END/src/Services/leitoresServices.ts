import prismaClient from "../Prisma/PrismaClient";

interface cadastrarLeitor {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    id_usuarios: number;
}

interface editarLeitores {
    nome?: string;
    cpf?: string;
    telefone?: string;
    email?: string;
    id_usuarios?: number;
}

class leitoresServices {
    async criarLeitor({
        nome,
        cpf,
        telefone,
        email,
        id_usuarios
    }: cadastrarLeitor) {
        const cpfExistente = await prismaClient.leitor.findUnique({
            where: { cpf }
        });

        if (cpfExistente) {
            throw new Error("CPF já cadastrado");
        }

        const emailExistente = await prismaClient.leitor.findUnique({
            where: { email }
        });

        if (emailExistente) {
            throw new Error("Email já cadastrado");
        }

        const usuario = await prismaClient.usuario.findUnique({
            where: { id_usuarios }
        });

        if (!usuario) {
            throw new Error("Usuário responsável não encontrado");
        }

        return await prismaClient.leitor.create({
            data: {
                nome,
                cpf,
                telefone,
                email,
                id_usuarios,
                suspenso_ate: null
            }
        });
    }

    async listarLeitores() {
        return await prismaClient.leitor.findMany({
            orderBy: { nome: "asc" }
        });
    }

    async buscarLeitorPorId(id_leitores: number) {
        const leitor = await prismaClient.leitor.findUnique({
            where: { id_leitores }
        });

        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        return leitor;
    }

    async buscarLeitorPorCPF(cpf: string) {
        const leitor = await prismaClient.leitor.findUnique({
            where: { cpf }
        });

        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        return leitor;
    }

    async editarLeitor(
        id_leitores: number,
        dados: editarLeitores
    ) {
        const leitor = await prismaClient.leitor.findUnique({
            where: { id_leitores }
        });

        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        if (dados.cpf !== undefined) {
            const cpfExistente = await prismaClient.leitor.findFirst({
                where: {
                    cpf: dados.cpf,
                    NOT: { id_leitores }
                }
            });

            if (cpfExistente) {
                throw new Error("CPF já cadastrado em outro leitor");
            }
        }

        if (dados.email !== undefined) {
            const emailExistente = await prismaClient.leitor.findFirst({
                where: {
                    email: dados.email,
                    NOT: { id_leitores }
                }
            });

            if (emailExistente) {
                throw new Error("Email já cadastrado em outro leitor");
            }
        }

        if (dados.id_usuarios !== undefined) {
            const usuario = await prismaClient.usuario.findUnique({
                where: { id_usuarios: dados.id_usuarios }
            });

            if (!usuario) {
                throw new Error("Usuário responsável não encontrado");
            }
        }

        // Edição de dados pessoais não pode alterar a suspensão.
        const { ...dadosPermitidos } = dados;

        return await prismaClient.leitor.update({
            where: { id_leitores },
            data: dadosPermitidos
        });
    }

    async cancelarSuspensao(id_leitores: number) {
        const leitor = await prismaClient.leitor.findUnique({
            where: { id_leitores }
        });

        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        if (!leitor.suspenso_ate) {
            throw new Error("Este leitor não possui suspensão registrada");
        }

        return await prismaClient.leitor.update({
            where: { id_leitores },
            data: {
                suspenso_ate: null
            }
        });
    }

    async excluirLeitor(id_leitores: number) {
        const leitor = await prismaClient.leitor.findUnique({
            where: { id_leitores }
        });

        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        await prismaClient.leitor.delete({
            where: { id_leitores }
        });

        return { Dados: "Leitor excluído" };
    }
}

export { leitoresServices };