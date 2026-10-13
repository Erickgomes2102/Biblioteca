
import React, { useEffect, useState } from "react";

import {
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  Trash2
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
  livros = [],
  setLivros,
  leitores = [],
  emprestimos = [],
  setEmprestimos,
  usuarios = [],
  usuarioLogado
}) {
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);
  const [filtroMulta, setFiltroMulta] = useState("TODAS");

  const [multaSelecionada, setMultaSelecionada] = useState(null);
  const [carregandoMulta, setCarregandoMulta] = useState(false);

  const [emprestimoParaDevolver, setEmprestimoParaDevolver] =
    useState(null);

  const [processandoDevolucao, setProcessandoDevolucao] =
    useState(false);

  const [id_leitores, setIdLeitores] = useState("");
  const [id_livros, setIdLivros] = useState("");
  const [id_usuarios, setIdUsuarios] = useState("");
  const [data_emprestimo, setDataEmprestimo] = useState("");
  const [data_prevista, setDataPrevista] = useState("");
  const [erro, setErro] = useState("");

  const ehBibliotecario =
    usuarioLogado?.tipo === "BIBLIOTECÁRIO";

  const ehAdministrador =
    usuarioLogado?.tipo === "ADMINISTRADOR";

  // =====================================================
  // CARREGAR EMPRÉSTIMOS
  // =====================================================

  const carregarEmprestimos = async () => {
    try {
      const resposta = await api.get("/ListarEmprestimo");

      setEmprestimos(resposta.data);

      return resposta.data;
    } catch (error) {
      console.error(
        "Erro ao carregar empréstimos:",
        error.response?.data || error.message
      );

      return null;
    }
  };

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  // =====================================================
  // FORMATAR VALORES
  // =====================================================

  const formatarDinheiro = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  const formatarData = (data) => {
    if (!data) return "-";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
      return "-";
    }

    return dataFormatada.toLocaleDateString("pt-BR", {
      timeZone: "UTC"
    });
  };

  // =====================================================
  // LOCALIZAR LIVRO E LEITOR
  // =====================================================

  const obterLivro = (emprestimo) => {
    return (
      emprestimo.livro ||
      livros.find(
        (livro) =>
          Number(livro.id_livros) ===
          Number(emprestimo.id_livros)
      )
    );
  };

  const obterLeitor = (emprestimo) => {
    return (
      emprestimo.leitor ||
      leitores.find(
        (leitor) =>
          Number(leitor.id_leitores) ===
          Number(emprestimo.id_leitores)
      )
    );
  };

  // =====================================================
  // SUSPENSÃO DO LEITOR
  // =====================================================

  const leitorEstaSuspenso = (leitor) => {
    if (!leitor?.suspenso_ate) {
      return false;
    }

    const dataSuspensao = new Date(leitor.suspenso_ate);

    return (
      !Number.isNaN(dataSuspensao.getTime()) &&
      dataSuspensao.getTime() > Date.now()
    );
  };

  // =====================================================
  // ATRASO E MULTA
  // =====================================================
  const temMulta = (emprestimo) => {
    if (emprestimo.status === "CANCELADO") {
      return false;
    }

    const status = (
      emprestimo.multaRegistro?.status ||
      emprestimo.status_multa ||
      ""
    ).toUpperCase();

    return (
      Boolean(emprestimo.multaRegistro) ||
      status === "PENDENTE" ||
      status === "PAGA"
    );
  };

    const estaAtrasado = (emprestimo) => {
    if (
      !emprestimo.data_prevista ||
      emprestimo.status !== "ATIVO"
    ) {
      return false;
    }

    const dataPrevista = new Date(emprestimo.data_prevista);

    if (Number.isNaN(dataPrevista.getTime())) {
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    dataPrevista.setHours(0, 0, 0, 0);

    return dataPrevista < hoje;
  };

  const statusMulta = (emprestimo) => {
    if (emprestimo.status === "CANCELADO") {
      return "CANCELADA";
    }

    if (!temMulta(emprestimo)) {
      return "SEM_MULTA";
    }

    return (
      emprestimo.multaRegistro?.status ||
      emprestimo.status_multa
    ).toUpperCase();
  };

  const aplicarMulta = async (id_emprestimo) => {
    if (processandoDevolucao) {
      return;
    }

    setProcessandoDevolucao(true);

    try {
      await api.patch(`/DevolverLivro/${id_emprestimo}`, { penalidade: "MULTA", apenas_multa: true });

      await carregarEmprestimos();
      setEmprestimoParaDevolver(null);


    } catch (error) {
      console.error("Erro ao aplicar multa:", error.response?.data || error.message);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.erro ||
        "Erro ao aplicar multa"
      );
    } finally {
      setProcessandoDevolucao(false)
    }
  }

  // =====================================================
  // FILTRAR EMPRÉSTIMOS
  // =====================================================

  const filtrados = emprestimos.filter((emprestimo) => {
    const livro = obterLivro(emprestimo);
    const leitor = obterLeitor(emprestimo);

    const textoBusca = (
      (livro?.titulo || "") +
      (leitor?.nome || "") +
      (emprestimo.status || "")
    ).toLowerCase();

    if (!textoBusca.includes(busca.toLowerCase())) {
      return false;
    }

    if (filtroMulta === "TODAS") {
      return true;
    }

    if (filtroMulta === "COM_MULTA") {
      return temMulta(emprestimo);
    }

    if (filtroMulta === "PENDENTES") {
      return (
        temMulta(emprestimo) &&
        statusMulta(emprestimo) === "PENDENTE"
      );
    }

    if (filtroMulta === "PAGAS") {
      return (
        temMulta(emprestimo) &&
        statusMulta(emprestimo) === "PAGA"
      );
    }

    if (filtroMulta === "ATRASADOS") {
      return estaAtrasado(emprestimo);
    }

    if (filtroMulta === "SUSPENSOS") {
      return leitorEstaSuspenso(leitor);
    }

    return true;
  });

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
    const usuarioResponsavel = ehBibliotecario
      ? usuarioLogado?.id
      : id_usuarios;

    if (
      !id_leitores ||
      !id_livros ||
      !usuarioResponsavel ||
      !data_emprestimo ||
      !data_prevista
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (data_prevista < data_emprestimo) {
      setErro(
        "A data prevista para devolução não pode ser anterior à data do empréstimo."
      );
      return;
    }

    const leitorSelecionado = leitores.find(
      (leitor) =>
        Number(leitor.id_leitores) === Number(id_leitores)
    );

    if (leitorEstaSuspenso(leitorSelecionado)) {
      setErro(
        `Este leitor está suspenso até ${formatarData(
          leitorSelecionado.suspenso_ate
        )}.`
      );

      return;
    }

    try {
      const dados = {
        id_leitores: Number(id_leitores),
        id_livros: Number(id_livros),
        id_usuarios: Number(usuarioResponsavel),

        data_emprestimo: new Date(
          `${data_emprestimo}T00:00:00.000Z`
        ).toISOString(),

        data_prevista: new Date(
          `${data_prevista}T00:00:00.000Z`
        ).toISOString(),

        data_devolucao: new Date(
          `${data_prevista}T00:00:00.000Z`
        ).toISOString()
      };

      await api.post("/CriarEmprestimos", dados);

      await carregarEmprestimos();

      setLivros((listaAtual) =>
        listaAtual.map((livro) =>
          Number(livro.id_livros) === Number(id_livros)
            ? {
              ...livro,
              quantidade: Math.max(
                0,
                Number(livro.quantidade) - 1
              )
            }
            : livro
        )
      );

      limparFormulario();
      setNovo(false);
    } catch (error) {
      console.error(
        "Erro ao criar empréstimo:",
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.erro ||
        "Erro ao criar empréstimo."
      );
    }
  };

  // =====================================================
  // ABRIR ESCOLHA DE PENALIDADE
  // =====================================================

  const iniciarDevolucao = (emprestimo) => {
    if (emprestimo.status !== "ATIVO") {
      return;
    }

    if (estaAtrasado(emprestimo)) {
      // Atrasado: o usuário precisa escolher uma penalidade.
      setEmprestimoParaDevolver(emprestimo);
      return;
    }

    // Sem atraso: devolução normal, sem multa ou suspensão.
    devolverLivro(emprestimo.id_emprestimo);
  };

  // =====================================================
  // DEVOLVER LIVRO COM MULTA OU SUSPENSÃO
  // =====================================================

  const devolverLivro = async (
    id_emprestimo,
    penalidade = null
  ) => {
    if (processandoDevolucao) {
      return;
    }

    setProcessandoDevolucao(true);

    try {
      const corpo = penalidade
        ? { penalidade }
        : {};

      const resposta = await api.patch(
        `/DevolverLivro/${id_emprestimo}`,
        corpo
      );

      const emprestimoOriginal = emprestimos.find(
        (item) =>
          Number(item.id_emprestimo) ===
          Number(id_emprestimo)
      );

      await carregarEmprestimos();

      if (
        emprestimoOriginal &&
        typeof setLivros === "function"
      ) {
        setLivros((listaAtual) =>
          listaAtual.map((livro) =>
            Number(livro.id_livros) ===
              Number(emprestimoOriginal.id_livros)
              ? {
                ...livro,
                quantidade: Number(livro.quantidade) + 1
              }
              : livro
          )
        );
      }

      setEmprestimoParaDevolver(null);

      if (penalidade === "MULTA") {
        alert(
          `Livro devolvido. Multa: ${formatarDinheiro(
            resposta.data?.multa || 0
          )}`
        );
      } else if (penalidade === "SUSPENSAO") {
        alert(
          "Livro devolvido e suspensão aplicada ao leitor."
        );
      }
    } catch (error) {
      console.error(
        "Erro ao devolver livro:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.erro ||
        "Erro ao devolver livro."
      );
    } finally {
      setProcessandoDevolucao(false);
    }
  };

  // =====================================================
  // CANCELAR EMPRÉSTIMO
  // =====================================================

  const cancelarEmprestimo = async (id_emprestimo) => {
    const confirmar = window.confirm(
      "Deseja realmente cancelar este empréstimo?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const emprestimoOriginal = emprestimos.find(
        (item) =>
          Number(item.id_emprestimo) ===
          Number(id_emprestimo)
      );

      await api.patch(
        `/CancelarEmprestimo/${id_emprestimo}`
      );

      await carregarEmprestimos();

      if (
        emprestimoOriginal &&
        typeof setLivros === "function"
      ) {
        setLivros((listaAtual) =>
          listaAtual.map((livro) =>
            Number(livro.id_livros) ===
              Number(emprestimoOriginal.id_livros)
              ? {
                ...livro,
                quantidade: Number(livro.quantidade) + 1
              }
              : livro
          )
        );
      }
    } catch (error) {
      console.error(
        "Erro ao cancelar empréstimo:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.erro ||
        "Erro ao cancelar empréstimo."
      );
    }
  };

  // =====================================================
  // CONSULTAR MULTA
  // =====================================================



  // =====================================================
  // QUITAR MULTA
  // =====================================================

