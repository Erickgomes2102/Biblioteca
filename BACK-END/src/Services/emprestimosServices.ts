import prismaClient from "../Prisma/PrismaClient";

interface cadastrarEmprestimo {
    id_leitores: number;
    id_livros: number;
    id_usuarios: number;
    data_emprestimo: Date;
    data_prevista?: Date | null;
    data_devolucao: Date;
}

class emprestimosServices {

    // =====================================================
    // CRIAR EMPRÉSTIMO
    // =====================================================

    async criarEmprestimo({
        id_leitores,
        id_livros,
        id_usuarios,
        data_emprestimo,
        data_prevista,
        data_devolucao
    }: cadastrarEmprestimo) {

        const leitor = await prismaClient.leitor.findUnique({
            where: { id_leitores }
        });

        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        const livro = await prismaClient.livro.findUnique({
            where: { id_livros }
        });

        if (!livro) {
            throw new Error("Livro não encontrado");
        }

        if (livro.quantidade <= 0) {
            throw new Error("Livro indisponível");
        }

        const usuario = await prismaClient.usuario.findUnique({
            where: { id_usuarios }
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
                multa: 0,
                status_multa: "SEM_MULTA"
            }
        });

        await prismaClient.livro.update({
            where: { id_livros },
            data: {
                quantidade: {
                    decrement: 1
                }
            }
        });

