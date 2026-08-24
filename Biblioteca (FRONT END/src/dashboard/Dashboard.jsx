import React from "react";
import { BookOpen, Repeat, CheckCircle2, AlertTriangle } from "lucide-react";
import { cores } from "../../styles/tema";
import { hoje, fmtData } from "../../utils/data";
import Cabecalho from "../comum/Cabecalho";
import FichaBox from "../comum/FichaBox";
import LinhaItem from "../comum/LinhaItem";
import Selo from "../comum/Selo";
import CardMetrica from "./CardMetrica";

export default function Dashboard({ livros, leitores, emprestimos }) {
  const emprestimosAtivos = emprestimos.filter((e) => !e.devolvido);
  const atrasados = emprestimosAtivos.filter((e) => e.dataPrevista < hoje());
  const totalExemplares = livros.reduce((s, l) => s + l.total, 0);
  const disponiveis = livros.reduce((s, l) => s + l.disponiveis, 0);

  return (
    <div>
      <Cabecalho titulo="Painel" subtitulo="Visão geral da biblioteca" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 26 }}>
        <CardMetrica label="Exemplares no acervo" valor={totalExemplares} icone={BookOpen} />
        <CardMetrica label="Disponíveis agora" valor={disponiveis} icone={CheckCircle2} cor={cores.verdeOk} />
        <CardMetrica label="Empréstimos ativos" valor={emprestimosAtivos.length} icone={Repeat} />
        <CardMetrica label="Devoluções atrasadas" valor={atrasados.length} icone={AlertTriangle} cor={cores.carimbo} />
      </div>

      <FichaBox titulo="Empréstimos em atraso">
        {atrasados.length === 0 ? (
          <p style={{ color: cores.tintaSuave, fontSize: 13.5 }}>Nenhum atraso no momento.</p>
        ) : (
          atrasados.map((e) => {
            const livro = livros.find((l) => l.id === e.livroId);
            const leitor = leitores.find((p) => p.id === e.leitorId);
            return (
              <LinhaItem key={e.id}
                titulo={livro?.titulo}
                sub={`${leitor?.nome} · previsto para ${fmtData(e.dataPrevista)}`}
                selo={<Selo tipo="atraso">atrasado</Selo>}
              />
            );
          })
        )}
      </FichaBox>
    </div>
  );
}