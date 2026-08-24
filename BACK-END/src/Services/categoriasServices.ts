import prismaClient from "../Prisma/PrismaClient";

interface cadCategoria {
    nome: string
}

class categoriaServices {
    async cadastrarCategorias({nome}: cadCategoria) {

        const categoriaExiste = await prismaClient.categoria.findFirst({
            where: {
                nome
            }
        })
        
        if(categoriaExiste) {
            throw new Error("Categoria Existente.")
        }

        await prismaClient.categoria.create({
            data: {
                nome
            }
        })
        return ({ Dados: "Dados Salvos" })

      
    }
    async listarCategorias() {
    const categorias = await prismaClient.categoria.findMany()

    return categorias
    
    }

    async buscarCategorias(id_categorias: number) {
        const buscarCategoria = await  prismaClient.categoria.findUnique({
            where: {
                id_categorias
            }
        })

        if (!buscarCategoria) {
            throw new Error("Categoria não encontrada")
        }

        return buscarCategoria
    }

    async editarCategoria(id_categorias: number, { nome}: cadCategoria) {
        
        const categoria = await prismaClient.categoria.findUnique({
            where: {
                id_categorias
            }
        })

        if (!categoria) {
            throw new Error("Categoria não encontrada")
        }

        const categoriaExiste = await prismaClient.categoria.findFirst({
            where: {
                nome,
                NOT: {
                    id_categorias
                }
            }
        })

        if (categoriaExiste) {
            throw new Error("Já existe uma categoria com esse nome")
        }

        const categoriaAtualizada = await prismaClient.categoria.update({
            where: {
                id_categorias
            },
            data: {
                nome
            }
        })
        return categoriaAtualizada
    }

    async excluirCategoria(id_categorias: number) {
        const categoria = await prismaClient.categoria.findUnique({
            where: {
                id_categorias
            },
            include: {
                livros: true
            }
        })

        if (!categoria) {
            throw new Error("Categoria não encontrada")
        }

        if (categoria.livros.length > 0) {
            throw new Error("Não é possível excluir uma categoria com livros")
        }

        await prismaClient.categoria.delete({
            where: {
                id_categorias
            }
        })

        return {
            mensagem: "Categoria excluída com sucesso"
        }
    }
}


export { categoriaServices }