        return emprestimo;
    }


    // =====================================================
    // LISTAR EMPRÉSTIMOS
    // =====================================================

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

        for (const emprestimo of emprestimos) {

            if (
                emprestimo.status === "ATIVO" &&
                emprestimo.data_prevista
            ) {

                const hoje = new Date();
                const dataPrevista =
                    new Date(emprestimo.data_prevista);

                hoje.setHours(0, 0, 0, 0);
                dataPrevista.setHours(0, 0, 0, 0);

                if (hoje > dataPrevista) {
                    await this.calcularMulta(
                        emprestimo.id_emprestimo
                    );
                }
            }
        }

        return await prismaClient.emprestimo.findMany({
            include: {
                leitor: true,
                livro: true,
                usuario: true
            },
            orderBy: {
                data_emprestimo: "desc"
            }
        });
    }


    // =====================================================
    // BUSCAR EMPRÉSTIMO POR ID
    // =====================================================

    async buscarEmprestimoPorId(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo },
                include: {
                    leitor: true,
                    livro: true,
                    usuario: true
                }
            });

        if (!emprestimo) {
            throw new Error(
                "Empréstimo não encontrado"
            );
        }

        return emprestimo;
    }


    // =====================================================
    // LISTAR EMPRÉSTIMOS ATIVOS
    // =====================================================

    async listarEmprestimosAtivos() {

        return await prismaClient.emprestimo.findMany({
            where: {
                status: "ATIVO"
            },
            include: {
                leitor: true,
                livro: true,
                usuario: true
            }
        });
    }


    // =====================================================
    // LISTAR EMPRÉSTIMOS ATRASADOS
    // =====================================================

    async listarEmprestimosAtrasados() {

        const hoje = new Date();

        return await prismaClient.emprestimo.findMany({
            where: {
                status: "ATIVO",
                data_prevista: {
                    not: null,
                    lt: hoje
                }
            },
            include: {
                leitor: true,
                livro: true,
                usuario: true
            }
        });
    }


    // =====================================================
    // CALCULAR MULTA
    // =====================================================

    async calcularMulta(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo }
            });

        if (!emprestimo) {
            throw new Error(
                "Empréstimo não encontrado"
            );
        }

        if (!emprestimo.data_prevista) {

            await prismaClient.emprestimo.update({
                where: { id_emprestimo },
                data: {
                    multa: 0,
                    status_multa: "SEM_MULTA"
                }
            });

            return 0;
        }

        const hoje = new Date();

        const dataPrevista =
            new Date(emprestimo.data_prevista);

        hoje.setHours(0, 0, 0, 0);
        dataPrevista.setHours(0, 0, 0, 0);

        if (hoje <= dataPrevista) {

            if (emprestimo.status_multa !== "PAGA") {

                await prismaClient.emprestimo.update({
                    where: { id_emprestimo },
                    data: {
                        multa: 0,
                        status_multa: "SEM_MULTA"
                    }
                });
            }

            return Number(emprestimo.multa);
        }

        const diferenca =
            hoje.getTime() -
            dataPrevista.getTime();

        const diasAtrasados =
            Math.ceil(
                diferenca /
                (1000 * 60 * 60 * 24)
            );

        const valorMulta =
            diasAtrasados * 2;

        let novoStatus =
            emprestimo.status_multa;

        if (
            emprestimo.status_multa !== "PAGA"
        ) {
            novoStatus = "PENDENTE";
        }

        await prismaClient.emprestimo.update({
            where: { id_emprestimo },
            data: {
                multa: valorMulta,
                status_multa: novoStatus
            }
        });

        return valorMulta;
    }


    // =====================================================
    // DEVOLVER LIVRO
    // =====================================================

    async devolverLivro(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo }
            });

        if (!emprestimo) {
            throw new Error(
                "Empréstimo não encontrado"
            );
        }

        if (emprestimo.status !== "ATIVO") {
            throw new Error(
                "Este empréstimo não está ativo"
            );
        }

        const data_devolucao = new Date();

        let multa = 0;
        let status_multa = "SEM_MULTA";

        if (emprestimo.data_prevista) {

            const dataPrevista =
                new Date(
                    emprestimo.data_prevista
                );

            const dataReferencia =
                new Date(data_devolucao);

            dataPrevista.setHours(0, 0, 0, 0);
            dataReferencia.setHours(0, 0, 0, 0);

            if (
                dataReferencia >
                dataPrevista
            ) {

                const diferenca =
                    dataReferencia.getTime() -
                    dataPrevista.getTime();

                const diasAtrasados =
                    Math.ceil(
                        diferenca /
                        (1000 * 60 * 60 * 24)
                    );

                multa = diasAtrasados * 2;

                status_multa =
                    emprestimo.status_multa === "PAGA"
                        ? "PAGA"
                        : "PENDENTE";
            }
        }

        await prismaClient.emprestimo.update({
            where: { id_emprestimo },
            data: {
                data_devolucao,
                status: "DEVOLVIDO",
                multa,
                status_multa
            }
        });

        await prismaClient.livro.update({
            where: {
                id_livros:
                    emprestimo.id_livros
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


    // =====================================================
    // CANCELAR EMPRÉSTIMO
    // =====================================================

    async cancelarEmprestimo(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo }
            });

        if (!emprestimo) {
            throw new Error(
                "Empréstimo não encontrado"
            );
        }

        if (emprestimo.status !== "ATIVO") {
            throw new Error(
                "Este empréstimo não está ativo"
            );
        }

        await prismaClient.emprestimo.update({
            where: { id_emprestimo },
            data: {
                status: "CANCELADO",
                data_devolucao: new Date(),
                multa: 0,
                status_multa: "CANCELADA"
            }
        });

        await prismaClient.livro.update({
            where: {
                id_livros:
                    emprestimo.id_livros
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


    // =====================================================
    // EXCLUIR EMPRÉSTIMO DEVOLVIDO
    // =====================================================

    async excluirEmprestimo(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: {
                    id_emprestimo
                }
            });

        if (!emprestimo) {
            throw new Error(
                "Empréstimo não encontrado"
            );
        }

        // Só permite excluir empréstimos
        // que já foram devolvidos
        if (emprestimo.status !== "DEVOLVIDO") {
            throw new Error(
                "Somente empréstimos devolvidos podem ser excluídos."
            );
        }

        await prismaClient.emprestimo.delete({
            where: {
                id_emprestimo
            }
        });

        return {
            Dados: "Empréstimo excluído com sucesso."
        };
    }


    // =====================================================
    // LISTAR MULTAS
    // =====================================================

    async listarMultas() {

        return await prismaClient.emprestimo.findMany({
            where: {
                OR: [
                    {
                        status_multa: "PENDENTE"
                    },
                    {
                        status_multa: "PAGA"
                    }
                ]
            },
            include: {
                leitor: true,
                livro: true,
                usuario: true
            },
            orderBy: {
                data_emprestimo: "desc"
            }
        });
    }


    // =====================================================
    // CONSULTAR MULTA DE UM EMPRÉSTIMO
    // =====================================================

    async consultarMulta(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo },
                include: {
                    leitor: true,
                    livro: true
                }
            });

        if (!emprestimo) {
            throw new Error(
                "Empréstimo não encontrado"
            );
        }

        if (
            emprestimo.status === "ATIVO" &&
            emprestimo.data_prevista
        ) {

            const hoje = new Date();

            const dataPrevista =
                new Date(
                    emprestimo.data_prevista
                );

            hoje.setHours(0, 0, 0, 0);
            dataPrevista.setHours(0, 0, 0, 0);

            if (hoje > dataPrevista) {
                await this.calcularMulta(
                    id_emprestimo
                );
            }
        }

        const emprestimoAtualizado =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo },
                include: {
                    leitor: true,
                    livro: true
                }
            });

        let diasAtrasados = 0;

        if (emprestimo.data_prevista) {

            const dataReferencia =
                emprestimo.status === "DEVOLVIDO" &&
                emprestimo.data_devolucao
                    ? new Date(
                        emprestimo.data_devolucao
                    )
                    : new Date();

            const dataPrevista =
                new Date(
                    emprestimo.data_prevista
                );

            dataReferencia.setHours(
                0,
                0,
                0,
                0
            );

            dataPrevista.setHours(
                0,
                0,
                0,
                0
            );

            if (
                dataReferencia >
                dataPrevista
            ) {

                diasAtrasados =
                    Math.ceil(
                        (
                            dataReferencia.getTime() -
                            dataPrevista.getTime()
                        ) /
                        (1000 * 60 * 60 * 24)
                    );
            }
        }

        return {
            id_emprestimo:
                emprestimo.id_emprestimo,

            livro:
                emprestimo.livro,

            leitor:
                emprestimo.leitor,

            data_prevista:
                emprestimo.data_prevista,

            dias_atrasados:
                diasAtrasados,

            valor_por_dia: 2,

            multa:
                Number(
                    emprestimoAtualizado?.multa ?? 0
                ),

            status_multa:
                emprestimoAtualizado?.status_multa ??
                "SEM_MULTA",

            data_pagamento:
                emprestimoAtualizado?.data_pagamento ??
                null
        };
    }


    // =====================================================
    // MARCAR MULTA COMO PAGA
    // =====================================================

    async marcarMultaComoPaga(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo }
            });

        if (!emprestimo) {
            throw new Error(
                "Empréstimo não encontrado"
            );
        }

        if (Number(emprestimo.multa) <= 0) {
            throw new Error(
                "Este empréstimo não possui multa."
            );
        }

        if (
            emprestimo.status_multa === "PAGA"
        ) {
            throw new Error(
                "Esta multa já foi paga."
            );
        }

        if (
            emprestimo.status_multa === "CANCELADA"
        ) {
            throw new Error(
                "Esta multa está cancelada."
            );
        }

        const dataPagamento =
            new Date();

        const atualizado =
            await prismaClient.emprestimo.update({
                where: { id_emprestimo },
                data: {
                    status_multa: "PAGA",
                    data_pagamento:
                        dataPagamento
                }
            });

        return {
            mensagem:
                "Multa marcada como paga.",

            id_emprestimo:
                atualizado.id_emprestimo,

            multa:
                Number(atualizado.multa),

            status_multa:
                atualizado.status_multa,

            data_pagamento:
                atualizado.data_pagamento
        };
    }
}


export {
    emprestimosServices
};