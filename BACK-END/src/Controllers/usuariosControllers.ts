import { Request, Response } from "express"
import { usuariosServices } from "../Services/usuariosServices"

class usuariosController {

    // =====================================================
    // CRIAR USUÁRIO
    // =====================================================

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


    // =====================================================
    // LISTAR USUÁRIOS
    // =====================================================

    async listarUsuarios(req: Request, res: Response) {

        const service = new usuariosServices()

        const resposta =
            await service.listarUsuarios()

        return res.json(resposta)
    }


    // =====================================================
    // BUSCAR USUÁRIO POR ID
    // =====================================================

    async buscarUsuarioPorId(
        req: Request,
        res: Response
    ) {

        const { id_usuarios } = req.params

        const service = new usuariosServices()

        const resposta =
            await service.buscarUsuarioPorId(
                Number(id_usuarios)
            )

        return res.json(resposta)
    }


    // =====================================================
    // BUSCAR USUÁRIO POR EMAIL
    // =====================================================

    async buscarUsuarioPorEmail(
        req: Request,
        res: Response
    ) {

        const { email } = req.params

        const service = new usuariosServices()

        const resposta =
            await service.buscarUsuarioPorEmail(
                email
            )

        return res.json(resposta)
    }


    // =====================================================
    // EDITAR USUÁRIO
    // =====================================================

    async editarUsuario(
        req: Request,
        res: Response
    ) {

        const { id_usuarios } = req.params

        const {
            nome,
            email,
            senha,
            tipo
        } = req.body

        const service = new usuariosServices()

        const resposta =
            await service.editarUsuario(
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


    // =====================================================
    // EXCLUIR USUÁRIO
    // =====================================================

    async excluirUsuario(
        req: Request,
        res: Response
    ) {

        const { id_usuarios } = req.params

        const service = new usuariosServices()

        const resposta =
            await service.excluirUsuario(
                Number(id_usuarios)
            )

        return res.json(resposta)
    }


    // =====================================================
    // ALTERAR PRIVILÉGIO
    // =====================================================

    async alterarPrivilegio(
        req: Request,
        res: Response
    ) {

        const id_usuarios =
            Number(req.params.id_usuarios)

        const { tipo } = req.body

        const service = new usuariosServices()

        const resposta =
            await service.alterarPrivilegio(
                id_usuarios,
                tipo
            )

        return res.json(resposta)
    }

}

export { usuariosController }