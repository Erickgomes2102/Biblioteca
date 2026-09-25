import React, { useState } from "react";
import api from "../services/api";
import { cores, fontDisplay, fontUI, inputStyle } from "../empréstimos/styles/tema";
import Cabecalho from "../components/comum/Cabecalho";
import Campo from "../components/comum/Campo";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";

const AVATARES = [
  { codigo: "avatar_1", emoji: "🐱" },
  { codigo: "avatar_2", emoji: "🐶" },
  { codigo: "avatar_3", emoji: "🦊" },
  { codigo: "avatar_4", emoji: "🐼" },
  { codigo: "avatar_5", emoji: "🦉" },
  { codigo: "avatar_6", emoji: "🐧" },
  { codigo: "avatar_7", emoji: "🦁" },
  { codigo: "avatar_8", emoji: "🐸" },
  { codigo: "avatar_9", emoji: "📚" },
  { codigo: "avatar_10", emoji: "🎓" },
  { codigo: "avatar_11", emoji: "🧑‍💻" },
  { codigo: "avatar_12", emoji: "🧑‍🏫" },
];

function emojiDoAvatar(codigo) {
  return AVATARES.find((a) => a.codigo === codigo)?.emoji || "👤";
}

export default function PerfilUsuario({ usuario, onAtualizar, onExcluido }) {
  const [nome, setNome] = useState(usuario?.nome || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [avatar, setAvatar] = useState(usuario?.avatar || "avatar_1");
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [seletorAberto, setSeletorAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const salvar = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!nome.trim() || !email.trim()) {
      setErro("Preencha nome e e-mail.");
      return;
    }

    const dados = { nome: nome.trim(), email: email.trim(), avatar };
    if (novaSenha.trim()) {
      dados.senha = novaSenha;
    }

    setSalvando(true);
    try {
      const resposta = await api.put(`/EditarUsuario/${usuario.id}`, dados);
      const usuarioAtualizado = resposta.data?.usuario || { ...usuario, ...dados };
      onAtualizar(usuarioAtualizado);
      setNovaSenha("");
      setSucesso("Perfil atualizado com sucesso!");
    } catch (error) {
      console.log(error.response?.data || error.message);
      setErro(error.response?.data?.error || error.response?.data?.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirConta = async () => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
    );
    if (!confirmar) return;

    setExcluindo(true);
    try {
      await api.delete(`/ExcluirUsuario/${usuario.id}`);
      onExcluido();
    } catch (error) {
      console.log(error.response?.data || error.message);
      setErro(error.response?.data?.error || error.response?.data?.message || "Não foi possível excluir a conta.");
      setExcluindo(false);
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <Cabecalho titulo="Meu perfil" subtitulo="Edite seus dados ou exclua sua conta" />

      <form onSubmit={salvar} style={{ background: cores.papel, border: `1px solid ${cores.linha}`, borderRadius: 6, padding: "20px 22px" }}>

        {/* AVATAR */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setSeletorAberto((v) => !v)}
            title="Trocar avatar"
            style={{
              width: 72, height: 72, borderRadius: "50%", border: `2px solid ${cores.latao}`,
              background: cores.lataoClaro, fontSize: 34, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}
          >
            {emojiDoAvatar(avatar)}
          </button>
          <span
            onClick={() => setSeletorAberto((v) => !v)}
            style={{ fontSize: 12, color: cores.latao, cursor: "pointer", marginTop: 6, fontWeight: 600 }}
          >
            {seletorAberto ? "Fechar" : "Trocar avatar"}
          </span>

          {seletorAberto && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginTop: 14,
              padding: 12, background: cores.fundo, borderRadius: 6, border: `1px solid ${cores.linha}`,
            }}>
              {AVATARES.map((a) => (
                <button
                  key={a.codigo}
                  type="button"
                  onClick={() => { setAvatar(a.codigo); setSeletorAberto(false); }}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", fontSize: 18,
                    border: avatar === a.codigo ? `2px solid ${cores.latao}` : "2px solid transparent",
                    background: cores.papel, cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
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
          <input style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} />
        </Campo>

        <Campo label="E-mail">
          <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>

        <Campo label="Nova senha (deixe em branco para não alterar)">
          <div style={{ position: "relative" }}>
            <input
              type={mostrarSenha ? "text" : "password"}
              style={{ ...inputStyle, paddingRight: 38 }}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              tabIndex={-1}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4, fontSize: 14,
              }}
            >
              {mostrarSenha ? "🙈" : "👁️"}
            </button>
          </div>
        </Campo>

        {erro && <p style={{ color: cores.carimbo, fontSize: 13 }}>{erro}</p>}
        {sucesso && <p style={{ color: cores.verdeOk, fontSize: 13 }}>{sucesso}</p>}

        <BotaoPrincipal onClick={() => {}} full>
          <button type="submit" disabled={salvando} style={{ all: "unset", width: "100%", textAlign: "center" }}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </BotaoPrincipal>
      </form>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${cores.linha}` }}>
        <p style={{ fontSize: 13, color: cores.tintaSuave, marginBottom: 10 }}>
          Excluir sua conta é uma ação permanente.
        </p>
        <button
          onClick={excluirConta}
          disabled={excluindo}
          style={{
            background: "none", border: `1px solid ${cores.carimbo}`, color: cores.carimbo,
            borderRadius: 5, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          {excluindo ? "Excluindo..." : "Excluir minha conta"}
        </button>
      </div>
    </div>
  );
}