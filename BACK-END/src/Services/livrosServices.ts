import prismaClient from "../Prisma/PrismaClient";

interface cadLivros {
    isbn: string,
    titulo: string,
    autor: string,
    editora: string,
    ano: number,
    quantidade: number,
    id_categorias: number
}

interface editarLivros {
    isbn?: string,
    titulo?: string,
    autor?: string,
    editora?: string,
    ano?: number,
    quantidade?: number,
    id_categorias?: number
}

class livrosServices {

    async criarLivro({
        isbn,
        titulo,
        autor,
        editora,
        ano,
        quantidade,
        id_categorias
    }: cadLivros) {

        const livroExistente = await prismaClient.livro.findUnique({
            where: {
                isbn
            }
        });

        if (livroExistente) {
            throw new Error("ISBN já cadastrado");
        }

        const categoria = await prismaClient.categoria.findUnique({
            where: {
                id_categorias
            }
        });

        if (!categoria) {
            throw new Error("Categoria não encontrada");
        }

        if (quantidade < 0) {
            throw new Error("A quantidade não pode ser negativa");
        }

        if (!isbn || isbn.trim() === "") {
    throw new Error("ISBN é obrigatório");
}

        const livro = await prismaClient.livro.create({
            data: {
                isbn,
                titulo,
                autor,
                editora,
                ano,
                quantidade,
                id_categorias
            }
        });

        return ({Dados: "Dados Salvos"});
    }

    async listarLivros() {

        const livros = await prismaClient.livro.findMany({
            include: {
                categoria: true
            },
            orderBy: {
                titulo: "asc"
            }
        });

        return livros;
    }

    async buscarLivroPorId(id_livros: number) {

        const livro = await prismaClient.livro.findUnique({
            where: {
                id_livros
            },
            include: {
                categoria: true
            }
        });

        if (!livro) {
            throw new Error("Livro não encontrado");
        }

        return livro;
    }

    async buscarLivroPorISBN(isbn: string) {

        const livro = await prismaClient.livro.findUnique({
            where: {
                isbn
            },
            include: {
                categoria: true
            }
        });

        if (!livro) {
            throw new Error("Livro não encontrado");
        }

        return livro;
    }

    async editarLivro(
    id_livros: number,
    dados: editarLivros
) {

    const livro = await prismaClient.livro.findUnique({
        where: {
            id_livros
        }
    });

    if (!livro) {
        throw new Error("Livro não encontrado");
    }

    if (dados.isbn !== undefined) {

        const isbnExistente = await prismaClient.livro.findFirst({
            where: {
                isbn: dados.isbn,
                NOT: {
                    id_livros
                }
            }
        });

        if (isbnExistente) {
            throw new Error("ISBN já cadastrado em outro livro");
        }
    }

    if (dados.id_categorias !== undefined) {

        const categoria = await prismaClient.categoria.findUnique({
            where: {
                id_categorias: dados.id_categorias
            }
        });

        if (!categoria) {
            throw new Error("Categoria não encontrada");
        }
    }

    if (dados.quantidade !== undefined && dados.quantidade < 0) {
        throw new Error("A quantidade não pode ser negativa");
    }

    await prismaClient.livro.update({
        where: {
            id_livros
        },
        data: dados
    });

    return {
        Dados: "Dados Editados"
    };
}

    async excluirLivro(id_livros: number) {

        const livro = await prismaClient.livro.findUnique({
            where: {
                id_livros
            },
            include: {
                emprestimos: true
            }
        });

        if (!livro) {
            throw new Error("Livro não encontrado");
        }

        if (livro.emprestimos.length > 0) {
            throw new Error(
                "Não é possível excluir um livro que possui empréstimos registrados"
            );
        }

        await prismaClient.livro.delete({
            where: {
                id_livros
            }
        });

        return {
            mensagem: "Livro excluído com sucesso"
        };
    }
}

export { livrosServices };