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
  leitores,
  setLeitores,
  usuarios
}) {
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(null);

  const filtrados = leitores.filter((leitor) =>
    (
      leitor.nome +
      leitor.cpf +
      leitor.email +
      leitor.telefone
    )
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const adicionar = async (dados) => {
    try {
      const resposta = await api.post(
        "/CriarLeitores",
        dados
      );

      setLeitores([
        ...leitores,
        resposta.data
      ]);

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
        leitores.filter(
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
        subtitulo={`${leitores.length} pessoas cadastradas`}
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
        {filtrados.map((leitor) => (
          <LinhaItem
            key={leitor.id_leitores}
            titulo={leitor.nome}
            sub={`${leitor.email} · ${leitor.telefone}`}
            acao={
              <button
                onClick={() =>
                  remover(leitor.id_leitores)
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
            Nenhum leitor encontrado.
          </p>
        )}
      </div>

      {novo !== null && (
        <ModalLeitor
          onFechar={() => setNovo(null)}
          onSalvar={adicionar}
          usuarios={usuarios}
        />
      )}
    </div>
  );
}