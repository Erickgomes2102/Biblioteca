import React, { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";

import api from "../services/api";
import { cores, botaoIcone, inputStyle } from "../empréstimos/styles/tema";

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

  const [id_leitores, setIdLeitores] = useState("");
  const [id_livros, setIdLivros] = useState("");
  const [id_usuarios, setIdUsuarios] = useState("");
  const [data_emprestimo, setDataEmprestimo] = useState("");
  const [data_prevista, setDataPrevista] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregarEmprestimos = async () => {
      try {
        const resposta = await api.get("/ListarEmprestimo");
        setEmprestimos(resposta.data);
      } catch (error) {
        console.log(
          error.response?.data || error.message
        );
      }
    };

    carregarEmprestimos();
  }, [setEmprestimos]);

  const filtrados = emprestimos.filter((emprestimo) => {
    const livro = livros.find(
      (l) => l.id_livros === emprestimo.id_livros
    );

    const leitor = leitores.find(
      (l) => l.id_leitores === emprestimo.id_leitores
    );

    return (
      (livro?.titulo || "") +
      (leitor?.nome || "") +
      emprestimo.status
    )
      .toLowerCase()
      .includes(busca.toLowerCase());
  });

  const limparFormulario = () => {
    setIdLeitores("");
    setIdLivros("");
    setIdUsuarios("");
    setDataEmprestimo("");
    setDataPrevista("");
    setErro("");
  };

  const criarEmprestimo = async () => {
    if (
      !id_leitores ||
      !id_livros ||
      !id_usuarios ||
      !data_emprestimo
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const dados = {
        id_leitores: Number(id_leitores),
        id_livros: Number(id_livros),
        id_usuarios: Number(id_usuarios),
        data_emprestimo: new Date(
          `${data_emprestimo}T00:00:00.000Z`
        ).toISOString(),
        data_prevista: data_prevista
          ? new Date(
              `${data_prevista}T00:00:00.000Z`
            ).toISOString()
          : null,
        data_devolucao: new Date(
          `${data_prevista || data_emprestimo}T00:00:00.000Z`
        ).toISOString()
      };

      const resposta = await api.post(
        "/CriarEmprestimos",
        dados
      );

      setEmprestimos([
        resposta.data,
        ...emprestimos
      ]);

      setLivros(
        livros.map((livro) =>
          livro.id_livros === Number(id_livros)
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
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erro ao criar empréstimo."
      );
    }
  };

  const devolverLivro = async (id_emprestimo) => {
    try {
      const resposta = await api.patch(
        `/DevolverLivro/${id_emprestimo}`
      );

      setEmprestimos(
        emprestimos.map((emprestimo) =>
          emprestimo.id_emprestimo === id_emprestimo
            ? {
                ...emprestimo,
                status: "DEVOLVIDO",
                data_devolucao: new Date().toISOString()
              }
            : emprestimo
        )
      );

      const emprestimo = emprestimos.find(
        (e) => e.id_emprestimo === id_emprestimo
      );

      if (emprestimo) {
        setLivros(
          livros.map((livro) =>
            livro.id_livros === emprestimo.id_livros
              ? {
                  ...livro,
                  quantidade:
                    Number(livro.quantidade) + 1
                }
              : livro
          )
        );
      }

      console.log(resposta.data);
    } catch (error) {
      console.log(
        error.response?.data || error.message
      );
    }
  };

  const cancelarEmprestimo = async (id_emprestimo) => {
    try {
      await api.patch(
        `/CancelarEmprestimo/${id_emprestimo}`
      );

      const emprestimo = emprestimos.find(
        (e) => e.id_emprestimo === id_emprestimo
      );

      setEmprestimos(
        emprestimos.map((e) =>
          e.id_emprestimo === id_emprestimo
            ? {
                ...e,
                status: "CANCELADO",
                data_devolucao:
                  new Date().toISOString()
              }
            : e
        )
      );

      if (emprestimo) {
        setLivros(
          livros.map((livro) =>
            livro.id_livros === emprestimo.id_livros
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
        error.response?.data || error.message
      );
    }
  };

  const formatarData = (data) => {
    if (!data) return "-";

    return new Date(data).toLocaleDateString(
      "pt-BR"
    );
  };

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
          marginTop: 16,
          background: cores.papel,
          border: `1px solid ${cores.linha}`,
          borderRadius: 6,
          padding: "4px 20px"
        }}
      >
        {filtrados.map((emprestimo) => {
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

          return (
            <LinhaItem
              key={emprestimo.id_emprestimo}
              titulo={
                livro?.titulo ||
                "Livro não encontrado"
              }
              sub={`${leitor?.nome || "Leitor não encontrado"} · ${formatarData(
                emprestimo.data_emprestimo
              )} · previsto: ${formatarData(
                emprestimo.data_prevista
              )}`}
              selo={
                emprestimo.status === "ATIVO" ? (
                  <span
                    style={{
                      color: cores.verdeOk,
                      fontSize: 12
                    }}
                  >
                    ATIVO
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
                )
              }
              acao={
                emprestimo.status === "ATIVO" ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 4
                    }}
                  >
                    <button
                      onClick={() =>
                        devolverLivro(
                          emprestimo.id_emprestimo
                        )
                      }
                      style={botaoIcone}
                      title="Devolver livro"
                    >
                      <CheckCircle2
                        size={15}
                        color={cores.verdeOk}
                      />
                    </button>

                    <button
                      onClick={() =>
                        cancelarEmprestimo(
                          emprestimo.id_emprestimo
                        )
                      }
                      style={botaoIcone}
                      title="Cancelar empréstimo"
                    >
                      <XCircle
                        size={15}
                        color={cores.carimbo}
                      />
                    </button>
                  </div>
                ) : null
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
              onChange={(e) =>
                setIdLeitores(e.target.value)
              }
            >
              <option value="">
                Selecione um leitor
              </option>

              {leitores.map((leitor) => (
                <option
                  key={leitor.id_leitores}
                  value={leitor.id_leitores}
                >
                  {leitor.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Livro">
            <select
              style={inputStyle}
              value={id_livros}
              onChange={(e) =>
                setIdLivros(e.target.value)
              }
            >
              <option value="">
                Selecione um livro
              </option>

              {livros
                .filter(
                  (livro) =>
                    Number(livro.quantidade) > 0
                )
                .map((livro) => (
                  <option
                    key={livro.id_livros}
                    value={livro.id_livros}
                  >
                    {livro.titulo} (
                    {livro.quantidade} disponíveis)
                  </option>
                ))}
            </select>
          </Campo>

          <Campo label="Usuário responsável">
            <select
              style={inputStyle}
              value={id_usuarios}
              onChange={(e) =>
                setIdUsuarios(e.target.value)
              }
            >
              <option value="">
                Selecione o usuário
              </option>

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

          <BotaoPrincipal
            onClick={criarEmprestimo}
            full
          >
            Salvar empréstimo
          </BotaoPrincipal>
        </Modal>
      )}
    </div>
  );
}