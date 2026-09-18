import React, { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

import api from "../services/api";
import { cores, botaoIcone } from "../empréstimos/styles/tema"

import Cabecalho from "../components/comum/Cabecalho";
import BarraBusca from "../components/comum/BarraBusca";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";
import LinhaItem from "../components/comum/LinhaItem";

import ModalLivro from "./ModalLivro";

export default function Livros({
  livros,
  setLivros,
  categorias
}) {
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(null);
  const [editando, setEditando] = useState(null);

  const filtrados = livros.filter((livro) =>
    (
      livro.titulo +
      livro.autor +
      livro.isbn +
      (livro.categoria?.nome || "")
    )
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const adicionar = async (dados) => {
    try {
      const resposta = await api.post(
        "/CadastrarLivro",
        dados
      );

      setLivros([
        ...livros,
        resposta.data
      ]);

      setNovo(null);

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );
    }
  };

 const editar = async (dados) => {
  try {
    const resposta = await api.put(
      `/EditarLivro/${editando.id_livros}`,
      dados
    );

    const livroAtualizado = resposta.data;

    setLivros(
      livros.map((livro) =>
        livro.id_livros === editando.id_livros
          ? livroAtualizado
          : livro
      )
    );

    setEditando(null);

  } catch (error) {
    console.log(
      error.response?.data || error.message
    );
  }
};

  const remover = async (id_livros) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este livro?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(
        `/ExcluirLivro/${id_livros}`
      );

      setLivros(
        livros.filter(
          (livro) =>
            livro.id_livros !== id_livros
        )
      );

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );
    }
  };

  return (
    <div>
      <Cabecalho
        titulo="Livros"
        subtitulo={`${livros.length} livros cadastrados`}
        acao={
          <BotaoPrincipal
            onClick={() => setNovo({})}
          >
            <Plus size={15} />
            Novo livro
          </BotaoPrincipal>
        }
      />

      <BarraBusca
        valor={busca}
        onChange={setBusca}
        placeholder="Buscar por título, autor, ISBN ou categoria"
      />

      <div
        style={{
          marginTop: 16,
          background: cores.papel,
          border: `1px solid ${cores.linha}`,
          borderRadius: 6,
          padding: "4px 20px"
        }}
      >
        {filtrados.map((livro) => (
          <LinhaItem
            key={livro.id_livros}
            titulo={
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 18,
                  width: "100%"
                }}
              >
                <div
                  style={{
                    width: 67,
                    height: 90,
                    flexShrink: 0,
                    borderRadius: 5,
                    overflow: "hidden",
                    background: cores.lataoClaro,
                    border: `1px solid ${cores.linha}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {livro.capa ? (
                    <img
                      src={livro.capa}
                      alt={`Capa de ${livro.titulo}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        color: cores.tintaSuave,
                        textAlign: "center",
                        padding: 5
                      }}
                    >
                      Sem capa
                    </span>
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 19,
                      fontWeight: 700,
                      color: cores.tinta,
                      marginBottom: 4
                    }}
                  >
                    {livro.titulo}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      color: cores.tintaSuave,
                      marginBottom: 4
                    }}
                  >
                    {livro.autor}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: cores.tintaSuave,
                      marginBottom: 4
                    }}
                  >
                    {livro.categoria?.nome || "Sem categoria"}
                    {" · "}
                    {livro.editora}
                    {" · "}
                    {livro.ano}
                  </div>

                  <div
                    style={{
                      fontSize: 12.5,
                      color: cores.tintaSuave
                    }}
                  >
                    ISBN: {livro.isbn}
                  </div>
                </div>
              </div>
            }
            sub=""
            acao={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <div
                  style={{
                    minWidth: 70,
                    textAlign: "center",
                    marginRight: 12
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 25,
                      lineHeight: 1,
                      color: cores.verdeOk,
                      fontWeight: 700
                    }}
                  >
                    {livro.quantidade}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: cores.tintaSuave
                    }}
                  >
                    disponíveis
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditando(livro)}
                  style={botaoIcone}
                  title="Editar livro"
                >
                  <Pencil
                    size={16}
                    color={cores.tintaSuave}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    remover(livro.id_livros)
                  }
                  style={botaoIcone}
                  title="Excluir livro"
                >
                  <Trash2
                    size={16}
                    color={cores.carimbo}
                  />
                </button>
              </div>
            }
          />
        ))}

        {filtrados.length === 0 && (
          <p
            style={{
              color: cores.tintaSuave,
              fontSize: 13.5,
              padding: "10px 0"
            }}
          >
            Nenhum livro encontrado.
          </p>
        )}
      </div>

      {novo !== null && (
        <ModalLivro
          onFechar={() => setNovo(null)}
          onSalvar={adicionar}
          categorias={categorias}
        />
      )}

      {editando !== null && (
        <ModalLivro
          livro={editando}
          onFechar={() => setEditando(null)}
          onSalvar={editar}
          categorias={categorias}
        />
      )}
    </div>
  );
}