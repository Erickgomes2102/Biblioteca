import React from "react";
import { BookOpen, Repeat, CheckCircle2, AlertTriangle } from "lucide-react";

import { cores } from "../empréstimos/styles/tema.js";
import { fmtData } from "../empréstimos/utils/data.js";

import Cabecalho from "../components/comum/Cabecalho";
import FichaBox from "../components/comum/FichaBox";
import LinhaItem from "../components/comum/LinhaItem";
import Selo from "../components/comum/Selo";
import CardMetrica from "./CardMetrica";

export default function Dashboard({ livros, leitores, emprestimos }) {

  // Empréstimos que ainda estão ativos
  const emprestimosAtivos = emprestimos.filter(
    (e) => e.status === "ATIVO"
  );

  // Empréstimos ativos cuja data prevista já passou
  const hoje = new Date();

  const atrasados = emprestimosAtivos.filter((e) => {
    if (!e.data_prevista) return false;

    return new Date(e.data_prevista) < hoje;
  });

  // Soma a quantidade disponível de todos os livros
  const totalExemplares = livros.reduce(
    (soma, livro) => soma + Number(livro.quantidade || 0),
    0
  );

  // Como o backend decrementa quantidade quando empresta,
  // "quantidade" já representa os exemplares disponíveis.
  const disponiveis = livros.reduce(
    (soma, livro) => soma + Number(livro.quantidade || 0),
    0
  );

  return (
    <div>
      <Cabecalho
        titulo="Painel"
        subtitulo="Visão geral da biblioteca"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 26
        }}
      >
        <CardMetrica
          label="Exemplares disponíveis"
          valor={totalExemplares}
          icone={BookOpen}
        />

        <CardMetrica
          label="Disponíveis agora"
          valor={disponiveis}
          icone={CheckCircle2}
          cor={cores.verdeOk}
        />

        <CardMetrica
          label="Empréstimos ativos"
          valor={emprestimosAtivos.length}
          icone={Repeat}
        />

        <CardMetrica
          label="Devoluções atrasadas"
          valor={atrasados.length}
          icone={AlertTriangle}
          cor={cores.carimbo}
        />
      </div>

      <FichaBox titulo="Empréstimos em atraso">
        {atrasados.length === 0 ? (
          <p
            style={{
              color: cores.tintaSuave,
              fontSize: 13.5
            }}
          >
            Nenhum atraso no momento.
          </p>
        ) : (
          atrasados.map((e) => {

            const livro = livros.find(
              (l) => l.id_livros === e.id_livros
            );

            const leitor = leitores.find(
              (l) => l.id_leitores === e.id_leitores
            );

            return (
              <LinhaItem
                key={e.id_emprestimo}
                titulo={livro?.titulo || "Livro não encontrado"}
                sub={`${leitor?.nome || "Leitor não encontrado"} · previsto para ${fmtData(e.data_prevista)}`}
                selo={
                  <Selo tipo="atraso">
                    atrasado
                  </Selo>
                }
              />
            );
          })
        )}
      </FichaBox>
    </div>
  );
}