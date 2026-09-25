import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { cores, botaoIcone } from "../empréstimos/styles/tema";
import api from "../services/api";

import Cabecalho from "../components/comum/Cabecalho";
import BarraBusca from "../components/comum/BarraBusca";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";
import LinhaItem from "../components/comum/LinhaItem";
import ModalLeitor from "./ModalLeitor";

export default function Leitores({
  leitores = [],
  setLeitores,
  usuarios = []
}) {
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(null);

  const listaLeitores = Array.isArray(leitores)
    ? leitores
    : [];

  const listaUsuarios = Array.isArray(usuarios)
    ? usuarios
    : [];

  const filtrados = listaLeitores.filter((leitor) => {
    const texto = [
      leitor?.nome,
      leitor?.cpf,
      leitor?.email,
      leitor?.telefone
    ]
      .filter((valor) => valor !== null && valor !== undefined)
      .map((valor) => String(valor))
      .join(" ")
      .toLowerCase();

    return texto.includes(busca.toLowerCase());
  });
const adicionar = async (dados) => {
  try {
    await api.post(
      "/CriarLeitores",
      dados
    );

    const resposta = await api.get(
      "/ListarLeitores"
    );

    setLeitores(resposta.data);

    setNovo(null);

  } catch (error) {
    console.log(
      error.response?.data || error.message
    );
  }
};
  const remover = async (id_leitores) => {
    try {
      await api.delete(
        `/RemoverLeitor/${id_leitores}`
      );

      setLeitores(
        listaLeitores.filter(
          (leitor) =>
            leitor.id_leitores !== id_leitores
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
        titulo="Leitores"
        subtitulo={`${listaLeitores.length} pessoas cadastradas`}
        acao={
          <BotaoPrincipal
            onClick={() => setNovo({})}
          >
            <Plus size={15} />
            Novo leitor
          </BotaoPrincipal>
        }
      />

      <BarraBusca
        valor={busca}
        onChange={setBusca}
        placeholder="Buscar por nome, CPF ou e-mail"
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

        {filtrados.map((leitor) => {

          const nome =
            leitor?.nome ||
            "Nome não informado";

          const email =
            leitor?.email ||
            "E-mail não informado";

          const telefone =
            leitor?.telefone ||
            "Telefone não informado";

          return (
            <LinhaItem
              key={leitor.id_leitores}
              titulo={nome}
              sub={`${email} · ${telefone}`}
              acao={
                <button
                  type="button"
                  onClick={() =>
                    remover(leitor.id_leitores)
                  }
                  style={botaoIcone}
                  title="Excluir leitor"
                >
                  <Trash2
                    size={14}
                    color={cores.tintaSuave}
                  />
                </button>
              }
            />
          );
        })}

        {filtrados.length === 0 && (
          <p
            style={{
              color: cores.tintaSuave,
              fontSize: 13.5,
              padding: "10px 0"
            }}
          >
            Nenhum leitor encontrado.
          </p>
        )}

      </div>

      {novo !== null && (
        <ModalLeitor
          onFechar={() => setNovo(null)}
          onSalvar={adicionar}
          usuarios={listaUsuarios}
        />
      )}

    </div>
  );
}