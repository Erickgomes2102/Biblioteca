import React, { useState } from "react";

import { cores, inputStyle } from "../empréstimos/styles/tema";
import Modal from "../components/comum/Modal";
import Campo from "../components/comum/Campo";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";

export default function ModalLivro({
  onFechar,
  onSalvar,
  categorias,
  livro
}) {

  const editando = !!livro;

  const [buscandoISBN, setBuscandoISBN] = useState(false);

  const [isbn, setIsbn] = useState(livro?.isbn || "");
  const [titulo, setTitulo] = useState(livro?.titulo || "");
  const [autor, setAutor] = useState(livro?.autor || "");
  const [editora, setEditora] = useState(livro?.editora || "");
  const [ano, setAno] = useState(
    livro?.ano ? String(livro.ano) : ""
  );

  const [quantidade, setQuantidade] = useState(
    livro?.quantidade ?? 1
  );

  const [id_categorias, setIdCategorias] = useState(
    livro?.id_categorias || ""
  );

  const [erro, setErro] = useState("");


  // =========================================================
  // BUSCAR LIVRO PELO ISBN
  // =========================================================

  const buscarLivroPorISBN = async (valor) => {

    const isbnLimpo = valor.replace(/[^0-9Xx]/g, "");

    if (
      isbnLimpo.length !== 10 &&
      isbnLimpo.length !== 13
    ) {
      return;
    }
  //VERSÃO ATUALIZADA
    try {

      setBuscandoISBN(true);
      setErro("");

      console.log("ISBN pesquisado:", isbnLimpo);


      // =====================================================
      // 1. BUSCA PRINCIPAL PELO ISBN
      // =====================================================

      const resposta = await fetch(
        `https://openlibrary.org/search.json?isbn=${isbnLimpo}&limit=1`
      );

      console.log(
        "Status Open Library:",
        resposta.status
      );

      if (!resposta.ok) {
        throw new Error(
          "Erro ao consultar a Open Library."
        );
      }


      const dados = await resposta.json();

      console.log(
        "Resposta da busca:",
        dados
      );


      const livroEncontrado = dados.docs?.[0];


      if (!livroEncontrado) {

        setErro("Livro não encontrado.");

        return;
      }


      // =====================================================
      // 2. TÍTULO
      // =====================================================

      if (livroEncontrado.title) {

        setTitulo(
          String(livroEncontrado.title)
        );
      }


      // =====================================================
      // 3. AUTOR
      // =====================================================

      if (
        livroEncontrado.author_name &&
        livroEncontrado.author_name.length > 0
      ) {

        setAutor(
          String(
            livroEncontrado.author_name[0]
          )
        );
      }


      // =====================================================
      // 4. ANO DA OBRA
      // =====================================================

      if (livroEncontrado.first_publish_year) {

        console.log(
          "Primeiro ano de publicação:",
          livroEncontrado.first_publish_year
        );

        setAno(
          String(
            livroEncontrado.first_publish_year
          )
        );
      }


      // =====================================================
      // 5. TENTAR PEGAR A EDIÇÃO
      // =====================================================

      const idEdicao =
        livroEncontrado.cover_edition_key;


      if (!idEdicao) {

        console.log(
          "A Open Library não retornou uma edição."
        );

        return;
      }


      console.log(
        "ID da edição:",
        idEdicao
      );


      // =====================================================
      // 6. BUSCAR DADOS DA EDIÇÃO
      // =====================================================

      const respostaEdicao = await fetch(
        `https://openlibrary.org/books/${idEdicao}.json`
      );


      console.log(
        "Status da edição:",
        respostaEdicao.status
      );


      if (!respostaEdicao.ok) {

        console.log(
          "Não foi possível buscar os dados da edição."
        );

        return;
      }


      const dadosEdicao =
        await respostaEdicao.json();


      console.log(
        "Dados da edição:",
        dadosEdicao
      );


      // =====================================================
      // 7. EDITORA
      // =====================================================

      if (
        dadosEdicao.publishers &&
        dadosEdicao.publishers.length > 0
      ) {

        const publisher =
          dadosEdicao.publishers[0];


        if (typeof publisher === "string") {

          setEditora(publisher);

        } else if (
          publisher &&
          publisher.name
        ) {

          setEditora(
            String(publisher.name)
          );
        }
      }


      // =====================================================
      // 8. DATA DE PUBLICAÇÃO DA EDIÇÃO
      // =====================================================

      if (dadosEdicao.publish_date) {

        console.log(
          "Data de publicação da edição:",
          dadosEdicao.publish_date
        );


        const resultadoAno =
          String(
            dadosEdicao.publish_date
          ).match(/\d{4}/);


        if (resultadoAno) {

          console.log(
            "Ano encontrado na edição:",
            resultadoAno[0]
          );

          setAno(
            resultadoAno[0]
          );
        }
      }


      console.log(
        "Livro preenchido automaticamente!"
      );

    } catch (error) {

      console.log(
        "Erro ao buscar livro pelo ISBN:",
        error
      );

      setErro(
        "Erro ao buscar informações do livro."
      );

    } finally {

      setBuscandoISBN(false);
    }
  };


  // =========================================================
  // ALTERAÇÃO DO ISBN
  // =========================================================

  const alterarISBN = (e) => {

    const valor = e.target.value;

    setIsbn(valor);

    const isbnLimpo =
      valor.replace(/[^0-9Xx]/g, "");


    if (
      isbnLimpo.length === 10 ||
      isbnLimpo.length === 13
    ) {

      buscarLivroPorISBN(valor);
    }
  };


  // =========================================================
  // SALVAR
  // =========================================================

  const salvar = () => {

    if (
      !isbn.trim() ||
      !titulo.trim() ||
      !autor.trim() ||
      !editora.trim() ||
      !ano ||
      quantidade === "" ||
      quantidade === null ||
      quantidade < 0 ||
      !id_categorias
    ) {

      setErro(
        "Preencha todos os campos."
      );

      return;
    }


    onSalvar({

      isbn: isbn.trim(),

      titulo: titulo.trim(),

      autor: autor.trim(),

      editora: editora.trim(),

      ano: Number(ano),

      quantidade: Number(quantidade),

      id_categorias:
        Number(id_categorias)
    });
  };


  // =========================================================
  // INTERFACE
  // =========================================================

  return (

    <Modal
      onFechar={onFechar}
      titulo={
        editando
          ? "Editar livro"
          : "Cadastrar livro"
      }
    >

      {/* ISBN */}

      <Campo label="ISBN">

        <input
          style={inputStyle}
          value={isbn}
          onChange={alterarISBN}
          placeholder="Digite o ISBN"
        />

        {buscandoISBN && (

          <p
            style={{
              marginTop: 6,
              fontSize: 12,
              color: cores.tintaSuave
            }}
          >
            Buscando informações do livro...
          </p>

        )}

      </Campo>


      {/* TÍTULO */}

      <Campo label="Título">

        <input
          style={inputStyle}
          value={titulo}
          onChange={(e) =>
            setTitulo(e.target.value)
          }
          placeholder="ex: The Mythical Man-Month"
        />

      </Campo>


      {/* AUTOR */}

      <Campo label="Autor">

        <input
          style={inputStyle}
          value={autor}
          onChange={(e) =>
            setAutor(e.target.value)
          }
          placeholder="ex: Frederick P. Brooks Jr."
        />

      </Campo>


      {/* EDITORA */}

      <Campo label="Editora">

        <input
          style={inputStyle}
          value={editora}
          onChange={(e) =>
            setEditora(e.target.value)
          }
          placeholder="ex: Addison-Wesley"
        />

      </Campo>


      {/* ANO */}

      <Campo label="Ano">

        <input
          type="number"
          style={inputStyle}
          value={ano}
          onChange={(e) =>
            setAno(e.target.value)
          }
          placeholder="ex: 1984"
        />

      </Campo>


      {/* QUANTIDADE */}

      <Campo label="Quantidade">

        <input
          type="number"
          min="0"
          style={inputStyle}
          value={quantidade}
          onChange={(e) =>
            setQuantidade(e.target.value)
          }
        />

      </Campo>


      {/* CATEGORIA */}

      <Campo label="Categoria">

        <select
          style={inputStyle}
          value={id_categorias}
          onChange={(e) =>
            setIdCategorias(e.target.value)
          }
        >

          <option value="">
            Selecione uma categoria
          </option>

          {categorias.map((categoria) => (

            <option
              key={categoria.id_categorias}
              value={categoria.id_categorias}
            >
              {categoria.nome}
            </option>

          ))}

        </select>

      </Campo>


      {/* ERRO */}

      {erro && (

        <p
          style={{
            color: cores.carimbo,
            fontSize: 13,
            marginBottom: 12
          }}
        >
          {erro}
        </p>

      )}


      {/* BOTÃO */}

      <BotaoPrincipal
        onClick={salvar}
        full
      >

        {editando
          ? "Salvar alterações"
          : "Salvar livro"}

      </BotaoPrincipal>

    </Modal>
  );
}