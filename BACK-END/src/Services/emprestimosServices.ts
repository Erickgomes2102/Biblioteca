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

        const emprestimo =
            await prismaClient.emprestimo.create({
                data: {
                    id_leitores,
                    id_livros,
                    id_usuarios,
                    data_emprestimo,
                    data_prevista: data_prevista ?? null,
                    data_devolucao,
                    status: "ATIVO",
                    multa: 0,
                    status_multa: "SEM_MULTA",
                    data_pagamento: null
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


    // =====================================================
    // LISTAR EMPRÉSTIMOS
    // =====================================================

    async listarEmprestimos() {

        const emprestimos =
            await prismaClient.emprestimo.findMany({
                include: {
                    leitor: true,
                    livro: true,
                    usuario: true
                },
                orderBy: {
                    data_emprestimo: "desc"
                }
            });

        // Atualiza automaticamente as multas dos
        // empréstimos que estão atrasados.
        for (const emprestimo of emprestimos) {

            if (
                emprestimo.status === "ATIVO" &&
                emprestimo.data_prevista
            ) {

                const hoje = new Date();

                const dataPrevista =
                    new Date(emprestimo.data_prevista);

                if (hoje > dataPrevista) {

                    await this.calcularMulta(
                        emprestimo.id_emprestimo
                    );
                }
            }
        }

        // Busca novamente para retornar os valores
        // atualizados.
        const emprestimosAtualizados =
            await prismaClient.emprestimo.findMany({
                include: {
                    leitor: true,
                    livro: true,
                    usuario: true
                },
                orderBy: {
                    data_emprestimo: "desc"
                }
            });

        return emprestimosAtualizados;
    }


    // =====================================================
    // BUSCAR EMPRÉSTIMO POR ID
    // =====================================================

    async buscarEmprestimoPorId(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
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


    // =====================================================
    // LISTAR EMPRÉSTIMOS ATIVOS
    // =====================================================

    async listarEmprestimosAtivos() {

        const emprestimos =
            await prismaClient.emprestimo.findMany({
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


    // =====================================================
    // LISTAR EMPRÉSTIMOS ATRASADOS
    // =====================================================

    async listarEmprestimosAtrasados() {

        const hoje = new Date();

        const emprestimos =
            await prismaClient.emprestimo.findMany({
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


    // =====================================================
    // CALCULAR MULTA
    // =====================================================

    async calcularMulta(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: {
                    id_emprestimo
                }
            });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        if (!emprestimo.data_prevista) {

            await prismaClient.emprestimo.update({
                where: {
                    id_emprestimo
                },
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

        // Ainda não está atrasado.
        if (hoje <= dataPrevista) {

            // Não altera uma multa que já foi paga.
            if (emprestimo.status_multa !== "PAGA") {

                await prismaClient.emprestimo.update({
                    where: {
                        id_emprestimo
                    },
                    data: {
                        multa: 0,
                        status_multa: "SEM_MULTA"
                    }
                });
            }

            return 0;
        }

        const diferenca =
            hoje.getTime() -
            dataPrevista.getTime();

        const diasAtrasados =
            Math.ceil(
                diferenca /
                (1000 * 60 * 60 * 24)
            );

        // R$ 2,00 por dia de atraso.
        const valorMulta =
            diasAtrasados * 2;

        // Se já estiver paga, não muda
        // o status para pendente novamente.
        const statusMulta =
            emprestimo.status_multa === "PAGA"
                ? "PAGA"
                : "PENDENTE";

        await prismaClient.emprestimo.update({
            where: {
                id_emprestimo
            },
            data: {
                multa: valorMulta,
                status_multa: statusMulta
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
                where: {
                    id_emprestimo
                }
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

        const multa =
            await this.calcularMulta(
                id_emprestimo
            );

        const data_devolucao =
            new Date();

        await prismaClient.emprestimo.update({
            where: {
                id_emprestimo
            },
            data: {
                data_devolucao,
                status: "DEVOLVIDO",
                multa,
                status_multa:
                    multa > 0
                        ? "PENDENTE"
                        : "SEM_MULTA"
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


    // =====================================================
    // CANCELAR EMPRÉSTIMO
    // =====================================================

    async cancelarEmprestimo(
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

        if (emprestimo.status !== "ATIVO") {
            throw new Error(
                "Este empréstimo não está ativo"
            );
        }

        await prismaClient.emprestimo.update({
            where: {
                id_emprestimo
            },
            data: {
                status: "CANCELADO",
                data_devolucao: new Date(),
                multa: 0,
                status_multa: "SEM_MULTA",
                data_pagamento: null
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


    // =====================================================
    // LISTAR MULTAS
    // =====================================================

    async listarMultas() {

        const emprestimos =
            await prismaClient.emprestimo.findMany({
                where: {
                    OR: [
                        {
                            multa: {
                                gt: 0
                            }
                        },
                        {
                            data_prevista: {
                                not: null,
                                lt: new Date()
                            }
                        }
                    ]
                },
                include: {
                    leitor: true,
                    livro: true,
                    usuario: true
                },
                orderBy: {
                    data_prevista: "asc"
                }
            });

        const multas = [];

        for (const emprestimo of emprestimos) {

            let valorMulta =
                Number(emprestimo.multa);

            // Se ainda estiver ativo e atrasado,
            // calcula a multa atual.
            if (
                emprestimo.status === "ATIVO" &&
                emprestimo.data_prevista
            ) {

                valorMulta =
                    await this.calcularMulta(
                        emprestimo.id_emprestimo
                    );
            }

            const statusMulta =
                valorMulta > 0
                    ? emprestimo.status_multa === "PAGA"
                        ? "PAGA"
                        : "PENDENTE"
                    : "SEM_MULTA";

            multas.push({
                id_emprestimo:
                    emprestimo.id_emprestimo,

                livro:
                    emprestimo.livro,

                leitor:
                    emprestimo.leitor,

                data_prevista:
                    emprestimo.data_prevista,

                multa:
                    valorMulta,

                status_multa:
                    statusMulta,

                data_pagamento:
                    emprestimo.data_pagamento
            });
        }

        return multas;
    }


    // =====================================================
    // CONSULTAR MULTA DE UM EMPRÉSTIMO
    // =====================================================

    async consultarMulta(
        id_emprestimo: number
    ) {

        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: {
                    id_emprestimo
                },
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

        let multa =
            Number(emprestimo.multa);

        if (
            emprestimo.status === "ATIVO" &&
            emprestimo.data_prevista
        ) {

            multa =
                await this.calcularMulta(
                    id_emprestimo
                );
        }

        let diasAtrasados = 0;

        if (emprestimo.data_prevista) {

            const hoje = new Date();

            const dataPrevista =
                new Date(
                    emprestimo.data_prevista
                );

            if (hoje > dataPrevista) {

                diasAtrasados =
                    Math.ceil(
                        (
                            hoje.getTime() -
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

            multa,

            status_multa:
                multa > 0
                    ? emprestimo.status_multa === "PAGA"
                        ? "PAGA"
                        : "PENDENTE"
                    : "SEM_MULTA",

            data_pagamento:
                emprestimo.data_pagamento
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
                where: {
                    id_emprestimo
                }
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

        const atualizado =
            await prismaClient.emprestimo.update({
                where: {
                    id_emprestimo
                },
                data: {
                    status_multa: "PAGA",
                    data_pagamento: new Date()
                }
            });

        return {
            mensagem:
                "Multa marcada como paga.",

            multa:
                Number(atualizado.multa),

            status_multa:
                atualizado.status_multa,

            data_pagamento:
                atualizado.data_pagamento
        };
    }
}

export { emprestimosServices };