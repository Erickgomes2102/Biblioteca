
import prismaClient from "../Prisma/PrismaClient";

interface cadastrarEmprestimo {
    id_leitores: number;
    id_livros: number;
    id_usuarios: number;
    data_emprestimo: Date;
    data_prevista?: Date | null;
    data_devolucao: Date;
}

type TipoPenalidade = "MULTA" | "SUSPENSAO";

class emprestimosServices {

    // =====================================================
    // AUXILIAR: CALCULAR DIAS DE ATRASO
    // =====================================================

    private calcularDiasAtraso(
        data_prevista: Date,
        dataReferencia: Date
    ): number {
        const prevista = new Date(data_prevista);
        const referencia = new Date(dataReferencia);

        prevista.setHours(0, 0, 0, 0);
        referencia.setHours(0, 0, 0, 0);

        if (referencia <= prevista) {
            return 0;
        }

        return Math.floor(
            (referencia.getTime() - prevista.getTime()) /
            (1000 * 60 * 60 * 24)
        );
    }

    // =====================================================
    // AUXILIAR: CALCULAR HORAS COMPLETAS DE ATRASO
    // =====================================================

    private calcularHorasAtraso(
        data_prevista: Date,
        dataReferencia: Date
    ): number {
        /*
         * data_prevista é armazenada como data, sem horário.
         * Consideramos o fim do dia previsto como vencimento.
         */

        const vencimento = new Date(data_prevista);
        vencimento.setHours(23, 59, 59, 999);

        const diferenca =
            dataReferencia.getTime() - vencimento.getTime();

        if (diferenca <= 0) {
            return 0;
        }

        return Math.floor(
            diferenca / (1000 * 60 * 60)
        );
    }

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

        const agora = new Date();

        if (
            leitor.suspenso_ate &&
            leitor.suspenso_ate > agora
        ) {
            throw new Error(
                `Este leitor está suspenso até ${
                    leitor.suspenso_ate.toLocaleDateString("pt-BR")
                } e não pode realizar novos empréstimos.`
            );
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

        return await prismaClient.$transaction(async (tx) => {
            const emprestimo = await tx.emprestimo.create({
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

            await tx.livro.update({
                where: { id_livros },
                data: {
                    quantidade: {
                        decrement: 1
                    }
                }
            });

            return emprestimo;
        });
    }

    // =====================================================
    // LISTAR EMPRÉSTIMOS
    // =====================================================

    async listarEmprestimos() {
        /*
         * Restaura o comportamento original: atualizar a multa
         * dos empréstimos ATIVOS que já venceram.
         *
         * Empréstimos devolvidos ou cancelados nunca passam
         * pelo cálculo automático.
         */

        const emprestimos = await prismaClient.emprestimo.findMany({
            where: {
                status: "ATIVO"
            },
            select: {
                id_emprestimo: true,
                data_prevista: true
            }
        });

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        for (const emprestimo of emprestimos) {
            if (!emprestimo.data_prevista) {
                continue;
            }

            const dataPrevista = new Date(
                emprestimo.data_prevista
            );
            dataPrevista.setHours(0, 0, 0, 0);

            if (hoje > dataPrevista) {
                await this.calcularMulta(
                    emprestimo.id_emprestimo
                );
            }
        }

        return await prismaClient.emprestimo.findMany({
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
    }

    // =====================================================
    // BUSCAR EMPRÉSTIMO POR ID
    // =====================================================

    async buscarEmprestimoPorId(id_emprestimo: number) {
        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo },
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
        return await prismaClient.emprestimo.findMany({
            where: {
                status: "ATIVO"
            },
            include: {
                leitor: true,
                livro: true,
                multaRegistro: true
            }
        });
    }

    // =====================================================
    // LISTAR EMPRÉSTIMOS ATRASADOS
    // =====================================================

    async listarEmprestimosAtrasados() {
        const hoje = new Date();
        hoje.setHours(23, 59, 59, 999);

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
                multaRegistro: true
            }
        });
    }

    // =====================================================
    // CALCULAR MULTA
    // =====================================================

