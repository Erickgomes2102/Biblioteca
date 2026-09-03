import React, { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { cores, botaoIcone } from "../../styles/tema";
import { hoje, fmtData } from "../../utils/data";
import Cabecalho from "../comum/Cabecalho";
import BotaoPrincipal from "../comum/BotaoPrincipal";
import LinhaItem from "../comum/LinhaItem";
import Selo from "../comum/Selo";
import ModalEmprestimo from "./ModalEmprestimo";

export default function Emprestimos({ livros, setLivros, leitores, emprestimos, setEmprestimos }) {
  const [novo, setNovo] = useState(null);
  const [filtro, setFiltro] = useState("ativos");

  const listaOrdenada = [...emprestimos].sort((a, b) => (a.devolvido === b.devolvido ? 0 : a.devolvido ? 1 : -1));
  const lista = listaOrdenada.filter((e) => filtro === "todos" || (filtro === "ativos" ? !e.devolvido : e.devolvido));

  const registrarEmprestimo = ({ livroId, leitorId, dias }) => {
    const livro = livros.find((l) => l.id === Number(livroId));
    if (!livro || livro.disponiveis <= 0) return;
    setLivros(livros.map((l) => l.id === livro.id ? { ...l, disponiveis: l.disponiveis - 1 } : l));
    const previsao = new Date();
    previsao.setDate(previsao.getDate() + Number(dias));
    setEmprestimos([...emprestimos, {
      id: Date.now(), livroId: Number(livroId), leitorId: Number(leitorId),
      dataEmprestimo: hoje(), dataPrevista: previsao.toISOString().slice(0, 10), devolvido: false,
    }]);
    setNovo(null);
  };

  const registrarDevolucao = (id) => {
    const emp = emprestimos.find((e) => e.id === id);
    setLivros(livros.map((l) => l.id === emp.livroId ? { ...l, disponiveis: l.disponiveis + 1 } : l));
    setEmprestimos(emprestimos.map((e) => e.id === id ? { ...e, devolvido: true, dataDevolucao: hoje() } : e));
  };

  return (
    <div>
      <Cabecalho titulo="Empréstimos" subtitulo="Registre saídas e devoluções de livros"
        acao={<BotaoPrincipal onClick={() => setNovo({})}><Plus size={15} /> Novo empréstimo</BotaoPrincipal>} />

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["ativos", "Ativos"], ["devolvidos", "Devolvidos"], ["todos", "Todos"]].map(([v, l]) => (
          <button key={v} onClick={() => setFiltro(v)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12.5, cursor: "pointer",
            border: `1px solid ${filtro === v ? cores.tinta : cores.linha}`,
            background: filtro === v ? cores.tinta : "transparent",
            color: filtro === v ? "#fff" : cores.tintaSuave, fontWeight: 600,
          }}>{l}</button>
        ))}
      </div>

      <div style={{ background: cores.papel, border: `1px solid ${cores.linha}`, borderRadius: 6, padding: "4px 20px" }}>
        {lista.map((e) => {
          const livro = livros.find((l) => l.id === e.livroId);
          const leitor = leitores.find((p) => p.id === e.leitorId);
          const atrasado = !e.devolvido && e.dataPrevista < hoje();
          return (
            <LinhaItem key={e.id}
              titulo={livro?.titulo}
              sub={`${leitor?.nome} · emprestado em ${fmtData(e.dataEmprestimo)} · previsto ${fmtData(e.dataPrevista)}`}
              selo={
                e.devolvido
                  ? <Selo tipo="ok">devolvido {fmtData(e.dataDevolucao)}</Selo>
                  : atrasado ? <Selo tipo="atraso"><Clock size={11} style={{ verticalAlign: -1, marginRight: 3 }} />atrasado</Selo>
                  : <Selo tipo="neutro">em andamento</Selo>
              }
              acao={!e.devolvido && (
                <button onClick={() => registrarDevolucao(e.id)} style={{
                  ...botaoIcone, border: `1px solid ${cores.verdeOk}`, color: cores.verdeOk, fontSize: 11.5,
                  padding: "5px 10px", fontWeight: 700, borderRadius: 20,
                }}>
                  Devolver
                </button>
              )}
            />
          );
        })}
        {lista.length === 0 && <p style={{ color: cores.tintaSuave, fontSize: 13.5, padding: "10px 0" }}>Nenhum registro nesta lista.</p>}
      </div>

      {novo !== null && (
        <ModalEmprestimo onFechar={() => setNovo(null)} onSalvar={registrarEmprestimo}
          livros={livros.filter((l) => l.disponiveis > 0)} leitores={leitores} />
      )}
    </div>
  );
}