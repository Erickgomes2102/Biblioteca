
import React, { useState } from "react";
import { Plus, Trash2, Pencil, Ban } from "lucide-react";

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
  usuarios = [],
  usuarioLogado
}) {
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(null);
  const [editando, setEditando] = useState(null);
  const [cancelandoSuspensao, setCancelandoSuspensao] = useState(null);

  const ehBibliotecario =
    usuarioLogado?.tipo === "BIBLIOTECÁRIO";

  const ehAdministrador =
    usuarioLogado?.tipo === "ADMINISTRADOR";

  const listaLeitores = Array.isArray(leitores)
    ? leitores
    : [];

  const listaUsuarios = Array.isArray(usuarios)
    ? usuarios
    : [];

  const formatarData = (data) => {
    if (!data) return "";

    return new Date(data).toLocaleDateString("pt-BR");
  };
  const obterUsuarioResponsavel = (leitor) => {
    const idResponsavel =
      leitor?.id_usuarios ??
      leitor?.usuario?.id_usuarios ??
      leitor?.usuario?.id;

    if (leitor?.usuario?.nome) {
      return leitor.usuario;
    }

    return (
      listaUsuarios.find(
        (usuario) =>
          Number(usuario.id_usuarios ?? usuario.id) ===
          Number(idResponsavel)
      ) || null
    );
  };

  const estaSuspenso = (leitor) => {
    if (!leitor?.suspenso_ate) return false;

    return new Date(leitor.suspenso_ate) > new Date();
  }

  const filtrados = listaLeitores.filter((leitor) => {
    const texto = [
      leitor?.nome,
      leitor?.cpf,
      leitor?.email,
      leitor?.telefone
    ]
      .filter(
        (valor) =>
          valor !== null &&
          valor !== undefined
      )
      .map((valor) => String(valor))
      .join(" ")
      .toLowerCase();

    return texto.includes(busca.toLowerCase());
  });

  const adicionar = async (dados) => {
    try {
      await api.post("/CriarLeitores", dados);

      const resposta = await api.get("/ListarLeitores");

      setLeitores(resposta.data);
      setNovo(null);

      alert("Leitor cadastrado com sucesso!");
    } catch (error) {
      console.error(
        "Erro ao cadastrar leitor:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.erro ||
        error.response?.data?.message ||
        "Erro ao cadastrar leitor."
      );
    }
  };

  const cancelarSuspensao = async (leitor) => {
    if (!leitor?.id_leitores) {
      alert("ID do leitor inválido.");
      return;
    }

    const confirmar = window.confirm(
      `Deseja cancelar a suspensão de ${leitor.nome}?`
    );

    if (!confirmar) return;

    setCancelandoSuspensao(leitor.id_leitores);

    try {
      await api.patch(
        `/CancelarSuspensao/${leitor.id_leitores}`
      );

      const resposta = await api.get("/ListarLeitores");

      if (Array.isArray(resposta.data)) {
        setLeitores(resposta.data);
      }

      alert("Suspensão cancelada com sucesso!");
    } catch (error) {
      console.error(
        "Erro ao cancelar suspensão:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.erro ||
        error.response?.data?.message ||
        "Erro ao cancelar suspensão."
      );
    } finally {
      setCancelandoSuspensao(null);
    }
  };

  const remover = async (id_leitores) => {
    if (!ehAdministrador) {
      alert("Somente o administrador pode excluir leitores.");
      return;
    }

    const confirmar = window.confirm(
      "Tem certeza de que deseja excluir este leitor?"
    );

    if (!confirmar) return;

    try {
      await api.delete(`/RemoverLeitor/${id_leitores}`);

      setLeitores((listaAtual) =>
        listaAtual.filter(
          (leitor) => leitor.id_leitores !== id_leitores
        )
      );

      alert("Leitor excluído com sucesso!");
    } catch (error) {
      console.error(
        "Erro ao excluir leitor:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.erro ||
        error.response?.data?.message ||
        "Erro ao excluir leitor."
      );
    }
  };

  const abrirEdicao = (leitor) => {
    setEditando(leitor);
  };

  const editar = async (dados) => {
    if (!editando) return;

    try {
      const resposta = await api.put(
        `/EditarLeitores/${editando.id_leitores}`,
        dados
      );

      const leitorAtualizado = resposta.data;

      const listaAtualizada = await api.get("/ListarLeitores");

      setLeitores(
        Array.isArray(listaAtualizada.data)
          ? listaAtualizada.data
          : listaLeitores.map((leitor) =>
            leitor.id_leitores === editando.id_leitores
              ? { ...leitor, ...leitorAtualizado }
              : leitor
          )
      );

      setEditando(null);

      alert("Dados do leitor atualizados com sucesso!");
    } catch (error) {
      console.error(
        "Erro ao editar leitor:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.erro ||
        error.response?.data?.message ||
        "Erro ao editar leitor."
      );
    }
  };

  return (
    <div>
      <Cabecalho
        titulo="Leitores"
        subtitulo={`${listaLeitores.length} pessoas cadastradas`}
        acao={
          <BotaoPrincipal onClick={() => setNovo({})}>
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
          const nome = leitor?.nome || "Nome não informado";
          const email = leitor?.email || "E-mail não informado";
          const telefone =
            leitor?.telefone || "Telefone não informado";
          const suspenso = estaSuspenso(leitor);
          const usuarioResponsavel = obterUsuarioResponsavel(leitor);
          if (leitor.id_leitores === filtrados[0]?.id_leitores) {
            console.log("LEITOR:", leitor);
            console.log("USUÁRIOS:", listaUsuarios);
            console.log("RESPONSÁVEL ENCONTRADO:", usuarioResponsavel);
          }
          const processando =
            cancelandoSuspensao === leitor.id_leitores;

          return (
            <LinhaItem
              key={leitor.id_leitores}
              titulo={
                <>
                  {nome}

                  {suspenso && (
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: 8,
                        padding: "3px 7px",
                        borderRadius: 4,
                        background: "#FDE8E7",
                        color: "#A61B1B",
                        fontSize: 11,
                        fontWeight: 700,
                        verticalAlign: "middle"
                      }}
                    >
                      SUSPENSO
                    </span>
                  )}
                </>
              }
              sub={
                <>
                  {email} · {telefone} · Responsável:{" "}
                  {usuarioResponsavel?.nome || "Não atribuído"}

                  {suspenso && (
                    <span>
                      {" "}· Suspenso até{" "}
                      {formatarData(leitor.suspenso_ate)}
                    </span>
                  )}
                </>
              }
              acao={
                <>
                  <button
                    type="button"
                    onClick={() => abrirEdicao(leitor)}
                    style={botaoIcone}
                    title="Editar leitor"
                  >
                    <Pencil
                      size={16}
                      color={cores.tintaSuave}
                    />
                  </button>

                  {suspenso && (
                    <button
                      type="button"
                      onClick={() => cancelarSuspensao(leitor)}
                      disabled={processando}
                      style={{
                        ...botaoIcone,
                        opacity: processando ? 0.5 : 1,
                        cursor: processando
                          ? "not-allowed"
                          : "pointer"
                      }}
                      title="Cancelar suspensão"
                    >
                      <Ban
                        size={16}
                        color="#DC2626"
                      />
                    </button>
                  )}

                  {ehAdministrador && (
                    <button
                      type="button"
                      onClick={() => remover(leitor.id_leitores)}
                      style={botaoIcone}
                      title="Excluir leitor"
                    >
                      <Trash2
                        size={14}
                        color={cores.tintaSuave}
                      />
                    </button>
                  )}
                </>
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
          usuarioLogado={usuarioLogado}
        />
      )}

      {editando !== null && (
        <ModalLeitor
          onFechar={() => setEditando(null)}
          onSalvar={editar}
          usuarios={listaUsuarios}
          usuarioLogado={usuarioLogado}
          leitor={editando}
        />
      )}
    </div>
  );
}
