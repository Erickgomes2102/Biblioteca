import { Request, Response } from "express"
import { emprestimosServices } from "../Services/emprestimosServices"

class emprestimosController {

  async criarEmprestimo(req: Request, res: Response) {

    const {
        id_leitores,
        id_livros,
        id_usuarios,
        data_emprestimo,
        data_prevista,
        data_devolucao
    } = req.body

    const service = new emprestimosServices()

    const resposta = await service.criarEmprestimo({
        id_leitores,
        id_livros,
        id_usuarios,
        data_emprestimo: new Date(data_emprestimo),
        data_prevista: data_prevista
            ? new Date(data_prevista)
            : null,
        data_devolucao: new Date(data_devolucao)
    })

    return res.json(resposta)
}

    async listarEmprestimos(req: Request, res: Response) {

        const service = new emprestimosServices()

        const resposta = await service.listarEmprestimos()

        return res.json(resposta)
    }


    async buscarEmprestimoPorId(req: Request, res: Response) {

        const { id_emprestimo } = req.params

        const service = new emprestimosServices()

        const resposta = await service.buscarEmprestimoPorId(
            Number(id_emprestimo)
        )

        return res.json(resposta)
    }


    async listarEmprestimosAtivos(req: Request, res: Response) {

        const service = new emprestimosServices()

        const resposta = await service.listarEmprestimosAtivos()

        return res.json(resposta)
    }


    async listarEmprestimosAtrasados(req: Request, res: Response) {

        const service = new emprestimosServices()

        const resposta = await service.listarEmprestimosAtrasados()

        return res.json(resposta)
    }


    async devolverLivro(req: Request, res: Response) {

        const { id_emprestimo } = req.params

        const service = new emprestimosServices()

        const resposta = await service.devolverLivro(
            Number(id_emprestimo)
        )

        return res.json(resposta)
    }


    async calcularMulta(req: Request, res: Response) {

        const { id_emprestimo } = req.params

        const service = new emprestimosServices()

        const resposta = await service.calcularMulta(
            Number(id_emprestimo)
        )

        return res.json({
            multa: resposta
        })
    }


    async cancelarEmprestimo(req: Request, res: Response) {

        const { id_emprestimo } = req.params

        const service = new emprestimosServices()

        const resposta = await service.cancelarEmprestimo(
            Number(id_emprestimo)
        )

        return res.json(resposta)
    }
}

export { emprestimosController }