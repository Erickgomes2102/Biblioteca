import prismaClient from "../Prisma/PrismaClient";

interface cadastrarEmprestimo {
    id_leitores: number,
    id_livros: number,
    id_usuarios: number,
    data_emprestimo: Date,
    data_prevista?: Date | null,
    data_devolucao: Date 
}

class emprestimosServices {

    async criarEmprestimo({
        id_leitores,
        id_livros,
        id_usuarios,
        data_emprestimo,
        data_prevista,
        data_devolucao
    }: cadastrarEmprestimo) {

        const leitor = await prismaClient.leitor.findUnique({
            where: {
                id_leitores
            }
        });

        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        const livro = await prismaClient.livro.findUnique({
            where: {
                id_livros
            }
        });

        if (!livro) {
            throw new Error("Livro não encontrado");
        }

        if (livro.quantidade <= 0) {
            throw new Error("Livro indisponível");
        }

        const usuario = await prismaClient.usuario.findUnique({
            where: {
                id_usuarios
            }
        });

        if (!usuario) {
            throw new Error("Usuário responsável não encontrado");
        }

        const emprestimo = await prismaClient.emprestimo.create({
            data: {
                id_leitores,
                id_livros,
                id_usuarios,
                data_emprestimo,
                data_prevista: data_prevista ?? null,
                data_devolucao,
                status: "ATIVO",
                multa: 0
            }
        });

        await prismaClient.livro.update({
            where: {
                id_livros
            },
            data: {
                quantidade: {
                    decrement: 1
                }
            }
        });

        return emprestimo;
    }


    async listarEmprestimos() {

        const emprestimos = await prismaClient.emprestimo.findMany({
            include: {
                leitor: true,
                livro: true,
                usuario: true
            },
            orderBy: {
                data_emprestimo: "desc"
            }
        });

        return emprestimos;
    }


    async buscarEmprestimoPorId(id_emprestimo: number) {

        const emprestimo = await prismaClient.emprestimo.findUnique({
            where: {
                id_emprestimo
            },
            include: {
                leitor: true,
                livro: true,
                usuario: true
            }
        });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        return emprestimo;
    }


    async listarEmprestimosAtivos() {

        const emprestimos = await prismaClient.emprestimo.findMany({
            where: {
                status: "ATIVO"
            },
            include: {
                leitor: true,
                livro: true
            }
        });

        return emprestimos;
    }


    async listarEmprestimosAtrasados() {

        const hoje = new Date();

        const emprestimos = await prismaClient.emprestimo.findMany({
            where: {
                status: "ATIVO",
                data_prevista: {
                    not: null,
                    lt: hoje
                }
            },
            include: {
                leitor: true,
                livro: true
            }
        });

        return emprestimos;
    }


    async calcularMulta(id_emprestimo: number) {

        const emprestimo = await prismaClient.emprestimo.findUnique({
            where: {
                id_emprestimo
            }
        });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        if (!emprestimo.data_prevista) {
            return 0;
        }

        const hoje = new Date();

        const dataPrevista = new Date(emprestimo.data_prevista);

        if (hoje <= dataPrevista) {
            return 0;
        }

        const diferenca =
            hoje.getTime() - dataPrevista.getTime();

        const diasAtrasados =
            Math.ceil(diferenca / (1000 * 60 * 60 * 24));

        const valorMulta = diasAtrasados * 2;

        return valorMulta;
    }


    async devolverLivro(id_emprestimo: number) {

        const emprestimo = await prismaClient.emprestimo.findUnique({
            where: {
                id_emprestimo
            }
        });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        if (emprestimo.status !== "ATIVO") {
            throw new Error("Este empréstimo não está ativo");
        }

        const multa = await this.calcularMulta(id_emprestimo);

        const data_devolucao = new Date();

        await prismaClient.emprestimo.update({
            where: {
                id_emprestimo
            },
            data: {
                data_devolucao,
                status: "DEVOLVIDO",
                multa
            }
        });

        await prismaClient.livro.update({
            where: {
                id_livros: emprestimo.id_livros
            },
            data: {
                quantidade: {
                    increment: 1
                }
            }
        });

        return {
            Dados: "Livro devolvido",
            multa
        };
    }


    async cancelarEmprestimo(id_emprestimo: number) {

        const emprestimo = await prismaClient.emprestimo.findUnique({
            where: {
                id_emprestimo
            }
        });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        if (emprestimo.status !== "ATIVO") {
            throw new Error("Este empréstimo não está ativo");
        }

        await prismaClient.emprestimo.update({
            where: {
                id_emprestimo
            },
            data: {
                status: "CANCELADO",
                data_devolucao: new Date()
            }
        });

        await prismaClient.livro.update({
            where: {
                id_livros: emprestimo.id_livros
            },
            data: {
                quantidade: {
                    increment: 1
                }
            }
        });

        return {
            Dados: "Empréstimo cancelado"
        };
    }
}

export { emprestimosServices };