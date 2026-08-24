import { Request, Response } from "express"
import { categoriaServices } from "../Services/categoriasServices"

class categoriaController {

    async cadastrarCategorias(req: Request, res: Response) {
        const { nome } = req.body

        const service = new categoriaServices()
        const resposta = await service.cadastrarCategorias({ 
            nome
        })
        return res.json(resposta)
     
    }

    async listarCategorias(req: Request, res: Response) {
        const service = new categoriaServices()
        const resposta = await service.listarCategorias()

        return res.json(resposta)
    }

    async buscarCategorias(req: Request, res: Response) {

        const { id_categorias } = req.params

        const service = new categoriaServices()
        const resposta = await service.buscarCategorias(Number(id_categorias))

        return res.json(resposta)
    }

    async editarCategorias(req: Request, res: Response) {

        const { id_categorias } = req.params
        const { nome } = req.body

        const service = new categoriaServices()

        const resposta = await service.editarCategoria(Number(id_categorias), { nome})
        return res.json(resposta)

    }

    async excluirCategorias(req: Request, res:Response) {
        const { id_categorias } = req.params

        const service = new categoriaServices()

        const resposta = await service.excluirCategoria(Number(id_categorias))

        return res.json(resposta)
        
    }
}

export { categoriaController }
