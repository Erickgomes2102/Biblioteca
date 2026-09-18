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

export async function buscarCapaPorISBN(
    isbn: string,
    titulo?: string
) {
    try {

        const isbnLimpo = isbn.replace(/[^0-9Xx]/g, "");

        console.log("=================================");
        console.log("Buscando capa");
        console.log("ISBN:", isbnLimpo);
        console.log("Título:", titulo);

        // =====================================================
        // 1. Open Library pelo ISBN
        // =====================================================

        const respostaISBN = await fetch(
            `https://openlibrary.org/api/books?bibkeys=ISBN:${isbnLimpo}&jscmd=data&format=json`
        );

        console.log(
            "Status Open Library ISBN:",
            respostaISBN.status
        );

        if (respostaISBN.ok) {

            const dadosISBN = await respostaISBN.json();

            const livroISBN =
                dadosISBN[`ISBN:${isbnLimpo}`];

            console.log(
                "Resultado Open Library ISBN:",
                livroISBN
            );

            if (livroISBN) {

                const capa =
                    livroISBN.cover?.medium ||
                    livroISBN.cover?.large ||
                    livroISBN.cover?.small;

                if (capa) {

                    console.log(
                        "CAPA ENCONTRADA PELO ISBN!"
                    );

                    return capa;
                }
            }
        }

        // =====================================================
        // 2. Google Books pelo ISBN
        // =====================================================

        try {

            const respostaGoogle = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnLimpo}`
            );

            console.log(
                "Status Google Books:",
                respostaGoogle.status
            );

            if (respostaGoogle.ok) {

                const dados =
                    await respostaGoogle.json();

                const livros =
                    dados.items || [];

                for (const livro of livros) {

                    const info =
                        livro.volumeInfo;

                    const imagem =
                        info?.imageLinks?.thumbnail ||
                        info?.imageLinks?.smallThumbnail;

                    if (imagem) {

                        console.log(
                            "Capa encontrada na Google Books:"
                        );

                        console.log(
                            "Título:",
                            info?.title
                        );

                        console.log(
                            "ISBNs:",
                            info?.industryIdentifiers
                        );

                        // Verifica se o ISBN pesquisado
                        // aparece nos identificadores.
                        const possuiISBN =
                            info?.industryIdentifiers?.some(
                                (identificador: any) =>
                                    identificador.identifier
                                        ?.replace(/[^0-9Xx]/g, "") ===
                                    isbnLimpo
                            );

                        if (possuiISBN) {

                            return imagem.replace(
                                "http://",
                                "https://"
                            );
                        }
                    }
                }
            }

        } catch (error) {

            console.log(
                "Google Books indisponível."
            );
        }

        // =====================================================
        // 3. Busca pelo título na Open Library
        // =====================================================

        if (
            titulo &&
            titulo.trim() !== ""
        ) {

            const consulta =
                encodeURIComponent(
                    titulo.trim()
                );

            const respostaTitulo =
                await fetch(
                    `https://openlibrary.org/search.json?title=${consulta}&limit=20`
                );

            console.log(
                "Status busca título:",
                respostaTitulo.status
            );

            if (respostaTitulo.ok) {

                const dados =
                    await respostaTitulo.json();

                const livros =
                    dados.docs || [];

                const tituloPesquisado =
                    titulo
                        .toLowerCase()
                        .trim();

                for (const livro of livros) {

                    if (!livro.cover_i) {
                        continue;
                    }

                    const tituloAPI =
                        (livro.title || "")
                            .toLowerCase()
                            .trim();

                    // Aceita somente títulos
                    // razoavelmente compatíveis.
                    const tituloCompativel =
                        tituloAPI === tituloPesquisado ||
                        tituloAPI.includes(tituloPesquisado) ||
                        tituloPesquisado.includes(tituloAPI);

                    if (!tituloCompativel) {
                        continue;
                    }

                    const capa =
                        `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`;

                    console.log(
                        "CAPA ENCONTRADA PELO TÍTULO!"
                    );

                    console.log(
                        "Título encontrado:",
                        livro.title
                    );

                    return capa;
                }
            }
        }

        console.log(
            "NENHUMA CAPA CONFIÁVEL ENCONTRADA."
        );

        return null;

    } catch (error) {

        console.log(
            "Erro ao buscar capa:",
            error
        );

        return null;
    }
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

        if (!isbn || isbn.trim() === "") {
            throw new Error("ISBN é obrigatório");
        }

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
            throw new Error(
                "A quantidade não pode ser negativa"
            );
        }

        const capa = await buscarCapaPorISBN(
            isbn,
            titulo
        );

        const livro = await prismaClient.livro.create({
            data: {
                isbn,
                titulo,
                autor,
                editora,
                ano,
                quantidade,
                id_categorias,
                capa
            },
            include: {
                categoria: true
            }
        });

        return livro;
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

        // Procura capas para livros antigos
        // que ainda não possuem capa.
        for (const livro of livros) {

            if (!livro.capa) {

                try {

                    const capa = await buscarCapaPorISBN(
                        livro.isbn,
                        livro.titulo
                    );

                    if (capa) {

                        await prismaClient.livro.update({
                            where: {
                                id_livros: livro.id_livros
                            },
                            data: {
                                capa
                            }
                        });

                        livro.capa = capa;
                    }

                } catch (error) {

                    console.log(
                        `Não foi possível buscar a capa do livro ${livro.titulo}`
                    );
                }
            }
        }

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

        const isbnExistente =
            await prismaClient.livro.findFirst({
                where: {
                    isbn: dados.isbn,
                    NOT: {
                        id_livros
                    }
                }
            });

        if (isbnExistente) {
            throw new Error(
                "ISBN já cadastrado em outro livro"
            );
        }
    }

    if (dados.id_categorias !== undefined) {

        const categoria =
            await prismaClient.categoria.findUnique({
                where: {
                    id_categorias: dados.id_categorias
                }
            });

        if (!categoria) {
            throw new Error(
                "Categoria não encontrada"
            );
        }
    }

    if (
        dados.quantidade !== undefined &&
        dados.quantidade < 0
    ) {
        throw new Error(
            "A quantidade não pode ser negativa"
        );
    }

    // Usa o ISBN e o título novos, caso tenham sido alterados.
    // Caso contrário, usa os valores que já estavam cadastrados.
    const isbnFinal =
        dados.isbn !== undefined
            ? dados.isbn
            : livro.isbn;

    const tituloFinal =
        dados.titulo !== undefined
            ? dados.titulo
            : livro.titulo;

    // Mantém a capa antiga caso a busca nova não encontre nada.
    let capa = livro.capa;

    const novaCapa = await buscarCapaPorISBN(
        isbnFinal,
        tituloFinal
    );

    if (novaCapa) {
        capa = novaCapa;
    }

    const livroAtualizado =
        await prismaClient.livro.update({
            where: {
                id_livros
            },
            data: {
                ...dados,
                capa
            },
            include: {
                categoria: true
            }
        });

    return livroAtualizado;
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
            throw new Error(
                "Livro não encontrado"
            );
        }

        // Remove os empréstimos relacionados
        // antes de remover o livro.
        await prismaClient.emprestimo.deleteMany({
            where: {
                id_livros
            }
        });

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