    async calcularMulta(id_emprestimo: number) {
        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo },
                include: {
                    multaRegistro: true
                }
            });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        // Cancelados e devolvidos não recebem novos cálculos.
        if (
            emprestimo.status === "CANCELADO" ||
            emprestimo.status === "DEVOLVIDO"
        ) {
            return Number(
                emprestimo.multaRegistro?.valor ??
                emprestimo.multa ??
                0
            );
        }

        if (emprestimo.status !== "ATIVO") {
            throw new Error(
                "Não é possível calcular multa para este empréstimo."
            );
        }

        const multaExistente = emprestimo.multaRegistro;

        // Uma multa paga nunca deve ser recalculada ou reaberta.
        if (multaExistente?.status === "PAGA") {
            return Number(multaExistente.valor);
        }

        // Multa cancelada não pode ser recriada automaticamente.
        if (multaExistente?.status === "CANCELADA") {
            return 0;
        }

        if (!emprestimo.data_prevista) {
            await prismaClient.emprestimo.update({
                where: { id_emprestimo },
                data: { multa: 0 }
            });

            return 0;
        }

        const diasAtrasados = this.calcularDiasAtraso(
            emprestimo.data_prevista,
            new Date()
        );

        if (diasAtrasados <= 0) {
            await prismaClient.emprestimo.update({
                where: { id_emprestimo },
                data: { multa: 0 }
            });

            return 0;
        }

        // R$ 2,00 por dia de atraso.
        const valorMulta = diasAtrasados * 2;

        await prismaClient.$transaction(async (tx) => {
            if (multaExistente) {
                await tx.multa.update({
                    where: {
                        id_multa: multaExistente.id_multa
                    },
                    data: {
                        valor: valorMulta,
                        dias_atraso: diasAtrasados,
                        data_calculo: new Date(),
                        status: "PENDENTE"
                    }
                });
            } else {
                await tx.multa.create({
                    data: {
                        valor: valorMulta,
                        dias_atraso: diasAtrasados,
                        status: "PENDENTE",
                        id_emprestimo
                    }
                });
            }

            await tx.emprestimo.update({
                where: { id_emprestimo },
                data: { multa: valorMulta }
            });
        });

        return valorMulta;
    }

    // =====================================================
    // APLICAR SUSPENSÃO POR ATRASO
    // =====================================================

    async suspenderLeitorPorAtraso(
        id_leitores: number,
        dias_suspensao: number
    ) {
        if (
            !Number.isSafeInteger(dias_suspensao) ||
            dias_suspensao < 1 ||
            dias_suspensao > 365
        ) {
            throw new Error(
                "A suspensão deve durar entre 1 e 365 dias. Verifique o cálculo do atraso."
            );
        }

        const leitor = await prismaClient.leitor.findUnique({
            where: { id_leitores }
        });

        if (!leitor) {
            throw new Error("Leitor não encontrado");
        }

        const agora = new Date();

        const inicioSuspensao =
            leitor.suspenso_ate &&
            leitor.suspenso_ate > agora
                ? new Date(leitor.suspenso_ate)
                : agora;

        const suspenso_ate = new Date(inicioSuspensao);

        suspenso_ate.setDate(
            suspenso_ate.getDate() + dias_suspensao
        );

        const leitorAtualizado =
            await prismaClient.leitor.update({
                where: { id_leitores },
                data: { suspenso_ate }
            });

        return {
            mensagem: "Leitor suspenso com sucesso.",
            id_leitores,
            suspenso_ate: leitorAtualizado.suspenso_ate,
            dias_suspensao
        };
    }

    // =====================================================
    // DEVOLVER LIVRO
    // =====================================================

    async devolverLivro(
        id_emprestimo: number,
        penalidade?: TipoPenalidade
    ) {
        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo },
                include: {
                    multaRegistro: true
                }
            });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        if (emprestimo.status !== "ATIVO") {
            throw new Error("Este empréstimo não está ativo");
        }

        const data_devolucao = new Date();

        const diasAtrasados = emprestimo.data_prevista
            ? this.calcularDiasAtraso(
                emprestimo.data_prevista,
                data_devolucao
            )
            : 0;

        if (
            penalidade !== undefined &&
            penalidade !== "MULTA" &&
            penalidade !== "SUSPENSAO"
        ) {
            throw new Error("Penalidade inválida.");
        }

        if (
            diasAtrasados > 0 &&
            penalidade !== "MULTA" &&
            penalidade !== "SUSPENSAO"
        ) {
            throw new Error(
                "O empréstimo está atrasado. Escolha MULTA ou SUSPENSAO."
            );
        }

        let multa = 0;
        let diasSuspensao = 0;

        const multaExistente = emprestimo.multaRegistro;

        if (
            multaExistente?.status === "PAGA" &&
            penalidade === "SUSPENSAO" &&
            diasAtrasados > 0
        ) {
            throw new Error(
                "Este empréstimo já possui multa paga. Não é possível substituí-la por suspensão."
            );
        }

        if (diasAtrasados > 0 && penalidade === "MULTA") {
            multa = multaExistente?.status === "PAGA"
                ? Number(multaExistente.valor)
                : diasAtrasados * 2;

            if (multaExistente?.status !== "PAGA") {
                await prismaClient.$transaction(async (tx) => {
                    if (multaExistente) {
                        await tx.multa.update({
                            where: {
                                id_multa: multaExistente.id_multa
                            },
                            data: {
                                valor: multa,
                                dias_atraso: diasAtrasados,
                                data_calculo: new Date(),
                                data_pagamento: null,
                                status: "PENDENTE"
                            }
                        });
                    } else {
                        await tx.multa.create({
                            data: {
                                valor: multa,
                                dias_atraso: diasAtrasados,
                                status: "PENDENTE",
                                id_emprestimo
                            }
                        });
                    }
                });
            }
        }

        if (diasAtrasados > 0 && penalidade === "SUSPENSAO") {
            const horasAtraso = this.calcularHorasAtraso(
                emprestimo.data_prevista!,
                data_devolucao
            );

            if (horasAtraso < 1) {
                throw new Error(
                    "O atraso ainda não completou uma hora."
                );
            }

            diasSuspensao = horasAtraso;

            if (diasSuspensao > 365) {
                throw new Error(
                    "A suspensão calculada ultrapassa 365 dias. Verifique a data de vencimento antes de prosseguir."
                );
            }

            // Registra a suspensão e cancela eventual multa pendente
            // dentro de uma única transação.
            await prismaClient.$transaction(async (tx) => {
                const leitor = await tx.leitor.findUnique({
                    where: {
                        id_leitores: emprestimo.id_leitores
                    }
                });

                if (!leitor) {
                    throw new Error("Leitor não encontrado");
                }

                const agora = new Date();

                const inicioSuspensao =
                    leitor.suspenso_ate &&
                    leitor.suspenso_ate > agora
                        ? new Date(leitor.suspenso_ate)
                        : agora;

                const suspenso_ate = new Date(inicioSuspensao);
                suspenso_ate.setDate(
                    suspenso_ate.getDate() + diasSuspensao
                );

                await tx.leitor.update({
                    where: {
                        id_leitores: emprestimo.id_leitores
                    },
                    data: { suspenso_ate }
                });

                if (
                    multaExistente &&
                    multaExistente.status === "PENDENTE"
                ) {
                    await tx.multa.update({
                        where: {
                            id_multa: multaExistente.id_multa
                        },
                        data: {
                            status: "CANCELADA"
                        }
                    });
                }

                await tx.emprestimo.update({
                    where: { id_emprestimo },
                    data: {
                        data_devolucao,
                        status: "DEVOLVIDO",
                        multa: 0
                    }
                });

                await tx.livro.update({
                    where: {
                        id_livros: emprestimo.id_livros
                    },
                    data: {
                        quantidade: {
                            increment: 1
                        }
                    }
                });
            });

            return {
                Dados: "Livro devolvido",
                multa: 0,
                dias_atrasados: diasAtrasados,
                penalidade_aplicada: "SUSPENSAO",
                dias_suspensao: diasSuspensao
            };
        }

        await prismaClient.$transaction(async (tx) => {
            await tx.emprestimo.update({
                where: { id_emprestimo },
                data: {
                    data_devolucao,
                    status: "DEVOLVIDO",
                    multa
                }
            });

            await tx.livro.update({
                where: {
                    id_livros: emprestimo.id_livros
                },
                data: {
                    quantidade: {
                        increment: 1
                    }
                }
            });
        });

        return {
            Dados: "Livro devolvido",
            multa,
            dias_atrasados: diasAtrasados,
            penalidade_aplicada:
                diasAtrasados > 0
                    ? penalidade
                    : "SEM_ATRASO",
            dias_suspensao: diasSuspensao
        };
    }

    // =====================================================
    // CANCELAR EMPRÉSTIMO
    // =====================================================

    async cancelarEmprestimo(id_emprestimo: number) {
        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo }
            });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        if (emprestimo.status !== "ATIVO") {
            throw new Error("Este empréstimo não está ativo");
        }

        await prismaClient.$transaction(async (tx) => {
            await tx.emprestimo.update({
                where: { id_emprestimo },
                data: {
                    status: "CANCELADO",
                    data_devolucao: new Date(),
                    multa: 0
                }
            });

            await tx.multa.updateMany({
                where: {
                    id_emprestimo,
                    status: "PENDENTE"
                },
                data: {
                    status: "CANCELADA"
                }
            });

            await tx.livro.update({
                where: {
                    id_livros: emprestimo.id_livros
                },
                data: {
                    quantidade: {
                        increment: 1
                    }
                }
            });
        });

        return {
            Dados: "Empréstimo cancelado"
        };
    }

    // =====================================================
    // LISTAR MULTAS
    // =====================================================

    async listarMultas() {
        return await prismaClient.multa.findMany({
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
    }

    // =====================================================
    // CONSULTAR MULTA DE UM EMPRÉSTIMO
    // =====================================================

    async consultarMulta(id_emprestimo: number) {
        let emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo },
                include: {
                    leitor: true,
                    livro: true,
                    multaRegistro: true
                }
            });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        // Só recalcula empréstimos ativos.
        // Consultar um empréstimo não devolvido não altera
        // multas pagas, canceladas, devolvidas ou suspensões.
        if (
            emprestimo.status === "ATIVO" &&
            emprestimo.data_prevista
        ) {
            const diasAtrasados = this.calcularDiasAtraso(
                emprestimo.data_prevista,
                new Date()
            );

            if (diasAtrasados > 0) {
                await this.calcularMulta(id_emprestimo);

                emprestimo =
                    await prismaClient.emprestimo.findUnique({
                        where: { id_emprestimo },
                        include: {
                            leitor: true,
                            livro: true,
                            multaRegistro: true
                        }
                    });

                if (!emprestimo) {
                    throw new Error("Empréstimo não encontrado");
                }
            }
        }

        const multa = emprestimo.multaRegistro;

        let diasAtrasados = 0;

        if (
            emprestimo.data_prevista &&
            emprestimo.status !== "CANCELADO"
        ) {
            const dataReferencia =
                emprestimo.status === "DEVOLVIDO"
                    ? new Date(emprestimo.data_devolucao)
                    : new Date();

            diasAtrasados = this.calcularDiasAtraso(
                emprestimo.data_prevista,
                dataReferencia
            );
        }

        const multaRegistrada =
            multa &&
            multa.status !== "CANCELADA"
                ? Number(multa.valor)
                : 0;

        const valorEstimado =
            emprestimo.status === "ATIVO" &&
            multa?.status !== "PAGA" &&
            multa?.status !== "CANCELADA"
                ? diasAtrasados * 2
                : 0;

        return {
            id_emprestimo: emprestimo.id_emprestimo,
            livro: emprestimo.livro,
            leitor: emprestimo.leitor,
            data_prevista: emprestimo.data_prevista,
            dias_atrasados: multa?.dias_atraso ?? diasAtrasados,
            valor_por_dia: 2,
            multa:
                multa?.status === "PAGA"
                    ? Number(multa.valor)
                    : multaRegistrada || valorEstimado,
            status_multa: multa?.status ?? "SEM_MULTA",
            data_pagamento: multa?.data_pagamento ?? null
        };
    }

    // =====================================================
    // MARCAR MULTA COMO PAGA
    // =====================================================

    async marcarMultaComoPaga(id_emprestimo: number) {
        const emprestimo =
            await prismaClient.emprestimo.findUnique({
                where: { id_emprestimo }
            });

        if (!emprestimo) {
            throw new Error("Empréstimo não encontrado");
        }

        if (emprestimo.status === "CANCELADO") {
            throw new Error(
                "Não é possível pagar multa de um empréstimo cancelado."
            );
        }

        const multa = await prismaClient.multa.findUnique({
            where: { id_emprestimo }
        });

        if (!multa || Number(multa.valor) <= 0) {
            throw new Error(
                "Este empréstimo não possui multa."
            );
        }

        if (multa.status === "PAGA") {
            throw new Error("Esta multa já foi paga.");
        }

        if (multa.status === "CANCELADA") {
            throw new Error("Esta multa está cancelada.");
        }

        const atualizado = await prismaClient.multa.update({
            where: {
                id_multa: multa.id_multa
            },
            data: {
                status: "PAGA",
                data_pagamento: new Date()
            }
        });

        return {
            mensagem: "Multa marcada como paga.",
            id_multa: atualizado.id_multa,
            id_emprestimo: atualizado.id_emprestimo,
            multa: Number(atualizado.valor),
            status_multa: atualizado.status,
            data_pagamento: atualizado.data_pagamento
        };
    }
}

export { emprestimosServices };
