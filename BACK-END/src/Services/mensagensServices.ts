
import prismaClient from "../Prisma/PrismaClient";

class mensagensServices {
    async listarContatos(idUsuario: number) {
        const usuario = await prismaClient.usuario.findUnique({
            where: { id_usuarios: idUsuario },
            select: { tipo: true }
        });

        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }

        const tiposPermitidos =
            usuario.tipo === "ADMINISTRADOR"
                ? ["ADMINISTRADOR", "BIBLIOTECÁRIO"]
                : ["ADMINISTRADOR"];

        return prismaClient.usuario.findMany({
            where: {
                id_usuarios: { not: idUsuario },
                tipo: { in: tiposPermitidos }
            },
            select: {
                id_usuarios: true,
                nome: true,
                email: true,
                tipo: true,
                avatar: true
            },
            orderBy: { nome: "asc" }
        });
    }

    async listarConversas(idUsuario: number) {
        const conversas = await prismaClient.conversa.findMany({
            where: {
                OR: [
                    { participanteAId: idUsuario },
                    { participanteBId: idUsuario }
                ]
            },
            include: {
                participanteA: {
                    select: {
                        id_usuarios: true,
                        nome: true,
                        tipo: true,
                        avatar: true
                    }
                },
                participanteB: {
                    select: {
                        id_usuarios: true,
                        nome: true,
                        tipo: true,
                        avatar: true
                    }
                },
                mensagens: {
                    orderBy: { enviada_em: "desc" },
                    take: 1
                }
            },
            orderBy: { criada_em: "desc" }
        });

        return Promise.all(
            conversas.map(async (conversa) => {
                const naoLidas = await prismaClient.mensagem.count({
                    where: {
                        id_conversa: conversa.id_conversa,
                        id_remetente: { not: idUsuario },
                        lida_em: null
                    }
                });

                const contato =
                    conversa.participanteAId === idUsuario
                        ? conversa.participanteB
                        : conversa.participanteA;

                return {
                    id_conversa: conversa.id_conversa,
                    contato,
                    ultimaMensagem: conversa.mensagens[0] ?? null,
                    naoLidas
                };
            })
        );
    }

    async obterOuCriarConversa(
        idUsuario: number,
        idContato: number
    ) {
        if (
            !Number.isInteger(idContato) ||
            idContato <= 0 ||
            idUsuario === idContato
        ) {
            throw new Error("Destinatário inválido.");
        }

        const [usuario, contato] = await Promise.all([
            prismaClient.usuario.findUnique({
                where: { id_usuarios: idUsuario },
                select: { id_usuarios: true, tipo: true }
            }),
            prismaClient.usuario.findUnique({
                where: { id_usuarios: idContato },
                select: { id_usuarios: true, tipo: true }
            })
        ]);

        if (!usuario || !contato) {
            throw new Error("Usuário não encontrado.");
        }

        if (
            usuario.tipo !== "ADMINISTRADOR" &&
            contato.tipo !== "ADMINISTRADOR"
        ) {
            throw new Error(
                "Bibliotecários só podem iniciar conversas com administradores."
            );
        }

        const participanteAId = Math.min(idUsuario, idContato);
        const participanteBId = Math.max(idUsuario, idContato);

        const existente = await prismaClient.conversa.findUnique({
            where: {
                participanteAId_participanteBId: {
                    participanteAId,
                    participanteBId
                }
            }
        });

        if (existente) {
            return existente;
        }

        return prismaClient.conversa.create({
            data: {
                participanteAId,
                participanteBId
            }
        });
    }

    async verificarParticipacao(
        idConversa: number,
        idUsuario: number
    ) {
        const conversa = await prismaClient.conversa.findFirst({
            where: {
                id_conversa: idConversa,
                OR: [
                    { participanteAId: idUsuario },
                    { participanteBId: idUsuario }
                ]
            }
        });

        if (!conversa) {
            throw new Error(
                "Conversa não encontrada ou acesso não permitido."
            );
        }

        return conversa;
    }

    async listarMensagens(
        idConversa: number,
        idUsuario: number
    ) {
        await this.verificarParticipacao(idConversa, idUsuario);

        return prismaClient.mensagem.findMany({
            where: { id_conversa: idConversa },
            include: {
                remetente: {
                    select: {
                        id_usuarios: true,
                        nome: true,
                        tipo: true,
                        avatar: true
                    }
                }
            },
            orderBy: { enviada_em: "asc" }
        });
    }

    async enviarMensagem(
        idConversa: number,
        idUsuario: number,
        conteudo: string
    ) {
        await this.verificarParticipacao(idConversa, idUsuario);

        if (typeof conteudo !== "string" || !conteudo.trim()) {
            throw new Error("A mensagem não pode estar vazia.");
        }

        const texto = conteudo.trim();

        if (texto.length > 2000) {
            throw new Error(
                "A mensagem não pode ultrapassar 2000 caracteres."
            );
        }

        return prismaClient.mensagem.create({
            data: {
                id_conversa: idConversa,
                id_remetente: idUsuario,
                conteudo: texto
            },
            include: {
                remetente: {
                    select: {
                        id_usuarios: true,
                        nome: true,
                        tipo: true,
                        avatar: true
                    }
                }
            }
        });
    }

    async marcarComoLidas(
        idConversa: number,
        idUsuario: number
    ) {
        await this.verificarParticipacao(idConversa, idUsuario);

        const resultado = await prismaClient.mensagem.updateMany({
            where: {
                id_conversa: idConversa,
                id_remetente: { not: idUsuario },
                lida_em: null
            },
            data: {
                lida_em: new Date()
            }
        });

        return {
            atualizadas: resultado.count
        };
    }
}

export { mensagensServices };
