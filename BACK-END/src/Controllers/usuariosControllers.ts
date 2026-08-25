import { Request, Response } from "express"
import { usuariosServices } from "../Services/usuariosServices"

class usuariosController {

    async criarUsuario(req: Request, res: Response) {

        const {
            nome,
            email,
            senha,
            tipo
        } = req.body

        const service = new usuariosServices()

        const resposta = await service.criarUsuario({
            nome,
            email,
            senha,
            tipo
        })

        return res.json(resposta)
    }

    async listarUsuarios(req: Request, res: Response) {

        const service = new usuariosServices()

        const resposta = await service.listarUsuarios()

        return res.json(resposta)
    }

    async buscarUsuarioPorId(req: Request, res: Response) {

        const { id_usuarios } = req.params

        const service = new usuariosServices()

        const resposta = await service.buscarUsuarioPorId(
            Number(id_usuarios)
        )

        return res.json(resposta)
    }

    async buscarUsuarioPorEmail(req: Request, res: Response) {

        const { email } = req.params

        const service = new usuariosServices()

        const resposta = await service.buscarUsuarioPorEmail(email)

        return res.json(resposta)
    }

    async editarUsuario(req: Request, res: Response) {

        const { id_usuarios } = req.params

        const {
            nome,
            email,
            senha,
            tipo
        } = req.body

        const service = new usuariosServices()

        const resposta = await service.editarUsuario(
            Number(id_usuarios),
            {
                nome,
                email,
                senha,
                tipo
            }
        )

        return res.json(resposta)
    }

    async excluirUsuario(req: Request, res: Response) {

        const { id_usuarios } = req.params

        const service = new usuariosServices()

        const resposta = await service.excluirUsuario(
            Number(id_usuarios)
        )

        return res.json(resposta)
    }
}

export { usuariosController }