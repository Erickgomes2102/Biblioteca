import prismaClient from "../Prisma/PrismaClient";

class dashboardServices {

    async obterEstatisticas() {

        const totalLivros = await prismaClient.livro.aggregate({
            _sum: {
                quantidade: true
            }
        });

        const livrosEmprestados = await prismaClient.emprestimo.count({
            where: {
                status: "ATIVO"
            }
        });

        const usuariosCadastrados = await prismaClient.usuario.count();

        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const fimMes = new Date();
        fimMes.setMonth(fimMes.getMonth() + 1);
        fimMes.setDate(0);
        fimMes.setHours(23, 59, 59, 999);

        const emprestimosMes = await prismaClient.emprestimo.count({
            where: {
                data_emprestimo: {
                    gte: inicioMes,
                    lte: fimMes
                }
            }
        });

        const livrosDisponiveis =
            (totalLivros._sum.quantidade || 0);

        return {
            totalLivros: livrosDisponiveis + livrosEmprestados,
            livrosEmprestados,
            livrosDisponiveis,
            usuariosCadastrados,
            emprestimosMes
        };
    }
}

export { dashboardServices };