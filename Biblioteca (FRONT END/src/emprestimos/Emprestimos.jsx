import React, { useEffect, useState } from "react";
import {
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign
} from "lucide-react";

import api from "../services/api";

import {
  cores,
  botaoIcone,
  inputStyle
} from "../empréstimos/styles/tema";

import Cabecalho from "../components/comum/Cabecalho";
import BarraBusca from "../components/comum/BarraBusca";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";
import LinhaItem from "../components/comum/LinhaItem";
import Modal from "../components/comum/Modal";
import Campo from "../components/comum/Campo";

export default function Emprestimos({
  livros,
  setLivros,
  leitores,
  emprestimos,
  setEmprestimos,
  usuarios
}) {

  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);

  // =====================================================
  // FILTRO DE MULTAS
  // =====================================================

  const [filtroMulta, setFiltroMulta] = useState("TODAS");

  // =====================================================
  // CONSULTA DE MULTA
  // =====================================================

  const [multaSelecionada, setMultaSelecionada] = useState(null);
  const [carregandoMulta, setCarregandoMulta] = useState(false);

  // =====================================================
  // FORMULÁRIO DE EMPRÉSTIMO
  // =====================================================

  const [id_leitores, setIdLeitores] = useState("");
  const [id_livros, setIdLivros] = useState("");
  const [id_usuarios, setIdUsuarios] = useState("");
  const [data_emprestimo, setDataEmprestimo] = useState("");
  const [data_prevista, setDataPrevista] = useState("");
  const [erro, setErro] = useState("");

  // =====================================================
  // CARREGAR EMPRÉSTIMOS
  // =====================================================

  const carregarEmprestimos = async () => {
    try {
      const resposta = await api.get("/ListarEmprestimo");

      setEmprestimos(resposta.data);
    } catch (error) {
      console.log(
        error.response?.data ||
        error.message
      );
    }
  };

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  // =====================================================
  // FORMATAR DINHEIRO
  // =====================================================

  const formatarDinheiro = (valor) => {
    const numero = Number(valor || 0);

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  // =====================================================
  // FORMATAR DATA
  // =====================================================

  const formatarData = (data) => {
    if (!data) return "-";

    return new Date(data).toLocaleDateString(
      "pt-BR"
    );
  };

  // =====================================================
  // VERIFICAR SE TEM MULTA
  // =====================================================

  const temMulta = (emprestimo) => {
    return Number(emprestimo.multa || 0) > 0;
  };

  // =====================================================
  // FILTRAR EMPRÉSTIMOS
  // =====================================================

  const filtrados = emprestimos.filter(
    (emprestimo) => {

      const livro = livros.find(
        (l) =>
          l.id_livros ===
          emprestimo.id_livros
      );

      const leitor = leitores.find(
        (l) =>
          l.id_leitores ===
          emprestimo.id_leitores
      );

      const textoBusca =
        (
          (livro?.titulo || "") +
          (leitor?.nome || "") +
          (emprestimo.status || "")
        ).toLowerCase();

      const correspondeBusca =
        textoBusca.includes(
          busca.toLowerCase()
        );

      if (!correspondeBusca) {
        return false;
      }

      // =================================================
      // TODAS
      // =================================================

      if (filtroMulta === "TODAS") {
        return true;
      }

      // =================================================
      // COM MULTA
      // =================================================

      if (filtroMulta === "COM_MULTA") {
        return temMulta(emprestimo);
      }

      // =================================================
      // MULTAS PENDENTES
      // =================================================

      if (filtroMulta === "PENDENTES") {
        return (
          temMulta(emprestimo) &&
          emprestimo.status_multa !== "PAGA"
        );
      }

      // =================================================
      // MULTAS PAGAS
      // =================================================

      if (filtroMulta === "PAGAS") {
        return (
          temMulta(emprestimo) &&
          emprestimo.status_multa === "PAGA"
        );
      }

      return true;
    }
  );

  // =====================================================
  // LIMPAR FORMULÁRIO
  // =====================================================

  const limparFormulario = () => {
    setIdLeitores("");
    setIdLivros("");
    setIdUsuarios("");
    setDataEmprestimo("");
    setDataPrevista("");
    setErro("");
  };

  // =====================================================
  // CRIAR EMPRÉSTIMO
  // =====================================================

  const criarEmprestimo = async () => {

    if (
      !id_leitores ||
      !id_livros ||
      !id_usuarios ||
      !data_emprestimo
    ) {
      setErro(
        "Preencha todos os campos obrigatórios."
      );

      return;
    }

    try {

      const dados = {

        id_leitores:
          Number(id_leitores),

        id_livros:
          Number(id_livros),

        id_usuarios:
          Number(id_usuarios),

        data_emprestimo:
          new Date(
            `${data_emprestimo}T00:00:00.000Z`
          ).toISOString(),

        data_prevista:
          data_prevista
            ? new Date(
                `${data_prevista}T00:00:00.000Z`
              ).toISOString()
            : null,

        data_devolucao:
          new Date(
            `${data_prevista || data_emprestimo}T00:00:00.000Z`
          ).toISOString()
      };

      const resposta =
        await api.post(
          "/CriarEmprestimos",
          dados
        );

      setEmprestimos([
        resposta.data,
        ...emprestimos
      ]);

      setLivros(
        livros.map((livro) =>
          livro.id_livros ===
          Number(id_livros)
            ? {
                ...livro,
                quantidade:
                  Number(livro.quantidade) - 1
              }
            : livro
        )
      );

      limparFormulario();
      setNovo(false);

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

      setErro(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erro ao criar empréstimo."
      );
    }
  };

  // =====================================================
  // DEVOLVER LIVRO
  // =====================================================

  const devolverLivro = async (
    id_emprestimo
  ) => {

    try {

      const resposta =
        await api.patch(
          `/DevolverLivro/${id_emprestimo}`
        );

      const dadosAtualizados =
        resposta.data;

      setEmprestimos(
        emprestimos.map(
          (emprestimo) =>
            emprestimo.id_emprestimo ===
            id_emprestimo
              ? {
                  ...emprestimo,

                  status:
                    dadosAtualizados?.Dados
                      ?.status ||
                    "DEVOLVIDO",

                  data_devolucao:
                    dadosAtualizados?.Dados
                      ?.data_devolucao ||
                    new Date().toISOString(),

                  multa:
                    dadosAtualizados?.multa ??
                    emprestimo.multa,

                  status_multa:
                    dadosAtualizados?.Dados
                      ?.status_multa ??
                    emprestimo.status_multa
                }
              : emprestimo
        )
      );

      const emprestimo =
        emprestimos.find(
          (e) =>
            e.id_emprestimo ===
            id_emprestimo
        );

      if (emprestimo) {

        setLivros(
          livros.map((livro) =>
            livro.id_livros ===
            emprestimo.id_livros
              ? {
                  ...livro,
                  quantidade:
                    Number(livro.quantidade) + 1
                }
              : livro
          )
        );
      }

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );
    }
  };

  // =====================================================
  // CANCELAR EMPRÉSTIMO
  // =====================================================

  const cancelarEmprestimo = async (
    id_emprestimo
  ) => {

    try {

      await api.patch(
        `/CancelarEmprestimo/${id_emprestimo}`
      );

      const emprestimo =
        emprestimos.find(
          (e) =>
            e.id_emprestimo ===
            id_emprestimo
        );

      setEmprestimos(
        emprestimos.map((e) =>
          e.id_emprestimo ===
          id_emprestimo
            ? {
                ...e,

                status:
                  "CANCELADO",

                data_devolucao:
                  new Date().toISOString(),

                multa: 0,

                status_multa:
                  "SEM_MULTA"
              }
            : e
        )
      );

      if (emprestimo) {

        setLivros(
          livros.map((livro) =>
            livro.id_livros ===
            emprestimo.id_livros
              ? {
                  ...livro,
                  quantidade:
                    Number(livro.quantidade) + 1
                }
              : livro
          )
        );
      }

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );
    }
  };

  // =====================================================
  // CONSULTAR MULTA
  // =====================================================

  const consultarMulta = async (
    id_emprestimo
  ) => {

    try {

      setCarregandoMulta(true);

      const resposta =
        await api.get(
          `/ConsultarMulta/${id_emprestimo}`
        );

      setMultaSelecionada(
        resposta.data
      );

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

    } finally {

      setCarregandoMulta(false);
    }
  };

  // =====================================================
  // MARCAR MULTA COMO PAGA
  // =====================================================

  const marcarMultaComoPaga = async (
    id_emprestimo
  ) => {

    try {

      await api.patch(
        `/MarcarMultaPaga/${id_emprestimo}`
      );

      await carregarEmprestimos();

      const resposta =
        await api.get(
          `/ConsultarMulta/${id_emprestimo}`
        );

      setMultaSelecionada(
        resposta.data
      );

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erro ao marcar multa como paga."
      );
    }
  };

  // =====================================================
  // FECHAR CONSULTA DE MULTA
  // =====================================================

  const fecharMulta = () => {
    setMultaSelecionada(null);
  };

  // =====================================================
  // ESTILO DOS FILTROS
  // =====================================================

  const estiloFiltro = (ativo) => ({
    border:
      `1px solid ${
        ativo
          ? cores.carimbo
          : cores.linha
      }`,

    background:
      ativo
        ? cores.carimbo
        : cores.papel,

    color:
      ativo
        ? "#fff"
        : cores.tintaSuave,

    borderRadius: 5,

    padding:
      "7px 12px",

    cursor: "pointer",

    fontSize: 12,

    fontWeight:
      ativo
        ? 600
        : 400
  });

  return (

    <div>

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <Cabecalho
        titulo="Empréstimos"
        subtitulo={`${emprestimos.length} empréstimos cadastrados`}
        acao={

          <BotaoPrincipal
            onClick={() => {

              limparFormulario();

              setNovo(true);

            }}
          >

            <Plus size={15} />

            Novo empréstimo

          </BotaoPrincipal>

        }
      />

      {/* =====================================================
          BUSCA
      ===================================================== */}

      <BarraBusca
        valor={busca}
        onChange={setBusca}
        placeholder="Buscar por livro, leitor ou status"
      />

      {/* =====================================================
          FILTROS DE MULTA
      ===================================================== */}

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 12,
          marginBottom: 8
        }}
      >

        <button
          onClick={() =>
            setFiltroMulta("TODAS")
          }
          style={estiloFiltro(
            filtroMulta === "TODAS"
          )}
        >
          Todas
        </button>

        <button
          onClick={() =>
            setFiltroMulta("COM_MULTA")
          }
          style={estiloFiltro(
            filtroMulta === "COM_MULTA"
          )}
        >

          <AlertTriangle
            size={12}
            style={{
              verticalAlign: "middle",
              marginRight: 4
            }}
          />

          Com multa

        </button>

        <button
          onClick={() =>
            setFiltroMulta("PENDENTES")
          }
          style={estiloFiltro(
            filtroMulta === "PENDENTES"
          )}
        >
          Multas pendentes
        </button>

        <button
          onClick={() =>
            setFiltroMulta("PAGAS")
          }
          style={estiloFiltro(
            filtroMulta === "PAGAS"
          )}
        >
          Multas pagas
        </button>

      </div>

      {/* =====================================================
          LISTA
      ===================================================== */}

      <div
        style={{
          marginTop: 16,
          background: cores.papel,
          border:
            `1px solid ${cores.linha}`,
          borderRadius: 6,
          padding: "4px 20px"
        }}
      >

        {filtrados.map(
          (emprestimo) => {

            const livro =
              livros.find(
                (l) =>
                  l.id_livros ===
                  emprestimo.id_livros
              );

            const leitor =
              leitores.find(
                (l) =>
                  l.id_leitores ===
                  emprestimo.id_leitores
              );

            const valorMulta =
              Number(
                emprestimo.multa || 0
              );

            const possuiMulta =
              valorMulta > 0;

            const multaPaga =
              emprestimo.status_multa ===
              "PAGA";

            return (

              <LinhaItem

                key={
                  emprestimo.id_emprestimo
                }

                titulo={
                  livro?.titulo ||
                  "Livro não encontrado"
                }

                sub={

                  `${leitor?.nome || "Leitor não encontrado"} · ` +

                  `${formatarData(
                    emprestimo.data_emprestimo
                  )} · previsto: ` +

                  `${formatarData(
                    emprestimo.data_prevista
                  )}`

                }

                selo={

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap"
                    }}
                  >

                    {emprestimo.status ===
                    "ATIVO" ? (

                      <span
                        style={{
                          color:
                            cores.verdeOk,
                          fontSize: 12
                        }}
                      >
                        ATIVO
                      </span>

                    ) : (

                      <span
                        style={{
                          color:
                            cores.tintaSuave,
                          fontSize: 12
                        }}
                      >
                        {emprestimo.status}
                      </span>

                    )}

                    {/* =================================================
                        AVISO DE MULTA
                    ================================================= */}

                    {possuiMulta && (

                      <button
                        onClick={() =>
                          consultarMulta(
                            emprestimo.id_emprestimo
                          )
                        }

                        title="Consultar multa"

                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,

                          border:
                            `1px solid ${
                              multaPaga
                                ? cores.verdeOk
                                : cores.carimbo
                            }`,

                          background:
                            "transparent",

                          color:
                            multaPaga
                              ? cores.verdeOk
                              : cores.carimbo,

                          borderRadius: 5,

                          padding:
                            "4px 8px",

                          cursor:
                            "pointer",

                          fontSize: 11,

                          fontWeight: 600
                        }}
                      >

                        {multaPaga ? (

                          <CheckCircle2
                            size={13}
                          />

                        ) : (

                          <AlertTriangle
                            size={13}
                          />

                        )}

                        {formatarDinheiro(
                          valorMulta
                        )}

                        {multaPaga
                          ? " · PAGA"
                          : " · MULTA"}

                      </button>

                    )}

                  </div>

                }

                acao={

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexWrap: "wrap",
                      justifyContent: "flex-end"
                    }}
                  >

                    {/* =================================================
                        BOTÃO DA MULTA
                    ================================================= */}

                    {possuiMulta && (

                      <button
                        onClick={() =>
                          consultarMulta(
                            emprestimo.id_emprestimo
                          )
                        }

                        style={{
                          ...botaoIcone,

                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}

                        title="Ver multa"
                      >

                        <DollarSign
                          size={15}
                          color={
                            multaPaga
                              ? cores.verdeOk
                              : cores.carimbo
                          }
                        />

                      </button>

                    )}

                    {/* =================================================
                        AÇÕES DO EMPRÉSTIMO
                    ================================================= */}

                    {emprestimo.status ===
                    "ATIVO" && (

                      <>

                        <button
                          onClick={() =>
                            devolverLivro(
                              emprestimo.id_emprestimo
                            )
                          }

                          style={
                            botaoIcone
                          }

                          title="Devolver livro"
                        >

                          <CheckCircle2
                            size={15}
                            color={
                              cores.verdeOk
                            }
                          />

                        </button>

                        <button
                          onClick={() =>
                            cancelarEmprestimo(
                              emprestimo.id_emprestimo
                            )
                          }

                          style={
                            botaoIcone
                          }

                          title="Cancelar empréstimo"
                        >

                          <XCircle
                            size={15}
                            color={
                              cores.carimbo
                            }
                          />

                        </button>

                      </>

                    )}

                  </div>

                }

              />

            );

          }
        )}

        {/* =====================================================
            NENHUM RESULTADO
        ===================================================== */}

        {filtrados.length === 0 && (

          <p
            style={{
              color:
                cores.tintaSuave,
              fontSize: 13.5,
              padding: "10px 0"
            }}
          >

            Nenhum empréstimo encontrado.

          </p>

        )}

      </div>

      {/* =====================================================
          MODAL DE CONSULTA DA MULTA
      ===================================================== */}

      {multaSelecionada && (

        <Modal
          onFechar={
            fecharMulta
          }

          titulo="Detalhes da multa"
        >

          {carregandoMulta ? (

            <p
              style={{
                color:
                  cores.tintaSuave,
                fontSize: 13
              }}
            >
              Carregando...
            </p>

          ) : (

            <div>

              {/* LIVRO */}

              <div
                style={{
                  marginBottom: 12
                }}
              >

                <strong>
                  Livro
                </strong>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    color:
                      cores.tintaSuave
                  }}
                >
                  {multaSelecionada.livro ||
                    "Livro não encontrado"}
                </p>

              </div>

              {/* LEITOR */}

              <div
                style={{
                  marginBottom: 12
                }}
              >

                <strong>
                  Leitor
                </strong>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    color:
                      cores.tintaSuave
                  }}
                >
                  {multaSelecionada.leitor ||
                    "Leitor não encontrado"}
                </p>

              </div>

              {/* DATA PREVISTA */}

              <div
                style={{
                  marginBottom: 12
                }}
              >

                <strong>
                  Data prevista
                </strong>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    color:
                      cores.tintaSuave
                  }}
                >
                  {formatarData(
                    multaSelecionada.data_prevista
                  )}
                </p>

              </div>

              {/* DIAS ATRASADOS */}

              <div
                style={{
                  marginBottom: 12
                }}
              >

                <strong>
                  Dias atrasados
                </strong>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    color:
                      cores.tintaSuave
                  }}
                >
                  {multaSelecionada.dias_atrasados ||
                    0}{" "}
                  dia(s)
                </p>

              </div>

              {/* VALOR POR DIA */}

              <div
                style={{
                  marginBottom: 12
                }}
              >

                <strong>
                  Valor por dia
                </strong>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    color:
                      cores.tintaSuave
                  }}
                >
                  {formatarDinheiro(
                    multaSelecionada.valor_por_dia
                  )}
                </p>

              </div>

              {/* TOTAL */}

              <div
                style={{
                  padding: 12,
                  marginBottom: 12,

                  border:
                    `1px solid ${cores.linha}`,

                  borderRadius: 6,

                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between"
                }}
              >

                <strong>
                  Multa
                </strong>

                <strong
                  style={{
                    color:
                      multaSelecionada.status_multa ===
                      "PAGA"
                        ? cores.verdeOk
                        : cores.carimbo,

                    fontSize: 18
                  }}
                >
                  {formatarDinheiro(
                    multaSelecionada.multa
                  )}
                </strong>

              </div>

              {/* STATUS */}

              <div
                style={{
                  marginBottom: 16
                }}
              >

                <strong>
                  Status
                </strong>

                <p
                  style={{
                    margin:
                      "4px 0 0",

                    color:
                      multaSelecionada.status_multa ===
                      "PAGA"
                        ? cores.verdeOk
                        : cores.carimbo,

                    fontWeight: 600
                  }}
                >

                  {multaSelecionada.status_multa ===
                  "PAGA"
                    ? "PAGA"
                    : "PENDENTE"}

                </p>

              </div>

              {/* DATA DO PAGAMENTO */}

              {multaSelecionada.data_pagamento && (

                <div
                  style={{
                    marginBottom: 16
                  }}
                >

                  <strong>
                    Data do pagamento
                  </strong>

                  <p
                    style={{
                      margin:
                        "4px 0 0",
                      color:
                        cores.tintaSuave
                    }}
                  >
                    {formatarData(
                      multaSelecionada.data_pagamento
                    )}
                  </p>

                </div>

              )}

              {/* BOTÃO PAGAR */}

              {Number(multaSelecionada.multa || 0) > 0 &&
              multaSelecionada.status_multa !==
                "PAGA" && (

                <BotaoPrincipal
                  onClick={() =>
                    marcarMultaComoPaga(
                      multaSelecionada.id_emprestimo
                    )
                  }

                  full
                >

                  <CheckCircle2
                    size={15}
                  />

                  Marcar multa como paga

                </BotaoPrincipal>

              )}

              {/* MULTA JÁ PAGA */}

              {multaSelecionada.status_multa ===
                "PAGA" && (

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    gap: 6,

                    padding: 10,

                    color:
                      cores.verdeOk,

                    fontSize: 13,
                    fontWeight: 600
                  }}
                >

                  <CheckCircle2
                    size={16}
                  />

                  Multa já foi paga.

                </div>

              )}

            </div>

          )}

        </Modal>

      )}

      {/* =====================================================
          MODAL NOVO EMPRÉSTIMO
      ===================================================== */}

      {novo && (

        <Modal

          onFechar={() => {

            limparFormulario();

            setNovo(false);

          }}

          titulo="Cadastrar empréstimo"
        >

          {/* LEITOR */}

          <Campo label="Leitor">

            <select
              style={inputStyle}

              value={id_leitores}

              onChange={(e) =>
                setIdLeitores(
                  e.target.value
                )
              }
            >

              <option value="">
                Selecione um leitor
              </option>

              {leitores.map(
                (leitor) => (

                  <option
                    key={
                      leitor.id_leitores
                    }

                    value={
                      leitor.id_leitores
                    }
                  >
                    {leitor.nome}
                  </option>

                )
              )}

            </select>

          </Campo>

          {/* LIVRO */}

          <Campo label="Livro">

            <select
              style={inputStyle}

              value={id_livros}

              onChange={(e) =>
                setIdLivros(
                  e.target.value
                )
              }
            >

              <option value="">
                Selecione um livro
              </option>

              {livros
                .filter(
                  (livro) =>
                    Number(
                      livro.quantidade
                    ) > 0
                )
                .map(
                  (livro) => (

                    <option
                      key={
                        livro.id_livros
                      }

                      value={
                        livro.id_livros
                      }
                    >

                      {livro.titulo} (
                      {livro.quantidade}
                      {" "}
                      disponíveis)

                    </option>

                  )
                )}

            </select>

          </Campo>

          {/* USUÁRIO */}

          <Campo
            label="Usuário responsável"
          >

            <select
              style={inputStyle}

              value={id_usuarios}

              onChange={(e) =>
                setIdUsuarios(
                  e.target.value
                )
              }
            >

              <option value="">
                Selecione o usuário
              </option>

              {usuarios.map(
                (usuario) => (

                  <option
                    key={
                      usuario.id_usuarios
                    }

                    value={
                      usuario.id_usuarios
                    }
                  >

                    {usuario.nome}

                  </option>

                )
              )}

            </select>

          </Campo>

          {/* DATA DO EMPRÉSTIMO */}

          <Campo
            label="Data do empréstimo"
          >

            <input
              type="date"

              style={inputStyle}

              value={
                data_emprestimo
              }

              onChange={(e) =>
                setDataEmprestimo(
                  e.target.value
                )
              }
            />

          </Campo>

          {/* DATA PREVISTA */}

          <Campo
            label="Data prevista para devolução"
          >

            <input
              type="date"

              style={inputStyle}

              value={
                data_prevista
              }

              onChange={(e) =>
                setDataPrevista(
                  e.target.value
                )
              }
            />

          </Campo>

          {/* ERRO */}

          {erro && (

            <p
              style={{
                color:
                  cores.carimbo,
                fontSize: 13
              }}
            >

              {erro}

            </p>

          )}

          {/* SALVAR */}

          <BotaoPrincipal
            onClick={
              criarEmprestimo
            }

            full
          >

            Salvar empréstimo

          </BotaoPrincipal>

        </Modal>

      )}

    </div>
  );
}