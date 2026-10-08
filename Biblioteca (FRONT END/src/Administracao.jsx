import React, { useEffect, useState } from "react";
import {
  Shield,
  User,
  Pencil,
  Trash2
} from "lucide-react";

import api from "./services/api";

import {
  cores,
  botaoIcone,
  inputStyle
} from "./empréstimos/styles/tema";

import Cabecalho from "./components/comum/Cabecalho";
import BarraBusca from "./components/comum/BarraBusca";
import BotaoPrincipal from "./components/comum/BotaoPrincipal";
import Modal from "./components/comum/Modal";
import Campo from "./components/comum/Campo";

export default function Administracao({
  usuarioLogado,
  usuarios,
  setUsuarios
}) {

  const [busca, setBusca] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");


  // =====================================================
  // VERIFICAR ADMINISTRADOR
  // =====================================================

  const ehAdministrador =
    usuarioLogado?.tipo === "ADMINISTRADOR";


  // =====================================================
  // CARREGAR USUÁRIOS
  // =====================================================

  const carregarUsuarios = async () => {

    try {

      setCarregando(true);
      setErro("");

      const resposta = await api.get(
        "/Administracao/Usuarios"
      );

      setUsuarios(resposta.data);

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

      setErro(
        error.response?.data?.erro ||
        "Erro ao carregar usuários."
      );

    } finally {

      setCarregando(false);

    }

  };


  // =====================================================
  // CARREGAR USUÁRIOS AO ABRIR ADMINISTRAÇÃO
  // =====================================================

  useEffect(() => {

    if (!ehAdministrador) {
      return;
    }

    carregarUsuarios();

  }, [ehAdministrador]);


  // =====================================================
  // LIMPAR FORMULÁRIO
  // =====================================================

  const limparFormulario = () => {

    setNome("");
    setEmail("");
    setUsuarioEditando(null);

  };


  // =====================================================
  // ABRIR EDIÇÃO
  // =====================================================

  const abrirEdicao = (usuario) => {

    setUsuarioEditando(usuario);

    setNome(usuario.nome || "");
    setEmail(usuario.email || "");

  };


  // =====================================================
  // EDITAR USUÁRIO
  // =====================================================

  const editarUsuario = async () => {

    if (!usuarioEditando) {
      return;
    }

    if (!nome.trim()) {

      alert("Informe o nome do usuário.");

      return;

    }

    if (!email.trim()) {

      alert("Informe o email do usuário.");

      return;

    }

    try {

      await api.put(
        `/Administracao/Usuarios/Editar/${usuarioEditando.id_usuarios}`,
        {
          nome: nome.trim(),
          email: email.trim()
        }
      );

      await carregarUsuarios();

      limparFormulario();

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

      alert(
        error.response?.data?.erro ||
        "Erro ao editar usuário."
      );

    }

  };


  // =====================================================
  // ALTERAR PRIVILÉGIO
  // =====================================================

  const alterarPrivilegio = async (
    id_usuarios,
    novoTipo
  ) => {

    if (
      novoTipo !== "ADMINISTRADOR" &&
      novoTipo !== "BIBLIOTECÁRIO"
    ) {
      return;
    }

    if (
      Number(id_usuarios) ===
      Number(usuarioLogado?.id)
    ) {

      alert(
        "Não é possível alterar o próprio privilégio."
      );

      return;

    }

    try {

      await api.patch(
        `/Administracao/Usuarios/Privilegio/${id_usuarios}`,
        {
          tipo: novoTipo
        }
      );

      await carregarUsuarios();

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

      alert(
        error.response?.data?.erro ||
        "Erro ao alterar privilégio."
      );

    }

  };


  // =====================================================
  // EXCLUIR USUÁRIO
  // =====================================================

  const excluirUsuario = async (
    id_usuarios
  ) => {

    if (
      Number(id_usuarios) ===
      Number(usuarioLogado?.id)
    ) {

      alert(
        "Não é possível excluir o próprio usuário pela administração."
      );

      return;

    }

    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este usuário?"
    );

    if (!confirmar) {
      return;
    }

    try {

      await api.delete(
        `/Administracao/Usuarios/Deletar/${id_usuarios}`
      );

      await carregarUsuarios();

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

      alert(
        error.response?.data?.erro ||
        "Erro ao excluir usuário."
      );

    }

  };


  // =====================================================
  // FILTRO
  // =====================================================

  const usuariosFiltrados =
    (usuarios || []).filter((usuario) => {

      const termo =
        busca.toLowerCase().trim();

      if (!termo) {
        return true;
      }

      return (

        String(usuario.nome || "")
          .toLowerCase()
          .includes(termo)

        ||

        String(usuario.email || "")
          .toLowerCase()
          .includes(termo)

        ||

        String(usuario.tipo || "")
          .toLowerCase()
          .includes(termo)

      );

    });


  // =====================================================
  // ACESSO NEGADO
  // =====================================================

  if (!ehAdministrador) {

    return (

      <div
        style={{
          minHeight: "100vh",
          padding: 30,
          color: cores.tinta,
          background: cores.papel
        }}
      >

        <Cabecalho
          titulo="Administração"
          subtitulo="Acesso restrito"
        />

        <div
          style={{
            marginTop: 30,
            padding: 25,
            border: `1px solid ${cores.linha}`,
            borderRadius: 8,
            background: cores.papel
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10
            }}
          >

            <Shield
              size={20}
              color={cores.carimbo}
            />

            <strong>
              Acesso negado
            </strong>

          </div>

          <p
            style={{
              margin: 0,
              color: cores.tintaSuave
            }}
          >
            Esta área está disponível somente
            para Administradores.
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // INTERFACE
  // =====================================================

  return (

    <div>

      <Cabecalho
        titulo="Administração"
        subtitulo={`${usuariosFiltrados.length} usuários`}
      />


      <div
        style={{
          padding: "0 24px 24px"
        }}
      >


        {/* BUSCA */}

        <div
          style={{
            marginBottom: 20
          }}
        >

          <BarraBusca
            valor={busca}
            onChange={setBusca}
            placeholder="Buscar usuário..."
          />

        </div>


        {/* ERRO */}

        {erro && (

          <div
            style={{
              marginBottom: 20,
              padding: 12,
              border: `1px solid ${cores.linha}`,
              borderRadius: 6,
              color: cores.carimbo
            }}
          >

            {erro}

          </div>

        )}


        {/* CARREGANDO */}

        {carregando ? (

          <div
            style={{
              padding: 30,
              textAlign: "center",
              color: cores.tintaSuave
            }}
          >

            Carregando usuários...

          </div>

        ) : (

          <div
            style={{
              border: `1px solid ${cores.linha}`,
              borderRadius: 8,
              overflow: "hidden"
            }}
          >


            {/* CABEÇALHO */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "2fr 2fr 1.3fr 150px",
                gap: 15,
                padding: "14px 18px",
                borderBottom:
                  `1px solid ${cores.linha}`,
                color: cores.tintaSuave,
                fontSize: 12,
                fontWeight: 600
              }}
            >

              <div>
                USUÁRIO
              </div>

              <div>
                EMAIL
              </div>

              <div>
                PRIVILÉGIO
              </div>

              <div>
                AÇÕES
              </div>

            </div>


            {/* USUÁRIOS */}

            {usuariosFiltrados.length === 0 ? (

              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: cores.tintaSuave
                }}
              >

                Nenhum usuário encontrado.

              </div>

            ) : (

              usuariosFiltrados.map(
                (usuario) => (

                  <div
                    key={
                      usuario.id_usuarios
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "2fr 2fr 1.3fr 150px",
                      gap: 15,
                      alignItems: "center",
                      padding:
                        "14px 18px",
                      borderBottom:
                        `1px solid ${cores.linha}`
                    }}
                  >


                    {/* USUÁRIO */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10
                      }}
                    >

                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border:
                            `1px solid ${cores.linha}`
                        }}
                      >

                        <User
                          size={16}
                          color={cores.carimbo}
                        />

                      </div>


                      <div>

                        <div
                          style={{
                            fontWeight: 600,
                            color: cores.tinta
                          }}
                        >

                          {usuario.nome}

                        </div>


                        {Number(
                          usuario.id_usuarios
                        ) === Number(
                          usuarioLogado?.id
                        ) && (

                          <div
                            style={{
                              fontSize: 11,
                              color:
                                cores.tintaSuave,
                              marginTop: 2
                            }}
                          >

                            Você

                          </div>

                        )}

                      </div>

                    </div>


                    {/* EMAIL */}

                    <div
                      style={{
                        color: cores.tintaSuave,
                        fontSize: 13
                      }}
                    >

                      {usuario.email}

                    </div>


                    {/* PRIVILÉGIO */}

                    <div>

                      <select
                        value={
                          usuario.tipo ||
                          "BIBLIOTECÁRIO"
                        }
                        disabled={
                          Number(
                            usuario.id_usuarios
                          ) === Number(
                            usuarioLogado?.id
                          )
                        }
                        onChange={(e) =>
                          alterarPrivilegio(
                            usuario.id_usuarios,
                            e.target.value
                          )
                        }
                        style={{
                          ...inputStyle,
                          width: "100%",
                          cursor:
                            Number(
                              usuario.id_usuarios
                            ) === Number(
                              usuarioLogado?.id
                            )
                              ? "not-allowed"
                              : "pointer"
                        }}
                      >

                        <option value="BIBLIOTECÁRIO">
                          Bibliotecário
                        </option>

                        <option value="ADMINISTRADOR">
                          Administrador
                        </option>

                      </select>

                    </div>


                    {/* AÇÕES */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          abrirEdicao(
                            usuario
                          )
                        }
                        style={{
                          ...botaoIcone,
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center"
                        }}
                        title="Editar usuário"
                      >

                        <Pencil
                          size={15}
                          color={
                            cores.carimbo
                          }
                        />

                      </button>


                      {Number(
                        usuario.id_usuarios
                      ) !== Number(
                        usuarioLogado?.id
                      ) && (

                        <button
                          type="button"
                          onClick={() =>
                            excluirUsuario(
                              usuario.id_usuarios
                            )
                          }
                          style={{
                            ...botaoIcone,
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "center"
                          }}
                          title="Excluir usuário"
                        >

                          <Trash2
                            size={15}
                            color={
                              cores.carimbo
                            }
                          />

                        </button>

                      )}

                    </div>

                  </div>

                )

              )

            )}

          </div>

        )}

      </div>


      {/* MODAL EDITAR */}

      {usuarioEditando && (

        <Modal
          onFechar={
            limparFormulario
          }
          titulo="Editar usuário"
        >

          <Campo label="Nome">

            <input
              style={inputStyle}
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
              placeholder="Nome do usuário"
            />

          </Campo>


          <Campo label="Email">

            <input
              style={inputStyle}
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Email do usuário"
              type="email"
            />

          </Campo>


          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 20
            }}
          >

            <button
              type="button"
              onClick={
                limparFormulario
              }
              style={{
                ...botaoIcone,
                padding:
                  "8px 14px"
              }}
            >
              Cancelar
            </button>


            <BotaoPrincipal
              onClick={
                editarUsuario
              }
            >
              Salvar
            </BotaoPrincipal>

          </div>

        </Modal>

      )}

    </div>

  );

}