
import { Request, Response } from "express";
import { leitoresServices } from "../Services/leitoresServices";

class leitoresController {
    async criarLeitor(req: Request, res: Response) {
        try {
            const {
                nome,
                cpf,
                telefone,
                email,
                id_usuarios
            } = req.body;

            const service = new leitoresServices();

            const resposta = await service.criarLeitor({
                nome,
                cpf,
                telefone,
                email,
                id_usuarios
            });

            return res.json(resposta);
        } catch (erro) {
            const mensagem =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao cadastrar leitor";

            return res.status(400).json({ erro: mensagem });
        }
    }

    async listarLeitores(req: Request, res: Response) {
        try {
            const service = new leitoresServices();
            const resposta = await service.listarLeitores();

            return res.json(resposta);
        } catch (erro) {
            const mensagem =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao listar leitores";

            return res.status(500).json({ erro: mensagem });
        }
    }

    async buscarLeitorPorId(req: Request, res: Response) {
        try {
            const id_leitores = Number(req.params.id_leitores);

            if (!Number.isInteger(id_leitores) || id_leitores <= 0) {
                return res.status(400).json({
                    erro: "ID do leitor inválido"
                });
            }

            const service = new leitoresServices();
            const resposta = await service.buscarLeitorPorId(id_leitores);

            return res.json(resposta);
        } catch (erro) {
            const mensagem =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao buscar leitor";

            return res.status(400).json({ erro: mensagem });
        }
    }

    async buscarLeitorPorCPF(req: Request, res: Response) {
        try {
            const { cpf } = req.params;

            const service = new leitoresServices();
            const resposta = await service.buscarLeitorPorCPF(cpf);

            return res.json(resposta);
        } catch (erro) {
            const mensagem =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao buscar leitor";

            return res.status(400).json({ erro: mensagem });
        }
    }

    async editarLeitor(req: Request, res: Response) {
        try {
            const id_leitores = Number(req.params.id_leitores);

            if (!Number.isInteger(id_leitores) || id_leitores <= 0) {
                return res.status(400).json({
                    erro: "ID do leitor inválido"
                });
            }

            const {
                nome,
                cpf,
                telefone,
                email,
                id_usuarios
            } = req.body;

            const service = new leitoresServices();

            const resposta = await service.editarLeitor(
                id_leitores,
                {
                    nome,
                    cpf,
                    telefone,
                    email,
                    id_usuarios
                }
            );

            return res.json(resposta);
        } catch (erro) {
            const mensagem =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao editar leitor";

            return res.status(400).json({ erro: mensagem });
        }
    }

    async cancelarSuspensao(req: Request, res: Response) {
        try {
            const id_leitores = Number(req.params.id_leitores);

            if (!Number.isInteger(id_leitores) || id_leitores <= 0) {
                return res.status(400).json({
                    erro: "ID do leitor inválido"
                });
            }

            const service = new leitoresServices();
            const leitor = await service.cancelarSuspensao(id_leitores);

            return res.status(200).json({
                mensagem: "Suspensão cancelada com sucesso",
                leitor
            });
        } catch (erro) {
            const mensagem =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao cancelar suspensão";

            return res.status(400).json({ erro: mensagem });
        }
    }

    async excluirLeitor(req: Request, res: Response) {
        try {
            const id_leitores = Number(req.params.id_leitores);

            if (!Number.isInteger(id_leitores) || id_leitores <= 0) {
                return res.status(400).json({
                    erro: "ID do leitor inválido"
                });
            }

            const service = new leitoresServices();
            const resposta = await service.excluirLeitor(id_leitores);

            return res.json(resposta);
        } catch (erro) {
            const mensagem =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao excluir leitor";

            return res.status(400).json({ erro: mensagem });
        }
    }
}

export { leitoresController };
