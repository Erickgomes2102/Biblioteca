import React, { useState } from "react";

import { cores, inputStyle } from "../empréstimos/styles/tema";
import Modal from "../components/comum/Modal";
import Campo from "../components/comum/Campo";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";

export default function ModalLivro({
  onFechar,
  onSalvar,
  categorias
}) {
  const [isbn, setIsbn] = useState("");
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [editora, setEditora] = useState("");
  const [ano, setAno] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [id_categorias, setIdCategorias] =
    useState("");
  const [erro, setErro] = useState("");

  const salvar = () => {
    if (
      !isbn.trim() ||
      !titulo.trim() ||
      !autor.trim() ||
      !editora.trim() ||
      !ano ||
      !quantidade ||
      !id_categorias
    ) {
      setErro("Preencha todos os campos.");
      return;
    }

    onSalvar({
      isbn: isbn.trim(),
      titulo: titulo.trim(),
      autor: autor.trim(),
      editora: editora.trim(),
      ano: Number(ano),
      quantidade: Number(quantidade),
      id_categorias: Number(id_categorias)
    });
  };

  return (
    <Modal
      onFechar={onFechar}
      titulo="Cadastrar livro"
    >
      <Campo label="ISBN">
        <input
          style={inputStyle}
          value={isbn}
          onChange={(e) =>
            setIsbn(e.target.value)
          }
          placeholder="ex: 9788501110670"
        />
      </Campo>

      <Campo label="Título">
        <input
          style={inputStyle}
          value={titulo}
          onChange={(e) =>
            setTitulo(e.target.value)
          }
          placeholder="ex: Vidas Secas"
        />
      </Campo>

      <Campo label="Autor">
        <input
          style={inputStyle}
          value={autor}
          onChange={(e) =>
            setAutor(e.target.value)
          }
          placeholder="ex: Graciliano Ramos"
        />
      </Campo>

      <Campo label="Editora">
        <input
          style={inputStyle}
          value={editora}
          onChange={(e) =>
            setEditora(e.target.value)
          }
          placeholder="ex: Record"
        />
      </Campo>

      <div
        style={{
          display: "flex",
          gap: 12
        }}
      >
        <div style={{ flex: 1 }}>
          <Campo label="Ano">
            <input
              type="number"
              style={inputStyle}
              value={ano}
              onChange={(e) =>
                setAno(e.target.value)
              }
              placeholder="ex: 1938"
            />
          </Campo>
        </div>

        <div style={{ flex: 1 }}>
          <Campo label="Exemplares">
            <input
              type="number"
              min={1}
              style={inputStyle}
              value={quantidade}
              onChange={(e) =>
                setQuantidade(e.target.value)
              }
            />
          </Campo>
        </div>
      </div>

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

      {erro && (
        <p
          style={{
            color: cores.carimbo,
            fontSize: 13
          }}
        >
          {erro}
        </p>
      )}

      <BotaoPrincipal
        onClick={salvar}
        full
      >
        Salvar livro
      </BotaoPrincipal>
    </Modal>
  );
}