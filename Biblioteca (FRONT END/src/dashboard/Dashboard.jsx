
import React from "react";
import {
  BookOpen,
  Users,
  Repeat,
  AlertTriangle,
  LibraryBig,
  CheckCircle2,
  Clock3,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import { cores } from "../empréstimos/styles/tema.js";
import { fmtData } from "../empréstimos/utils/data.js";

import Cabecalho from "../components/comum/Cabecalho";
import FichaBox from "../components/comum/FichaBox";
import LinhaItem from "../components/comum/LinhaItem";
import Selo from "../components/comum/Selo";

export default function Dashboard({
  livros = [],
  leitores = [],
  emprestimos = [],
}) {
  const hoje = new Date();

  const emprestimosAtivos = emprestimos.filter(
    (emprestimo) => emprestimo.status === "ATIVO"
  );

  const atrasados = emprestimosAtivos.filter((emprestimo) => {
    if (!emprestimo.data_prevista) return false;

    return new Date(emprestimo.data_prevista) < hoje;
  });

  const totalExemplares = livros.reduce(
    (total, livro) => total + Number(livro.quantidade || 0),
    0
  );

  const livrosDisponiveis = livros.filter(
    (livro) => Number(livro.quantidade || 0) > 0
  ).length;

  const emprestimosDevolvidos = emprestimos.filter(
    (emprestimo) => emprestimo.status === "DEVOLVIDO"
  ).length;

  const ultimosEmprestimos = [...emprestimos]
    .sort((a, b) => {
      return (
        new Date(b.data_emprestimo || 0).getTime() -
        new Date(a.data_emprestimo || 0).getTime()
      );
    })
    .slice(0, 5);

  const obterLivro = (emprestimo) =>
    livros.find(
      (livro) => livro.id_livros === emprestimo.id_livros
    );

  const obterLeitor = (emprestimo) =>
    leitores.find(
      (leitor) => leitor.id_leitores === emprestimo.id_leitores
    );

  const percentualDisponivel =
    totalExemplares > 0
      ? Math.min(
          100,
          Math.round((totalExemplares / Math.max(totalExemplares, 1)) * 100)
        )
      : 0;

  const metricas = [
    {
      titulo: "Livros registrados",
      valor: livros.length,
      descricao: "Títulos cadastrados no acervo",
      icone: BookOpen,
      cor: cores.latao,
      fundo: "#F5EBDD",
    },
    {
      titulo: "Leitores cadastrados",
      valor: leitores.length,
      descricao: "Pessoas registradas na biblioteca",
      icone: Users,
      cor: cores.verdeOk,
      fundo: "#E7EFE7",
    },
    {
      titulo: "Empréstimos ativos",
      valor: emprestimosAtivos.length,
      descricao: "Livros atualmente emprestados",
      icone: Repeat,
      cor: "#547C91",
      fundo: "#E8EFF2",
    },
    {
      titulo: "Devoluções atrasadas",
      valor: atrasados.length,
      descricao:
        atrasados.length > 0
          ? "Precisam de atenção"
          : "Nenhum atraso no momento",
      icone: AlertTriangle,
      cor: cores.carimbo,
      fundo: "#F8E9E5",
    },
  ];

  const estiloPainel = {
    background: cores.papel,
    border: `1px solid ${cores.linha}`,
    borderRadius: 8,
    padding: 20,
    minWidth: 0,
  };

  const estiloTituloSecao = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: cores.tinta,
    margin: 0,
  };

  const estiloTextoSecundario = {
    color: cores.tintaSuave,
    fontSize: 12.5,
    lineHeight: 1.6,
    fontWeight: 400,
  };

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        paddingBottom: 32,
      }}
    >
      <Cabecalho
        titulo="Painel"
        subtitulo="Visão geral da biblioteca"
      />

      {/* INDICADORES PRINCIPAIS */}
      <section
        aria-label="Indicadores da biblioteca"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14,
          marginTop: 22,
          marginBottom: 22,
        }}
      >
        {metricas.map((metrica) => {
          const Icone = metrica.icone;

          return (
            <article
              key={metrica.titulo}
              style={{
                background: cores.papel,
                border: `1px solid ${cores.linha}`,
                borderRadius: 8,
                padding: "18px 20px",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    color: cores.tintaSuave,
                    fontWeight: 400,
                  }}
                >
                  {metrica.titulo}
                </span>

                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 7,
                    background: metrica.fundo,
                    color: metrica.cor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icone size={18} strokeWidth={1.7} />
                </span>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 32,
                    fontWeight: 400,
                    lineHeight: 1.1,
                    color: cores.tinta,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {metrica.valor}
                </div>

                <p
                  style={{
                    ...estiloTextoSecundario,
                    margin: "8px 0 0",
                  }}
                >
                  {metrica.descricao}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      {/* ACERVO E SITUAÇÃO DOS EMPRÉSTIMOS */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div style={estiloPainel}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 22,
            }}
          >
            <span
              style={{
                display: "flex",
                color: cores.latao,
              }}
            >
              <LibraryBig size={21} strokeWidth={1.6} />
            </span>

            <div>
              <h2 style={estiloTituloSecao}>Resumo do acervo</h2>
              <p style={{ ...estiloTextoSecundario, margin: "3px 0 0" }}>
                Visão geral dos exemplares
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: 16,
                background: cores.fundo,
                borderRadius: 7,
              }}
            >
              <p style={{ ...estiloTextoSecundario, margin: 0 }}>
                Total de exemplares
              </p>

              <div
                style={{
                  fontSize: 26,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  color: cores.tinta,
                  marginTop: 8,
                }}
              >
                {totalExemplares}
              </div>
            </div>

            <div
              style={{
                padding: 16,
                background: cores.fundo,
                borderRadius: 7,
              }}
            >
              <p style={{ ...estiloTextoSecundario, margin: 0 }}>
                Títulos disponíveis
              </p>

              <div
                style={{
                  fontSize: 26,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  color: cores.tinta,
                  marginTop: 8,
                }}
              >
                {livrosDisponiveis}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 15,
              borderTop: `1px solid ${cores.linha}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={estiloTextoSecundario}>
              Títulos cadastrados
            </span>

            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: cores.tinta,
              }}
            >
              {livros.length}
            </span>
          </div>
        </div>

        <div style={estiloPainel}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 22,
            }}
          >
            <span style={{ display: "flex", color: cores.verdeOk }}>
              <Repeat size={21} strokeWidth={1.6} />
            </span>

            <div>
              <h2 style={estiloTituloSecao}>Situação dos empréstimos</h2>
              <p style={{ ...estiloTextoSecundario, margin: "3px 0 0" }}>
                Acompanhamento das movimentações
              </p>
            </div>
          </div>

          {[
            {
              titulo: "Em andamento",
              valor: emprestimosAtivos.length,
              icone: Clock3,
              cor: "#547C91",
              fundo: "#E8EFF2",
            },
            {
              titulo: "Com atraso",
              valor: atrasados.length,
              icone: AlertTriangle,
              cor: cores.carimbo,
              fundo: "#F8E9E5",
            },
            {
              titulo: "Devolvidos",
              valor: emprestimosDevolvidos,
              icone: CheckCircle2,
              cor: cores.verdeOk,
              fundo: "#E7EFE7",
            },
          ].map((item, indice, lista) => {
            const Icone = item.icone;

            return (
              <div
                key={item.titulo}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom:
                    indice < lista.length - 1
                      ? `1px solid ${cores.linha}`
                      : "none",
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 7,
                    background: item.fundo,
                    color: item.cor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icone size={17} strokeWidth={1.7} />
                </span>

                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: cores.tinta,
                    fontWeight: 400,
                  }}
                >
                  {item.titulo}
                </span>

                <span
                  style={{
                    fontSize: 18,
                    fontFamily: "'Inter', sans-serif",
                    color: item.valor > 0 && item.titulo === "Com atraso"
                      ? cores.carimbo
                      : cores.tinta,
                    fontWeight: 400,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.valor}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* EMPRÉSTIMOS EM ATRASO */}
      <section style={{ marginBottom: 22 }}>
        <div style={estiloPainel}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={estiloTituloSecao}>Empréstimos em atraso</h2>
              <p style={{ ...estiloTextoSecundario, margin: "5px 0 0" }}>
                Empréstimos cuja data prevista de devolução já passou
              </p>
            </div>

            <span
              style={{
                borderRadius: 20,
                padding: "5px 10px",
                background: atrasados.length
                  ? "#F8E9E5"
                  : "#E7EFE7",
                color: atrasados.length
                  ? cores.carimbo
                  : cores.verdeOk,
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {atrasados.length} {atrasados.length === 1 ? "atraso" : "atrasos"}
            </span>
          </div>

          {atrasados.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 0 6px",
                color: cores.verdeOk,
              }}
            >
              <CheckCircle2 size={22} strokeWidth={1.6} />

              <div>
                <p
                  style={{
                    margin: 0,
                    color: cores.tinta,
                    fontSize: 13.5,
                    fontWeight: 400,
                  }}
                >
                  Tudo em dia
                </p>

                <p
                  style={{
                    ...estiloTextoSecundario,
                    margin: "4px 0 0",
                  }}
                >
                  Não há empréstimos atrasados neste momento.
                </p>
              </div>
            </div>
          ) : (
            atrasados.map((emprestimo) => {
              const livro = obterLivro(emprestimo);
              const leitor = obterLeitor(emprestimo);

              return (
                <LinhaItem
                  key={emprestimo.id_emprestimo}
                  titulo={livro?.titulo || "Livro não encontrado"}
                  sub={`${leitor?.nome || "Leitor não encontrado"} · previsto para ${fmtData(emprestimo.data_prevista)}`}
                  selo={
                    <Selo tipo="atraso">
                      atrasado
                    </Selo>
                  }
                />
              );
            })
          )}
        </div>
      </section>

      {/* MOVIMENTAÇÕES RECENTES */}
      <section>
        <div style={estiloPainel}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <span style={{ display: "flex", color: cores.latao }}>
              <CalendarDays size={21} strokeWidth={1.6} />
            </span>

            <div>
              <h2 style={estiloTituloSecao}>Movimentações recentes</h2>
              <p style={{ ...estiloTextoSecundario, margin: "4px 0 0" }}>
                Últimos empréstimos registrados
              </p>
            </div>
          </div>

          {ultimosEmprestimos.length === 0 ? (
            <p
              style={{
                ...estiloTextoSecundario,
                margin: "18px 0 4px",
              }}
            >
              Nenhum empréstimo registrado até agora.
            </p>
          ) : (
            ultimosEmprestimos.map((emprestimo, indice) => {
              const livro = obterLivro(emprestimo);
              const leitor = obterLeitor(emprestimo);

              const estaAtrasado = atrasados.some(
                (item) =>
                  item.id_emprestimo === emprestimo.id_emprestimo
              );

              const devolvido = emprestimo.status === "DEVOLVIDO";

              return (
                <div
                  key={emprestimo.id_emprestimo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    padding: "14px 0",
                    borderBottom:
                      indice < ultimosEmprestimos.length - 1
                        ? `1px solid ${cores.linha}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 7,
                      background: cores.fundo,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: cores.latao,
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={19} strokeWidth={1.6} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        color: cores.tinta,
                        fontSize: 13.5,
                        fontWeight: 500,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {livro?.titulo || "Livro não encontrado"}
                    </p>

                    <p
                      style={{
                        ...estiloTextoSecundario,
                        margin: "4px 0 0",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {leitor?.nome || "Leitor não encontrado"}
                      {emprestimo.data_emprestimo
                        ? ` · ${fmtData(emprestimo.data_emprestimo)}`
                        : ""}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "5px 8px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                      background: devolvido
                        ? "#E7EFE7"
                        : estaAtrasado
                          ? "#F8E9E5"
                          : "#E8EFF2",
                      color: devolvido
                        ? cores.verdeOk
                        : estaAtrasado
                          ? cores.carimbo
                          : "#547C91",
                    }}
                  >
                    {devolvido
                      ? "Devolvido"
                      : estaAtrasado
                        ? "Atrasado"
                        : "Em andamento"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
