// FRONT-END: PerfilUsuario.jsx

import React, { useRef, useState } from "react";
import api from "../services/api";
import { cores } from "../empréstimos/styles/tema";
import { AVATARES } from "../empréstimos/utils/avatares";

function extrairAvatarDaResposta(data, avatarAnterior) {
  if (!data) return avatarAnterior;

  if (typeof data === "string") {
    return data;
  }

  return (
    data.avatar ||
    data.url ||
    data.avatarUrl ||
    data.usuario?.avatar ||
    avatarAnterior
  );
}

export default function PerfilUsuario({
  usuario,
  onAtualizar,
  onExcluido,
}) {
  const idUsuario = usuario?.id_usuarios || usuario?.id;

  const [nome, setNome] = useState(usuario?.nome || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [avatar, setAvatar] = useState(
    usuario?.avatar || "avatar_1"
  );

  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [seletorAberto, setSeletorAberto] = useState(false);

  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const inputArquivoRef = useRef(null);

  const fotoEhPersonalizada =
    avatar && !avatar.startsWith("avatar_");

  // =========================
  // SALVAR PERFIL
  // =========================

  const salvar = async (e) => {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!nome.trim() || !email.trim()) {
      setErro("Preencha nome e e-mail.");
      return;
    }

    const dados = {
      nome: nome.trim(),
      email: email.trim(),
    };

    if (novaSenha.trim()) {
      dados.senha = novaSenha;
    }

    setSalvando(true);

    try {
      const resposta = await api.put(
        `/EditarUsuario/${idUsuario}`,
        dados
      );

      const usuarioAtualizado =
        resposta.data?.usuario || {
          ...usuario,
          ...dados,
          avatar,
        };

      onAtualizar(usuarioAtualizado);

      setNovaSenha("");
      setSucesso("Perfil atualizado com sucesso!");
    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Não foi possível salvar."
      );
    } finally {
      setSalvando(false);
    }
  };

  // =========================
  // ESCOLHER ARQUIVO
  // =========================

  const escolherArquivo = () => {
    inputArquivoRef.current?.click();
  };

  // =========================
  // ENVIAR FOTO
  // =========================

  const enviarFoto = async (e) => {
    const arquivo = e.target.files?.[0];

    e.target.value = "";

    if (!arquivo) return;

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setErro(
        "Formato não permitido. Use JPG, PNG ou WEBP."
      );
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setErro("A imagem precisa ter até 5MB.");
      return;
    }

    setErro("");
    setSucesso("");
    setEnviandoFoto(true);

    const formData = new FormData();

    formData.append("avatar", arquivo);
    formData.append("id_usuarios", idUsuario);

    try {
      const token = localStorage.getItem("token");

      const resposta = await api.post(
        "/MeuPerfil/Avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      console.log(
        "Resposta do upload de avatar:",
        resposta.data
      );

      const novoAvatar = extrairAvatarDaResposta(
        resposta.data,
        avatar
      );

      setAvatar(novoAvatar);

      onAtualizar({
        ...usuario,
        avatar: novoAvatar,
      });

      setSucesso("Foto atualizada com sucesso!");
    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Não foi possível enviar a foto."
      );
    } finally {
      setEnviandoFoto(false);
    }
  };

  // =========================
  // REMOVER FOTO
  // =========================

  const removerFoto = async () => {
    setErro("");
    setSucesso("");

    try {
      const token = localStorage.getItem("token");

      await api.delete("/MeuPerfil/Avatar", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        data: {
          id_usuarios: idUsuario,
        },
      });

      setAvatar("avatar_1");

      onAtualizar({
        ...usuario,
        avatar: "avatar_1",
      });

      setSucesso("Foto removida.");
    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Não foi possível remover a foto."
      );
    }
  };

  // =========================
  // EXCLUIR CONTA
  // =========================

  const excluirConta = async () => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
    );

    if (!confirmar) return;

    setExcluindo(true);

    try {
      await api.delete(
        `/ExcluirUsuario/${idUsuario}`
      );

      onExcluido();
    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Não foi possível excluir a conta."
      );

      setExcluindo(false);
    }
  };

  // =========================
  // TELA
  // =========================

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        padding: 24,
        color: cores.texto,
      }}
    >
      <form onSubmit={salvar}>
        {/* AVATAR */}

        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {fotoEhPersonalizada ? (
              <img
                src={avatar}
                alt="Avatar"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: cores.papel,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 50,
                }}
              >
                {AVATARES.find(
                  (a) => a.codigo === avatar
                )?.emoji || "👤"}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setSeletorAberto((v) => !v)
              }
              style={{
                fontSize: 12,
                color: cores.latao,
                cursor: "pointer",
                fontWeight: 600,
                background: "none",
                border: "none",
              }}
            >
              {seletorAberto
                ? "Fechar ícones"
                : "Escolher ícone"}
            </button>

            <button
              type="button"
              onClick={escolherArquivo}
              disabled={enviandoFoto}
              style={{
                fontSize: 12,
                color: cores.latao,
                cursor: "pointer",
                fontWeight: 600,
                background: "none",
                border: "none",
              }}
            >
              {enviandoFoto
                ? "Enviando..."
                : "Enviar foto"}
            </button>

            {fotoEhPersonalizada && (
              <button
                type="button"
                onClick={removerFoto}
                style={{
                  fontSize: 12,
                  color: "red",
                  cursor: "pointer",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                }}
              >
                Remover foto
              </button>
            )}
          </div>

          <input
            ref={inputArquivoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={enviarFoto}
            style={{ display: "none" }}
          />

          {/* SELETOR DE ÍCONES */}

          {seletorAberto && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              {AVATARES.map((a) => (
                <button
                  key={a.codigo}
                  type="button"
                  onClick={() => {
                    setAvatar(a.codigo);
                    setSeletorAberto(false);
                  }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    fontSize: 18,
                    border:
                      avatar === a.codigo
                        ? `2px solid ${cores.latao}`
                        : "2px solid transparent",
                    background: cores.papel,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={a.codigo}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* NOME */}

        <div style={{ marginBottom: 16 }}>
          <label>Nome</label>

          <input
            type="text"
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
            }}
          />
        </div>

        {/* EMAIL */}

        <div style={{ marginBottom: 16 }}>
          <label>E-mail</label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
            }}
          />
        </div>

        {/* SENHA */}

        <div
          style={{
            marginBottom: 16,
            position: "relative",
          }}
        >
          <label>Nova senha</label>

          <input
            type={mostrarSenha ? "text" : "password"}
            value={novaSenha}
            onChange={(e) =>
              setNovaSenha(e.target.value)
            }
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              paddingRight: 40,
            }}
          />

          <button
            type="button"
            onClick={() =>
              setMostrarSenha((v) => !v)
            }
            tabIndex={-1}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(10%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              fontSize: 14,
            }}
          >
            {mostrarSenha ? "🙈" : "👁️"}
          </button>
        </div>

        {/* MENSAGENS */}

        {erro && (
          <div
            style={{
              color: "red",
              marginBottom: 12,
            }}
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            style={{
              color: "green",
              marginBottom: 12,
            }}
          >
            {sucesso}
          </div>
        )}

        {/* SALVAR */}

        <button
          type="submit"
          disabled={salvando}
          style={{
            width: "100%",
            padding: 12,
            cursor: "pointer",
          }}
        >
          {salvando
            ? "Salvando..."
            : "Salvar alterações"}
        </button>
      </form>

      {/* EXCLUIR */}

      <div
        style={{
          marginTop: 30,
          paddingTop: 20,
          borderTop: "1px solid #ddd",
        }}
      >
        <p>
          Excluir sua conta é uma ação permanente.
        </p>

        <button
          type="button"
          onClick={excluirConta}
          disabled={excluindo}
          style={{
            color: "red",
            cursor: "pointer",
            padding: 10,
          }}
        >
          {excluindo
            ? "Excluindo..."
            : "Excluir minha conta"}
        </button>
      </div>
    </div>
  );
}