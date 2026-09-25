import React, { useState } from "react";
import api from "../services/api";

export default function Login({ onLogin }) {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [nome, setNome] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");

  const [erro, setErro] = useState("");
  const [criando, setCriando] = useState(false);

  async function entrar() {

    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    try {

      const resposta = await api.post("/login", {
        email: email.trim(),
        senha
      });

      localStorage.setItem(
        "token",
        resposta.data.token
      );

      onLogin();

    } catch (error) {

      console.log(
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "E-mail ou senha incorretos."
      );

    }
  }

  async function criarUsuario() {

    setErro("");

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha.trim() ||
      !senhaConfirmacao.trim()
    ) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (senha !== senhaConfirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {

      await api.post("/CadastrarUsuario", {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        tipo: "BIBLIOTECÁRIO"
        
      });

      setCriando(false);

      setNome("");
      setSenhaConfirmacao("");

      setSenha("");

      setErro("Usuário criado com sucesso. Faça login.");

    } catch (error) {

      console.log(
        error.response?.data || error.message
      );

      setErro(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Não foi possível criar o usuário."
      );

    }
  }

  return (

    <div className="login-overlay">

      <div className="login-box">

        <div className="login-logo">
          📚
        </div>

        {!criando ? (

          <>
            <h1 className="login-titulo">
              Biblioteca
            </h1>

            <p className="login-subtitulo">
              Entre para acessar o sistema.
            </p>

            <div className="login-campo">

              <label>
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
              />

            </div>

            <div className="login-campo">

              <label>
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    entrar();
                  }
                }}
              />

            </div>

            {erro && (
              <div className="login-erro">
                {erro}
              </div>
            )}

            <button
              type="button"
              className="login-botao"
              onClick={entrar}
            >
              Entrar
            </button>

            <div className="login-divisor">
              <span>ou</span>
            </div>

            <button
              type="button"
              className="login-secundario"
              onClick={() => {
                setErro("");
                setCriando(true);
              }}
            >
              Criar usuário
            </button>

          </>

        ) : (

          <>
            <h1 className="login-titulo">
              Criar usuário
            </h1>

            <p className="login-subtitulo">
              Cadastre uma conta para acessar a biblioteca.
            </p>

            <div className="login-campo">

              <label>
                Nome
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
              />

            </div>

            <div className="login-campo">

              <label>
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
              />

            </div>

            <div className="login-campo">

              <label>
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Crie uma senha"
                autoComplete="new-password"
              />

            </div>

            <div className="login-campo">

              <label>
                Confirmar senha
              </label>

              <input
                type="password"
                value={senhaConfirmacao}
                onChange={(e) =>
                  setSenhaConfirmacao(e.target.value)
                }
                placeholder="Repita sua senha"
                autoComplete="new-password"
              />

            </div>

            {erro && (
              <div className="login-erro">
                {erro}
              </div>
            )}

            <button
              type="button"
              className="login-botao"
              onClick={criarUsuario}
            >
              Criar conta
            </button>

            <button
              type="button"
              className="login-voltar"
              onClick={() => {
                setErro("");
                setCriando(false);
              }}
            >
              ← Voltar para login
            </button>

          </>

        )}

      </div>

    </div>

  );
}