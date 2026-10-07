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


    // =====================================================
    // LISTAR EMPRÉSTIMOS
    // =====================================================

    async listarEmprestimos() {

        const emprestimos =
            await prismaClient.emprestimo.findMany({
                include: {
                    leitor: true,
                    livro: true,
                    usuario: true,
                    multaRegistro: true
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

        const emprestimosAtualizados =
            await prismaClient.emprestimo.findMany({
                include: {
                    leitor: true,
                    livro: true,
                    usuario: true,
                    multaRegistro: true
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
                    usuario: true,
                    multaRegistro: true
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
                    livro: true,
                    multaRegistro: true
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
                    livro: true,
                    multaRegistro: true
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
                },
                include: {
                    multaRegistro: true
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
                    multa: 0
                }
            });

            return 0;
        }

        const hoje = new Date();

        const dataPrevista =
            new Date(emprestimo.data_prevista);

        hoje.setHours(0, 0, 0, 0);
        dataPrevista.setHours(0, 0, 0, 0);

        // Ainda não está atrasado.
        if (hoje <= dataPrevista) {

            if (!emprestimo.multaRegistro) {

                await prismaClient.emprestimo.update({
                    where: {
                        id_emprestimo
                    },
                    data: {
                        multa: 0
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

        // R$ 2,00 por dia de atraso.
        const valorMulta =
            diasAtrasados * 2;


        // Se a multa já foi paga,
        // não volta para PENDENTE.
        if (
            emprestimo.multaRegistro &&
            emprestimo.multaRegistro.status === "PAGA"
        ) {

            await prismaClient.emprestimo.update({
                where: {
                    id_emprestimo
                },
                data: {
                    multa: valorMulta
                }
            });

            return valorMulta;
        }


        // Se já existe registro de multa,
        // atualiza o valor e os dias.
        if (emprestimo.multaRegistro) {

            await prismaClient.multa.update({
                where: {
                    id_multa:
                        emprestimo.multaRegistro.id_multa
                },
                data: {
                    valor: valorMulta,
                    dias_atraso: diasAtrasados,
                    data_calculo: new Date(),
                    status: "PENDENTE"
                }
            });

        } else {

            // Se ainda não existe, cria a multa.
            await prismaClient.multa.create({
                data: {
                    valor: valorMulta,
                    dias_atraso: diasAtrasados,
                    status: "PENDENTE",
                    id_emprestimo
                }
            });
        }


        // Mantém o valor resumido também em Emprestimo.
        await prismaClient.emprestimo.update({
            where: {
                id_emprestimo
            },
            data: {
                multa: valorMulta
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

        const data_devolucao =
            new Date();

        let multa = 0;

        if (emprestimo.data_prevista) {

            const dataPrevista =
                new Date(emprestimo.data_prevista);

            const dataReferencia =
                new Date(data_devolucao);

            dataPrevista.setHours(0, 0, 0, 0);
            dataReferencia.setHours(0, 0, 0, 0);

            if (dataReferencia > dataPrevista) {

                const diferenca =
                    dataReferencia.getTime() -
                    dataPrevista.getTime();

                const diasAtrasados =
                    Math.ceil(
                        diferenca /
                        (1000 * 60 * 60 * 24)
                    );

                multa =
                    diasAtrasados * 2;


                const multaExistente =
                    await prismaClient.multa.findUnique({
                        where: {
                            id_emprestimo
                        }
                    });

                if (multaExistente) {

                    if (
                        multaExistente.status !== "PAGA"
                    ) {

                        await prismaClient.multa.update({
                            where: {
                                id_multa:
                                    multaExistente.id_multa
                            },
                            data: {
                                valor: multa,
                                dias_atraso:
                                    diasAtrasados,
                                data_calculo:
                                    new Date(),
                                status: "PENDENTE"
                            }
                        });
                    }

                } else {

                    await prismaClient.multa.create({
                        data: {
                            valor: multa,
                            dias_atraso:
                                diasAtrasados,
                            status: "PENDENTE",
                            id_emprestimo
                        }
                    });
                }
            }
        }


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
                multa: 0
            }
        });


        await prismaClient.multa.updateMany({
            where: {
                id_emprestimo,
                status: "PENDENTE"
            },
            data: {
                status: "CANCELADA"
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

        const multas =
            await prismaClient.multa.findMany({
                include: {
                    emprestimo: {
                        include: {
                            leitor: true,
                            livro: true,
                            usuario: true
                        }
                    }
                },
                orderBy: {
                    data_calculo: "desc"
                }
            });

        return multas;
    }


    // =====================================================
    // CONSULTAR MULTA DE UM EMPRÉSTIMO
    // =====================================================

    async consultarMulta(
        id_emprestimo: number
    ) {

        let emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: {
                    id_emprestimo
                },
                include: {
                    leitor: true,
                    livro: true,
                    multaRegistro: true
                }
            });

        if (!emprestimo) {
            throw new Error(
                "Empréstimo não encontrado"
            );
        }


        // Se está ativo e atrasado,
        // atualiza/cria a multa antes da consulta.
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
                    id_emprestimo
                );

                // Busca novamente depois da atualização.
                emprestimo =
                    await prismaClient.emprestimo.findUnique({
                        where: {
                            id_emprestimo
                        },
                        include: {
                            leitor: true,
                            livro: true,
                            multaRegistro: true
                        }
                    });

                if (!emprestimo) {
                    throw new Error(
                        "Empréstimo não encontrado"
                    );
                }
            }
        }


        const multa =
            await prismaClient.multa.findUnique({
                where: {
                    id_emprestimo
                }
            });


        let diasAtrasados = 0;

        if (emprestimo.data_prevista) {

            const dataReferencia =
                emprestimo.status === "DEVOLVIDO"
                    ? new Date(emprestimo.data_devolucao)
                    : new Date();

            const dataPrevista =
                new Date(emprestimo.data_prevista);

            dataReferencia.setHours(0, 0, 0, 0);
            dataPrevista.setHours(0, 0, 0, 0);

            if (dataReferencia > dataPrevista) {

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
                multa?.dias_atraso ?? diasAtrasados,

            valor_por_dia:
                2,

            multa:
                multa
                    ? Number(multa.valor)
                    : Number(emprestimo.multa),

            status_multa:
                multa?.status ?? "SEM_MULTA",

            data_pagamento:
                multa?.data_pagamento ?? null
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


        const multa =
            await prismaClient.multa.findUnique({
                where: {
                    id_emprestimo
                }
            });

        if (!multa || Number(multa.valor) <= 0) {
            throw new Error(
                "Este empréstimo não possui multa."
            );
        }


        if (multa.status === "PAGA") {
            throw new Error(
                "Esta multa já foi paga."
            );
        }


        if (multa.status === "CANCELADA") {
            throw new Error(
                "Esta multa está cancelada."
            );
        }


        const atualizado =
            await prismaClient.multa.update({
                where: {
                    id_multa:
                        multa.id_multa
                },
                data: {
                    status: "PAGA",
                    data_pagamento: new Date()
                }
            });


        return {
            mensagem:
                "Multa marcada como paga.",

            id_multa:
                atualizado.id_multa,

            id_emprestimo:
                atualizado.id_emprestimo,

            multa:
                Number(atualizado.valor),

            status_multa:
                atualizado.status,

            data_pagamento:
                atualizado.data_pagamento
        };
    }
}

export { emprestimosServices };