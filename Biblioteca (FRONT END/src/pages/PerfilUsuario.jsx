
import React, { useRef, useState } from "react";
import api from "../services/api";
import { cores, fontUI, inputStyle } from "../empréstimos/styles/tema";
import { AVATARES } from "../avatares";
import Cabecalho from "../components/comum/Cabecalho";
import Campo from "../components/comum/Campo";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";
import Avatar from "../components/comum/Avatar";
import { Eye, EyeOff, UserRound } from "lucide-react";

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

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.com$/i.test(email.trim());
}

function mensagemErro(error, mensagemPadrao) {
  const resposta = error.response?.data;

  const mensagem =
    resposta?.error ||
    resposta?.message ||
    resposta?.erro ||
    resposta?.Dados ||
    (typeof resposta === "string" ? resposta : null) ||
    error.message ||
    mensagemPadrao;

  console.error("[PerfilUsuario] Erro na requisição:", {
    mensagem,
    status: error.response?.status,
    resposta: error.response?.data,
    url: error.config?.url,
    metodo: error.config?.method,
  });

  return mensagem;
}

export default function PerfilUsuario({
  usuario,
  onAtualizar,
  onExcluido,
}) {
  const idUsuario = usuario?.id_usuarios || usuario?.id;

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

  const salvar = async (e) => {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!nome.trim() || !email.trim()) {
      setErro("Preencha nome e e-mail.");
      return;
    }

    if (!validarEmail(email)) {
      setErro("Informe um e-mail válido, contendo @ e terminando em .com.");
      return;
    }

    if (!idUsuario) {
      setErro("ID do usuário não encontrado.");
      return;
    }

    const dados = {
      nome: nome.trim(),
      email: email.trim(),
      avatar,
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
        resposta.data?.usuario || resposta.data;

      const usuarioAtualizado = {
        ...usuario,
        ...dados,
        ...(usuarioResposta || {}),
        avatar: usuarioResposta?.avatar ?? avatar,
      };

      onAtualizar?.(usuarioAtualizado);

      setNome(usuarioAtualizado.nome || "");
      setEmail(usuarioAtualizado.email || "");
      setAvatar(usuarioAtualizado.avatar || "avatar_1");
      setNovaSenha("");
      setSucesso("Perfil atualizado com sucesso!");
    } catch (error) {
      setErro(
        mensagemErro(error, "Não foi possível salvar as alterações.")
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

    if (!arquivo) return;

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setErro("Formato não permitido. Use JPG, PNG ou WEBP.");
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

    const formData = new FormData();
    formData.append("avatar", arquivo);
    formData.append("id_usuarios", String(idUsuario));

    try {
      const resposta = await api.post(
        "/MeuPerfil/Avatar",
        formData
      );

      const novoAvatar = extrairAvatarDaResposta(
        resposta.data,
        avatar
      );

      setAvatar(novoAvatar);

      onAtualizar?.({
        ...usuario,
        avatar: novoAvatar,
      });

      setSucesso("Foto atualizada com sucesso!");
    } catch (error) {
      setErro(
        mensagemErro(error, "Não foi possível enviar a foto.")
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

      onAtualizar?.({
        ...usuario,
        avatar: "avatar_1",
      });

      setSucesso("Foto removida.");
    } catch (error) {
      setErro(
        mensagemErro(error, "Não foi possível remover a foto.")
      );
    }
  };

  const excluirConta = async () => {
    const confirmar = window.confirm(
      "Tem certeza que deseja desativar sua conta? Você será desconectado e precisará entrar novamente para acessar o sistema."
    );

    if (!confirmar) return;

    if (!idUsuario) {
      setErro("ID do usuário não encontrado.");
      return;
    }

    setExcluindo(true);
    setErro("");
    setSucesso("");

    try {
      await api.delete(
        `/MeuPerfil/DesativarConta/${idUsuario}`
      );

      setSucesso("Conta desativada. Encerrando sua sessão...");

      // O componente pai deve limpar a sessão e redirecionar ao login.
      if (typeof onExcluido === "function") {
        onExcluido();
      } else {
        setErro(
          "A conta foi desativada, mas o componente pai não forneceu a função de logout."
        );
        setExcluindo(false);
      }
    } catch (error) {
      setErro(
        mensagemErro(error, "Não foi possível desativar a conta.")
      );
      setExcluindo(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        fontFamily: fontUI,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Cabecalho
          titulo="Meu perfil"
          subtitulo="Edite seus dados ou desative sua conta"
        />

        <form
          onSubmit={salvar}
          style={{
            background: cores.papel,
            border: `1px solid ${cores.linha}`,
            borderRadius: 6,
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                border: `2px solid ${cores.latao}`,
                borderRadius: "50%",
              }}
            >
              <Avatar avatar={avatar} tamanho={72} />
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 12,
                marginTop: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setSeletorAberto((v) => !v)}
                style={estiloLink(cores.latao)}
              >
                {seletorAberto ? "Fechar avatares" : "Escolher avatar"}
              </button>

              <button
                type="button"
                onClick={escolherArquivo}
                disabled={enviandoFoto}
                style={estiloLink(cores.latao)}
              >
                {enviandoFoto ? "Enviando..." : "Enviar foto"}
              </button>

              {fotoEhPersonalizada && (
                <button
                  type="button"
                  onClick={removerFoto}
                  style={estiloLink(cores.carimbo)}
                >
                  Remover foto
                </button>
              )}
            </div>

            <input
              ref={inputArquivoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={enviarFoto}
              style={{ display: "none" }}
            />

            {seletorAberto && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 8,
                  marginTop: 14,
                  padding: 12,
                  background: cores.fundo,
                  borderRadius: 6,
                  border: `1px solid ${cores.linha}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAvatar(null);
                    setSeletorAberto(false);
                  }}
                  title="Sem foto"
                  aria-label="Ficar sem foto de perfil"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: avatar == null
                      ? `2px solid ${cores.latao}`
                      : "2px solid transparent",
                    background: cores.papel,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <UserRound size={20} color="#6B7280" />
                </button>

                {AVATARES.map((a) => (
                  <button
                    key={a.codigo}
                    type="button"
                    onClick={() => {
                      setAvatar(a.codigo);
                      setSeletorAberto(false);
                    }}
                    title={a.codigo}
                    aria-label={`Selecionar ${a.codigo}`}
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
                      overflow: "hidden",
                    }}
                  >
                    {a.imagem ? (
                      <img
                        src={a.imagem}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : a.emoji ? (
                      a.emoji
                    ) : (
                      <UserRound size={20} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Campo label="Nome">
            <input
              style={inputStyle}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </Campo>

          <Campo label="E-mail">
            <input
              type="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Campo>

          <Campo label="Nova senha (deixe em branco para não alterar)">
            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                style={{
                  ...inputStyle,
                  paddingRight: 38,
                }}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Deixe em branco para manter a senha"
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Campo>

          {erro && (
            <p
              role="alert"
              style={{
                color: cores.carimbo,
                fontSize: 13,
                overflowWrap: "anywhere",
              }}
            >
              {erro}
            </p>
          )}

          {sucesso && (
            <p
              role="status"
              style={{
                color: cores.verdeOk,
                fontSize: 13,
              }}
            >
              {sucesso}
            </p>
          )}

          <BotaoPrincipal type="submit" disabled={salvando} full>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </BotaoPrincipal>
        </form>

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid ${cores.linha}`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: cores.tintaSuave,
              marginBottom: 10,
            }}
          >
            Ao desativar sua conta, você será desconectado do sistema.
          </p>

          <button
            type="button"
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
              cursor: excluindo ? "wait" : "pointer",
            }}
          >
            {excluindo ? "Desativando..." : "Desativar minha conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

function estiloLink(cor) {
  return {
    fontSize: 12,
    color: cor,
    cursor: "pointer",
    fontWeight: 600,
    border: "none",
    padding: 0,
    background: "none",
  };
}
