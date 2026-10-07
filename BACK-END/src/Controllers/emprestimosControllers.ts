import { Request, Response } from "express";
import { emprestimosServices } from "../Services/emprestimosServices";

class emprestimosController {

    // =====================================================
    // CRIAR EMPRÉSTIMO
    // =====================================================

    async criarEmprestimo(
        req: Request,
        res: Response
    ) {

        const {
            id_leitores,
            id_livros,
            id_usuarios,
            data_emprestimo,
            data_prevista,
            data_devolucao
        } = req.body;

        const service =
            new emprestimosServices();

        const resposta =
            await service.criarEmprestimo({
                id_leitores,
                id_livros,
                id_usuarios,
                data_emprestimo:
                    new Date(data_emprestimo),
                data_prevista:
                    data_prevista
                        ? new Date(data_prevista)
                        : null,
                data_devolucao:
                    new Date(data_devolucao)
            });

        return res.json(resposta);
    }


    // =====================================================
    // LISTAR EMPRÉSTIMOS
    // =====================================================

    async listarEmprestimos(
        req: Request,
        res: Response
    ) {

        const service =
            new emprestimosServices();

        const resposta =
            await service.listarEmprestimos();

        return res.json(resposta);
    }


    // =====================================================
    // BUSCAR EMPRÉSTIMO POR ID
    // =====================================================

    async buscarEmprestimoPorId(
        req: Request,
        res: Response
    ) {

        const {
            id_emprestimo
        } = req.params;

        const service =
            new emprestimosServices();

        const resposta =
            await service.buscarEmprestimoPorId(
                Number(id_emprestimo)
            );

        return res.json(resposta);
    }


    // =====================================================
    // LISTAR EMPRÉSTIMOS ATIVOS
    // =====================================================

    async listarEmprestimosAtivos(
        req: Request,
        res: Response
    ) {

        const service =
            new emprestimosServices();

        const resposta =
            await service.listarEmprestimosAtivos();

        return res.json(resposta);
    }


    // =====================================================
    // LISTAR EMPRÉSTIMOS ATRASADOS
    // =====================================================

    async listarEmprestimosAtrasados(
        req: Request,
        res: Response
    ) {

        const service =
            new emprestimosServices();

        const resposta =
            await service.listarEmprestimosAtrasados();

        return res.json(resposta);
    }


    // =====================================================
    // DEVOLVER LIVRO
    // =====================================================

    async devolverLivro(
        req: Request,
        res: Response
    ) {

        const {
            id_emprestimo
        } = req.params;

        const service =
            new emprestimosServices();

        const resposta =
            await service.devolverLivro(
                Number(id_emprestimo)
            );

        return res.json(resposta);
    }


    // =====================================================
    // CALCULAR MULTA
    // =====================================================

    async calcularMulta(
        req: Request,
        res: Response
    ) {

        const {
            id_emprestimo
        } = req.params;

        const service =
            new emprestimosServices();

        const resposta =
            await service.calcularMulta(
                Number(id_emprestimo)
            );

        return res.json({
            multa: resposta
        });
    }


    // =====================================================
    // LISTAR MULTAS
    // =====================================================

    async listarMultas(
        req: Request,
        res: Response
    ) {

        const service =
            new emprestimosServices();

        const resposta =
            await service.listarMultas();

        return res.json(resposta);
    }


    // =====================================================
    // CONSULTAR MULTA
    // =====================================================

    async consultarMulta(
        req: Request,
        res: Response
    ) {

        const {
            id_emprestimo
        } = req.params;

        const service =
            new emprestimosServices();

        const resposta =
            await service.consultarMulta(
                Number(id_emprestimo)
            );

        return res.json(resposta);
    }


    // =====================================================
    // MARCAR MULTA COMO PAGA
    // =====================================================

    async marcarMultaComoPaga(
        req: Request,
        res: Response
    ) {

        const {
            id_emprestimo
        } = req.params;

        const service =
            new emprestimosServices();

        const resposta =
            await service.marcarMultaComoPaga(
                Number(id_emprestimo)
            );

        return res.json(resposta);
    }


    // =====================================================
    // CANCELAR EMPRÉSTIMO
    // =====================================================

    async cancelarEmprestimo(
        req: Request,
        res: Response
    ) {

        const {
            id_emprestimo
        } = req.params;

        const service =
            new emprestimosServices();

        const resposta =
            await service.cancelarEmprestimo(
                Number(id_emprestimo)
            );

        return res.json(resposta);
    }


    // =====================================================
    // EXCLUIR EMPRÉSTIMO DEVOLVIDO
    // =====================================================

    async excluirEmprestimo(
        req: Request,
        res: Response
    ) {

        const {
            id_emprestimo
        } = req.params;

        const service =
            new emprestimosServices();

        const resposta =
            await service.excluirEmprestimo(
                Number(id_emprestimo)
            );

        return res.json(resposta);
    }
}


export {
    emprestimosController
};