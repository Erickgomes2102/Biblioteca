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

  const filtrados = livros.filter((livro) =>
    (
      livro.titulo +
      livro.autor +
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

  const remover = async (id_livros) => {
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
        placeholder="Buscar por título, autor ou categoria"
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
            titulo={livro.titulo}
            sub={`${livro.autor} · ${
              livro.categoria?.nome ||
              "Sem categoria"
            } · ${livro.quantidade} disponíveis`}
            acao={
              <button
                onClick={() =>
                  remover(livro.id_livros)
                }
                style={botaoIcone}
              >
                <Trash2
                  size={14}
                  color={cores.tintaSuave}
                />
              </button>
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
    </div>
  );
}