import { Request, Response } from "express";
import { mensagensServices } from "../Services/mensagensServices";
import { obterSocket } from "../Middleware/socket";

class mensagensController {
    private service = new mensagensServices();

    listarContatos = async (req: Request, res: Response) => {
        const idUsuario = Number(req.usuarioId);

        const contatos = await this.service.listarContatos(idUsuario);

        return res.json(contatos);
    };

     listarConversas = async (req: Request, res: Response) => {
        const idUsuario = Number(req.usuarioId);

        const conversas = await this.service.listarConversas(idUsuario);

        return res.json(conversas);
    }

    obterOuCriarConversa = async (req: Request, res: Response)  => {
        const idUsuario = Number(req.usuarioId);
        const idContato = Number(req.body.id_contato);

        const conversa = await this.service.obterOuCriarConversa(
            idUsuario,
            idContato
        );

        return res.status(200).json(conversa);
    }

    listarMensagens = async (req: Request, res: Response) => {
        const idUsuario = Number(req.usuarioId);
        const idConversa = Number(req.params.id_conversa);

        if (!Number.isInteger(idConversa) || idConversa <= 0) {
            return res.status(400).json({
                erro: "ID da conversa inválido."
            });
        }

        const mensagens = await this.service.listarMensagens(
            idConversa,
            idUsuario
        );

        return res.json(mensagens);
    }

    enviarMensagem = async (req: Request, res: Response) => {
        const idUsuario = Number(req.usuarioId);
        const idConversa = Number(req.params.id_conversa);
        const { conteudo } = req.body;

        if (!Number.isInteger(idConversa) || idConversa <= 0) {
            return res.status(400).json({
                erro: "ID da conversa inválido."
            });
        }

        const conversa = await this.service.verificarParticipacao(
            idConversa,
            idUsuario
        );

        const mensagem = await this.service.enviarMensagem(
            idConversa,
            idUsuario,
            conteudo
        );

        const socket = obterSocket();

        const destinatarioId =
            conversa.participanteAId === idUsuario
                ? conversa.participanteBId
                : conversa.participanteAId;

        socket.to(`usuario:${destinatarioId}`).emit(
            "mensagem:nova",
            mensagem
        );

        socket.to(`usuario:${idUsuario}`).emit(
            "mensagem:nova",
            mensagem
        );

        return res.status(201).json(mensagem);
    }

     marcarComoLidas = async (req: Request, res: Response) => {
        const idUsuario = Number(req.usuarioId);
        const idConversa = Number(req.params.id_conversa);

        if (!Number.isInteger(idConversa) || idConversa <= 0) {
            return res.status(400).json({
                erro: "ID da conversa inválido."
            });
        }

        const conversa = await this.service.verificarParticipacao(
            idConversa,
            idUsuario
        );

        const resultado = await this.service.marcarComoLidas(
            idConversa,
            idUsuario
        );

        const socket = obterSocket();

        const outroParticipante =
            conversa.participanteAId === idUsuario
                ? conversa.participanteBId
                : conversa.participanteAId;

        socket.to(`usuario:${outroParticipante}`).emit(
            "mensagem:lida",
            {
                id_conversa: idConversa,
                id_leitor: idUsuario
            }
        );

        return res.json(resultado);
    }
}

export { mensagensController };