import React, { useRef, useState } from "react";
import api from "../services/api";
import { cores, fontUI, inputStyle } from "../empréstimos/styles/tema";
import { AVATARES } from "../empréstimos/utils/avatares";
import Cabecalho from "../components/comum/Cabecalho";
import Campo from "../components/comum/Campo";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";
import Avatar from "../components/comum/Avatar";

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

export default function PerfilUsuario({ usuario, onAtualizar, onExcluido }) {
  const [nome, setNome] = useState(usuario?.nome || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [avatar, setAvatar] = useState(usuario?.avatar || "avatar_1");
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

  const idUsuario =
    usuario?.id ?? usuario?.id_usuarios;

  const salvar = async (e) => {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!nome.trim() || !email.trim()) {
      setErro("Preencha nome e e-mail.");
      return;
    }

    if (!idUsuario) {
      setErro("ID do usuário não encontrado.");
      return;
    }

    const dados = {
      nome: nome.trim(),
      email: email.trim()
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

      const usuarioResposta =
        resposta.data?.usuario ||
        resposta.data;

      const usuarioAtualizado = {
        ...usuario,
        ...dados,
        ...(usuarioResposta || {}),
        avatar
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
        error.response?.data?.erro ||
        "Não foi possível salvar."
      );

    } finally {
      setSalvando(false);
    }
  };

  const escolherArquivo = () => {
    inputArquivoRef.current?.click();
  };

  const enviarFoto = async (e) => {
    const arquivo = e.target.files?.[0];

    e.target.value = "";

    if (!arquivo) {
      return;
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp"
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

    if (!idUsuario) {
      setErro("ID do usuário não encontrado.");
      return;
    }

    setErro("");
    setSucesso("");
    setEnviandoFoto(true);

    try {
      const formData = new FormData();

      formData.append("avatar", arquivo);
      formData.append(
        "id_usuarios",
        String(idUsuario)
      );

      const resposta = await api.post(
        "/MeuPerfil/Avatar",
        formData
      );

      const novoAvatar = extrairAvatarDaResposta(
        resposta.data,
        avatar
      );

      setAvatar(novoAvatar);

      onAtualizar({
        ...usuario,
        avatar: novoAvatar
      });

      setSucesso(
        "Foto atualizada com sucesso!"
      );

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.erro ||
        "Não foi possível enviar a foto."
      );

    } finally {
      setEnviandoFoto(false);
    }
  };

  const removerFoto = async () => {
    setErro("");
    setSucesso("");

    if (!idUsuario) {
      setErro("ID do usuário não encontrado.");
      return;
    }

    try {
      await api.delete(`/MeuPerfil/Avatar/${idUsuario}`);

      setAvatar("avatar_1");

      onAtualizar({
        ...usuario,
        avatar: "avatar_1"
      });

      setSucesso("Foto removida.");

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.erro ||
        "Não foi possível remover a foto."
      );
    }
  };

  const excluirConta = async () => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
    );

    if (!confirmar) {
      return;
    }

    if (!idUsuario) {
      setErro("ID do usuário não encontrado.");
      return;
    }

    setExcluindo(true);
    setErro("");
    setSucesso("");

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
        error.response?.data?.erro ||
        "Não foi possível excluir a conta."
      );

      setExcluindo(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        fontFamily: fontUI
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420
        }}
      >
        <Cabecalho
          titulo="Meu perfil"
          subtitulo="Edite seus dados ou exclua sua conta"
        />

        <form
          onSubmit={salvar}
          style={{
            background: cores.papel,
            border: `1px solid ${cores.linha}`,
            borderRadius: 6,
            padding: "20px 22px"
          }}
        >
          {/* AVATAR */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 20
            }}
          >
            <div
              style={{
                border: `2px solid ${cores.latao}`,
                borderRadius: "50%"
              }}
            >
              <Avatar
                avatar={avatar}
                tamanho={72}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 8
              }}
            >
              <span
                onClick={() =>
                  setSeletorAberto((v) => !v)
                }
                style={{
                  fontSize: 12,
                  color: cores.latao,
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                {seletorAberto
                  ? "Fechar ícones"
                  : "Escolher ícone"}
              </span>

              <span
                onClick={escolherArquivo}
                style={{
                  fontSize: 12,
                  color: cores.latao,
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                {enviandoFoto
                  ? "Enviando..."
                  : "Enviar foto"}
              </span>

              {fotoEhPersonalizada && (
                <span
                  onClick={removerFoto}
                  style={{
                    fontSize: 12,
                    color: cores.carimbo,
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Remover foto
                </span>
              )}
            </div>

            <input
              ref={inputArquivoRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={enviarFoto}
              style={{ display: "none" }}
            />

            {seletorAberto && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(6, 1fr)",
                  gap: 8,
                  marginTop: 14,
                  padding: 12,
                  background: cores.fundo,
                  borderRadius: 6,
                  border: `1px solid ${cores.linha}`
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
                      justifyContent: "center"
                    }}
                    title={a.codigo}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Campo label="Nome">
            <input
              style={inputStyle}
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
            />
          </Campo>

          <Campo label="E-mail">
            <input
              style={inputStyle}
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </Campo>

          <Campo label="Nova senha (deixe em branco para não alterar)">
            <div
              style={{
                position: "relative"
              }}
            >
              <input
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                style={{
                  ...inputStyle,
                  paddingRight: 38
                }}
                value={novaSenha}
                onChange={(e) =>
                  setNovaSenha(e.target.value)
                }
                placeholder="••••••••"
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
                  transform:
                    "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  fontSize: 14
                }}
              >
                {mostrarSenha
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>
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

          {sucesso && (
            <p
              style={{
                color: cores.verdeOk,
                fontSize: 13
              }}
            >
              {sucesso}
            </p>
          )}

          <BotaoPrincipal
            onClick={() => {}}
            full
          >
            <button
              type="submit"
              disabled={salvando}
              style={{
                all: "unset",
                width: "100%",
                textAlign: "center"
              }}
            >
              {salvando
                ? "Salvando..."
                : "Salvar alterações"}
            </button>
          </BotaoPrincipal>
        </form>

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid ${cores.linha}`,
            textAlign: "center"
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: cores.tintaSuave,
              marginBottom: 10
            }}
          >
            Excluir sua conta é uma ação permanente.
          </p>

          <button
            onClick={excluirConta}
            disabled={excluindo}
            style={{
              background: "none",
              border: `1px solid ${cores.carimbo}`,
              color: cores.carimbo,
              borderRadius: 5,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {excluindo
              ? "Excluindo..."
              : "Excluir minha conta"}
          </button>
        </div>
      </div>
    </div>
  );
}