import { Request, Response } from "express"
import { leitoresServices } from "../Services/leitoresServices"

class leitoresController {

    async criarLeitor(req: Request, res: Response) {

        const {
            nome,
            cpf,
            telefone,
            email,
            id_usuarios
        } = req.body

        const service = new leitoresServices()

        const resposta = await service.criarLeitor({
            nome,
            cpf,
            telefone,
            email,
            id_usuarios
        })

        return res.json(resposta)
    }


    async listarLeitores(req: Request, res: Response) {

        const service = new leitoresServices()

        const resposta = await service.listarLeitores()

        return res.json(resposta)
    }


    async buscarLeitorPorId(req: Request, res: Response) {

        const { id_leitores } = req.params

        const service = new leitoresServices()

        const resposta = await service.buscarLeitorPorId(
            Number(id_leitores)
        )

        return res.json(resposta)
    }


    async buscarLeitorPorCPF(req: Request, res: Response) {

        const { cpf } = req.params

        const service = new leitoresServices()

        const resposta = await service.buscarLeitorPorCPF(cpf)

        return res.json(resposta)
    }


    async editarLeitor(req: Request, res: Response) {

        const { id_leitores } = req.params

        const {
            nome,
            cpf,
            telefone,
            email,
            id_usuarios
        } = req.body

        const service = new leitoresServices()

        const resposta = await service.editarLeitor(
            Number(id_leitores),
            {
                nome,
                cpf,
                telefone,
                email,
                id_usuarios
            }
        )

        return res.json(resposta)
    }


    async excluirLeitor(req: Request, res: Response) {

        const { id_leitores } = req.params

        const service = new leitoresServices()

        const resposta = await service.excluirLeitor(
            Number(id_leitores)
        )

        return res.json(resposta)
    }
}

export { leitoresController }