const quitarMulta = async (id_emprestimo) => {
  try {
    const emprestimoOriginal = emprestimos.find(
      (item) =>
        Number(item.id_emprestimo) === Number(id_emprestimo)
    );

    const resposta = await api.patch(
      `/PagarMulta/${id_emprestimo}`
    );

    await carregarEmprestimos();

    // Atualiza o estoque local somente se o backend
    // confirmou que o livro foi devolvido nesta operação.
    if (
      resposta.data?.livro_devolvido === true &&
      emprestimoOriginal &&
      typeof setLivros === "function"
    ) {
      setLivros((listaAtual) =>
        listaAtual.map((livro) =>
          Number(livro.id_livros) ===
          Number(emprestimoOriginal.id_livros)
            ? {
                ...livro,
                quantidade: Number(livro.quantidade) + 1
              }
            : livro
        )
      );
    }

    if (
      Number(multaSelecionada?.id_emprestimo) ===
      Number(id_emprestimo)
    ) {
      const consulta = await api.get(
        `/ConsultarMulta/${id_emprestimo}`
      );

      setMultaSelecionada(consulta.data);
    }
  } catch (error) {
    console.error(
      "Erro ao quitar multa:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.erro ||
      "Erro ao quitar multa."
    );
  }
};

  // =====================================================
  // ESTILO DOS FILTROS
  // =====================================================

  const estiloFiltro = (ativo) => ({
    border: `1px solid ${ativo ? cores.carimbo : cores.linha
      }`,
    background: ativo ? cores.carimbo : cores.papel,
    color: ativo ? "#fff" : cores.tintaSuave,
    borderRadius: 5,
    padding: "7px 12px",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: ativo ? 600 : 400
  });

  const excluirEmprestimo = async (emprestimo) => {
    if (!ehAdministrador) {
      return;

    }

    const confirmar = window.confirm(`Deseja excluir permanentemente o empréstimo de "${obterLivro(emprestimo)?.titulo || "livro não identificado"}"`);

    if (!confirmar) {
      return
    }

    try { 
      await api.delete(`/ExcluirEmprestimo/${emprestimo.id_emprestimo}`)
      await carregarEmprestimos();

      if (Number(multaSelecionada?.id_emprestimo) === Number(emprestimo.id_emprestimo)) { setMultaSelecionada(null)}
    } 
      
     catch (error) {

      console.error(
        "Erro ao excluir empréstimo:", error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.erro || 
        "Erro ao excluir empréstimo"
      )

    }
  }
  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <div>
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

      <BarraBusca
        valor={busca}
        onChange={setBusca}
        placeholder="Buscar por livro, leitor ou status"
      />

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
          type="button"
          onClick={() => setFiltroMulta("TODAS")}
          style={estiloFiltro(filtroMulta === "TODAS")}
        >
          Todas
        </button>

        <button
          type="button"
          onClick={() => setFiltroMulta("ATRASADOS")}
          style={estiloFiltro(filtroMulta === "ATRASADOS")}
        >
          <AlertTriangle
            size={12}
            style={{ verticalAlign: "middle", marginRight: 4 }}
          />
          Atrasados
        </button>

        <button
          type="button"
          onClick={() => setFiltroMulta("COM_MULTA")}
          style={estiloFiltro(filtroMulta === "COM_MULTA")}
        >
          <AlertTriangle
            size={12}
            style={{ verticalAlign: "middle", marginRight: 4 }}
          />
          Com multa
        </button>

        <button
          type="button"
          onClick={() => setFiltroMulta("PENDENTES")}
          style={estiloFiltro(filtroMulta === "PENDENTES")}
        >
          Multas pendentes
        </button>

        <button
          type="button"
          onClick={() => setFiltroMulta("PAGAS")}
          style={estiloFiltro(filtroMulta === "PAGAS")}
        >
          Multas pagas
        </button>

        <button
          type="button"
          onClick={() => setFiltroMulta("SUSPENSOS")}
          style={estiloFiltro(filtroMulta === "SUSPENSOS")}
        >
          Leitores suspensos
        </button>
      </div>

      <div
        style={{
          marginTop: 16,
          background: cores.papel,
          border: `1px solid ${cores.linha}`,
          borderRadius: 6,
          padding: "4px 20px"
        }}
      >
        {filtrados.map((emprestimo) => {
          const livro = obterLivro(emprestimo);
          const leitor = obterLeitor(emprestimo);

          const valorMulta = Number(emprestimo.multa || 0);
          const possuiMulta = temMulta(emprestimo);
          const statusAtualMulta = statusMulta(emprestimo);
          const multaPaga = statusAtualMulta === "PAGA";
          const atrasado = estaAtrasado(emprestimo);
          const suspenso = leitorEstaSuspenso(leitor);

          return (
            <LinhaItem
              key={emprestimo.id_emprestimo}
              titulo={livro?.titulo || "Livro não encontrado"}
              sub={
                `${leitor?.nome || "Leitor não encontrado"} · ` +
                `${formatarData(emprestimo.data_emprestimo)} · ` +
                `previsto: ${formatarData(
                  emprestimo.data_prevista
                )}` +
                (suspenso
                  ? ` · Suspenso até ${formatarData(
                    leitor.suspenso_ate
                  )}`
                  : "")
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
                  {emprestimo.status === "ATIVO" ? (
                    <span
                      style={{
                        color: atrasado
                          ? cores.carimbo
                          : cores.verdeOk,
                        fontSize: 12,
                        fontWeight: atrasado ? 600 : 400
                      }}
                    >
                      {atrasado ? "ATRASADO" : "ATIVO"}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: cores.tintaSuave,
                        fontSize: 12
                      }}
                    >
                      {emprestimo.status}
                    </span>
                  )}

                  {suspenso && (
                    <span
                      style={{
                        color: cores.carimbo,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                    >
                      LEITOR SUSPENSO
                    </span>
                  )}

                  {possuiMulta && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        border: `1px solid ${multaPaga
                          ? cores.verdeOk
                          : cores.carimbo
                          }`,
                        background: "transparent",
                        color: multaPaga
                          ? cores.verdeOk
                          : cores.carimbo,
                        borderRadius: 5,
                        padding: "4px 8px",
                        fontSize: 11,
                        fontWeight: 600
                      }}
                    >
                      {multaPaga ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <AlertTriangle size={13} />
                      )}

                      {formatarDinheiro(valorMulta)}
                      {multaPaga ? " · PAGA" : " · MULTA"}
                    </div>
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
    {emprestimo.status === "ATIVO" &&
      possuiMulta &&
      statusAtualMulta === "PENDENTE" && (
        <button
          type="button"
          onClick={() => quitarMulta(emprestimo.id_emprestimo)}
          style={botaoIcone}
          title="Pagar multa"
        >
          <DollarSign size={15} color={cores.carimbo} />
        </button>
      )}

    {emprestimo.status === "ATIVO" &&
      !possuiMulta && (
        <>
          <button
            type="button"
            onClick={() => iniciarDevolucao(emprestimo)}
            style={botaoIcone}
            title={
              atrasado
                ? "Escolher penalidade"
                : "Devolver livro"
            }
          >
            <CheckCircle2
              size={15}
              color={cores.verdeOk}
            />
          </button>

          {!atrasado && (
            <button
              type="button"
              onClick={() =>
                cancelarEmprestimo(emprestimo.id_emprestimo)
              }
              style={botaoIcone}
              title="Cancelar empréstimo"
            >
              <XCircle
                size={15}
                color={cores.carimbo}
              />
            </button>
          )}
        </>
      )}

    {ehAdministrador &&
      emprestimo.status !== "ATIVO" && (
        <button
          type="button"
          onClick={() => excluirEmprestimo(emprestimo)}
          style={botaoIcone}
          title="Excluir empréstimo permanentemente"
        >
          <Trash2 size={15} color={cores.carimbo} />
        </button>
      )}
  </div>
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
            Nenhum empréstimo encontrado.
          </p>
        )}
      </div>

      {/* =====================================================
          MODAL DE ESCOLHA: MULTA OU SUSPENSÃO
      ===================================================== */}

      {emprestimoParaDevolver && (
        <Modal
          onFechar={() => {
            if (!processandoDevolucao) {
              setEmprestimoParaDevolver(null);
            }
          }}
          titulo="Devolução em atraso"
        >
          <p>
            O empréstimo está atrasado. Selecione qual penalidade
            será aplicada ao leitor.
          </p>

          <div
            style={{
              background: cores.papel,
              border: `1px solid ${cores.linha}`,
              borderRadius: 6,
              padding: 12,
              marginBottom: 16
            }}
          >
            <p>
              <strong>Leitor:</strong>{" "}
              {obterLeitor(emprestimoParaDevolver)?.nome ||
                "Leitor não encontrado"}
            </p>

            <p>
              <strong>Livro:</strong>{" "}
              {obterLivro(emprestimoParaDevolver)?.titulo ||
                "Livro não encontrado"}
            </p>

            <p>
              <strong>Data prevista:</strong>{" "}
              {formatarData(
                emprestimoParaDevolver.data_prevista
              )}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}
          >
            <BotaoPrincipal
              onClick={() =>
                aplicarMulta(
                  emprestimoParaDevolver.id_emprestimo,
                )
              }
              full
              disabled={processandoDevolucao}
            >
              <DollarSign size={15} />
              Aplicar multa
            </BotaoPrincipal>

            <BotaoPrincipal
              onClick={() =>
                devolverLivro(
                  emprestimoParaDevolver.id_emprestimo,
                  "SUSPENSAO"
                )
              }
              full
              disabled={processandoDevolucao}
            >
              <AlertTriangle size={15} />
              Suspender leitor e devolver
            </BotaoPrincipal>

            <button
              type="button"
              onClick={() => setEmprestimoParaDevolver(null)}
              disabled={processandoDevolucao}
              style={{
                padding: 10,
                border: `1px solid ${cores.linha}`,
                borderRadius: 5,
                background: "transparent",
                color: cores.tintaSuave,
                cursor: "pointer"
              }}
            >
              Cancelar operação
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          MODAL DE DETALHES DA MULTA
      ===================================================== */}

      {multaSelecionada && (
        <Modal
          onFechar={() => setMultaSelecionada(null)}
          titulo="Detalhes da multa"
        >
          {carregandoMulta ? (
            <p
              style={{
                color: cores.tintaSuave,
                fontSize: 13
              }}
            >
              Carregando...
            </p>
          ) : (
            <div>
              <div style={{ marginBottom: 12 }}>
                <strong>Livro</strong>
                <p style={{ margin: "4px 0 0", color: cores.tintaSuave }}>
                  {typeof multaSelecionada.livro === "string"
                    ? multaSelecionada.livro
                    : multaSelecionada.livro?.titulo ||
                    "Livro não encontrado"}
                </p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>Leitor</strong>
                <p style={{ margin: "4px 0 0", color: cores.tintaSuave }}>
                  {typeof multaSelecionada.leitor === "string"
                    ? multaSelecionada.leitor
                    : multaSelecionada.leitor?.nome ||
                    "Leitor não encontrado"}
                </p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>Data prevista</strong>
                <p style={{ margin: "4px 0 0", color: cores.tintaSuave }}>
                  {formatarData(multaSelecionada.data_prevista)}
                </p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>Dias atrasados</strong>
                <p style={{ margin: "4px 0 0", color: cores.tintaSuave }}>
                  {multaSelecionada.dias_atrasados || 0} dia(s)
                </p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>Valor por dia</strong>
                <p style={{ margin: "4px 0 0", color: cores.tintaSuave }}>
                  {formatarDinheiro(
                    multaSelecionada.valor_por_dia
                  )}
                </p>
              </div>

              <div
                style={{
                  padding: 12,
                  marginBottom: 12,
                  border: `1px solid ${cores.linha}`,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <strong>Multa</strong>
                <strong
                  style={{
                    color:
                      multaSelecionada.status_multa === "PAGA"
                        ? cores.verdeOk
                        : cores.carimbo,
                    fontSize: 18
                  }}
                >
                  {formatarDinheiro(multaSelecionada.multa)}
                </strong>
              </div>

              <div style={{ marginBottom: 16 }}>
                <strong>Status</strong>
                <p
                  style={{
                    margin: "4px 0 0",
                    color:
                      multaSelecionada.status_multa === "PAGA"
                        ? cores.verdeOk
                        : cores.carimbo,
                    fontWeight: 600
                  }}
                >
                  {multaSelecionada.status_multa || "SEM_MULTA"}
                </p>
              </div>

              {multaSelecionada.data_pagamento && (
                <div style={{ marginBottom: 16 }}>
                  <strong>Data do pagamento</strong>
                  <p style={{ margin: "4px 0 0", color: cores.tintaSuave }}>
                    {formatarData(multaSelecionada.data_pagamento)}
                  </p>
                </div>
              )}

              {Number(multaSelecionada.multa || 0) > 0 &&
                multaSelecionada.status_multa === "PENDENTE" && (
                  <BotaoPrincipal
                    onClick={() =>
                      quitarMulta(
                        multaSelecionada.id_emprestimo
                      )
                    }
                    full
                  >
                    <CheckCircle2 size={15} />
                    Quitar multa
                  </BotaoPrincipal>
                )}

              {multaSelecionada.status_multa === "PAGA" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: 10,
                    color: cores.verdeOk,
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  <CheckCircle2 size={16} />
                  Multa já foi paga.
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* =====================================================
          MODAL DE NOVO EMPRÉSTIMO
      ===================================================== */}

      {novo && (
        <Modal
          onFechar={() => {
            limparFormulario();
            setNovo(false);
          }}
          titulo="Cadastrar empréstimo"
        >
          <Campo label="Leitor">
            <select
              style={inputStyle}
              value={id_leitores}
              onChange={(e) => {
                setIdLeitores(e.target.value);
                setErro("");
              }}
            >
              <option value="">Selecione um leitor</option>

              {leitores.map((leitor) => {
                const suspenso = leitorEstaSuspenso(leitor);

                return (
                  <option
                    key={leitor.id_leitores}
                    value={leitor.id_leitores}
                    disabled={suspenso}
                  >
                    {leitor.nome}
                    {suspenso
                      ? ` (suspenso até ${formatarData(
                        leitor.suspenso_ate
                      )})`
                      : ""}
                  </option>
                );
              })}
            </select>
          </Campo>

          <Campo label="Livro">
            <select
              style={inputStyle}
              value={id_livros}
              onChange={(e) => setIdLivros(e.target.value)}
            >
              <option value="">Selecione um livro</option>

              {livros
                .filter(
                  (livro) => Number(livro.quantidade) > 0
                )
                .map((livro) => (
                  <option
                    key={livro.id_livros}
                    value={livro.id_livros}
                  >
                    {livro.titulo} ({livro.quantidade} disponíveis)
                  </option>
                ))}
            </select>
          </Campo>

          
{ehAdministrador && (
  <Campo label="Usuário responsável">
    <select
      style={inputStyle}
      value={id_usuarios}
      onChange={(e) => setIdUsuarios(e.target.value)}
    >
      <option value="">Selecione o usuário</option>

      {usuarios.map((usuario) => (
        <option
          key={usuario.id_usuarios}
          value={usuario.id_usuarios}
        >
          {usuario.nome}
        </option>
      ))}
    </select>
  </Campo>
)}


          <Campo label="Data do empréstimo">
            <input
              type="date"
              style={inputStyle}
              value={data_emprestimo}
              onChange={(e) =>
                setDataEmprestimo(e.target.value)
              }
            />
          </Campo>

          <Campo label="Data prevista para devolução">
            <input
              type="date"
              style={inputStyle}
              value={data_prevista}
              onChange={(e) =>
                setDataPrevista(e.target.value)
              }
            />
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

          <BotaoPrincipal onClick={criarEmprestimo} full>
            Salvar empréstimo
          </BotaoPrincipal>
        </Modal>
      )}
    </div>
  );
}
