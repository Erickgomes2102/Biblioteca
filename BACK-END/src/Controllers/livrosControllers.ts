import { Request, Response } from "express"
import { livrosServices } from "../Services/livrosServices"

class livrosController {

    async criarLivro(req: Request, res: Response) {

        const {
            isbn,
            titulo,
            autor,
            editora,
            ano,
            quantidade,
            id_categorias
        } = req.body

        const service = new livrosServices()

        const resposta = await service.criarLivro({
            isbn,
            titulo,
            autor,
            editora,
            ano,
            quantidade,
            id_categorias
        })

        return res.json(resposta)
    }

    async listarLivros(req: Request, res: Response) {

        const service = new livrosServices()

        const resposta = await service.listarLivros()

        return res.json(resposta)
    }

    async buscarLivroPorId(req: Request, res: Response) {

        const { id_livros } = req.params

        const service = new livrosServices()

        const resposta = await service.buscarLivroPorId(Number(id_livros))

        return res.json(resposta)
    }

    async buscarLivroPorISBN(req: Request, res: Response) {

        const { isbn } = req.params

        const service = new livrosServices()

        const resposta = await service.buscarLivroPorISBN(isbn)

        return res.json(resposta)
    }

    async editarLivro(req: Request, res: Response) {

        const { id_livros } = req.params

        const {
            isbn,
            titulo,
            autor,
            editora,
            ano,
            quantidade,
            id_categorias
        } = req.body

        const service = new livrosServices()

        const resposta = await service.editarLivro(
            Number(id_livros),
            {
                isbn,
                titulo,
                autor,
                editora,
                ano,
                quantidade,
                id_categorias
            }
        )

        return res.json(resposta)
    }

    async excluirLivro(req: Request, res: Response) {

        const { id_livros } = req.params

        const service = new livrosServices()

        const resposta = await service.excluirLivro(Number(id_livros))

        return res.json(resposta)
    }
}

export { livrosController }