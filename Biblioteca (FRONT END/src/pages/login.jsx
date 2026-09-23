import React, {useState} from "react";

import api from "../services/api";

export default function Login({ onLogin }) {

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");

    const [criando, setCriando] = useState(false);

    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("");


    const login = async () => {

        try {

            setErro("");

            const resposta = await api.post("/login", {
                email,
                senha
            });

            const token = resposta.data.token;

            localStorage.setItem("token", token);

            onLogin();

        } catch (err) {

            console.log(
                err.response?.data || err.message
            );

            setErro(
                err.response?.data?.error ||
                "E-mail ou senha inválidos"
            );
        }
    };


    const cadastrar = async () => {

        try {

            setErro("");

            await api.post("/CadastrarUsuario", {
                nome,
                email,
                senha,
                tipo
            });

            setCriando(false);

            setNome("");
            setEmail("");
            setSenha("");
            setTipo("");

        } catch (err) {

            console.log(
                err.response?.data || err.message
            );

            setErro(
                err.response?.data?.error ||
                "Erro ao criar usuário"
            );
        }
    };


    if (criando) {

        return (
            <div className="login-box">

                <div className="login-logo">
                    📚
                </div>

                <h1 className="login-titulo">
                    Criar usuário
                </h1>

                <p className="login-subtitulo">
                    Cadastre uma nova conta para acessar a biblioteca.
                </p>


                <div className="login-campo">

                    <label>
                        Nome
                    </label>

                    <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Nome completo"
                        type="text"
                    />

                </div>


                <div className="login-campo">

                    <label>
                        E-mail
                    </label>

                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        type="email"
                    />

                </div>


                <div className="login-campo">

                    <label>
                        Senha
                    </label>

                    <input
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Digite sua senha"
                        type="password"
                    />

                </div>


                <div className="login-campo">

                    <label>
                        Tipo de usuário
                    </label>

                    <input
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        placeholder="Ex: Administrador"
                        type="text"
                    />

                </div>


                {erro && (
                    <p className="login-erro">
                        {erro}
                    </p>
                )}


                <button
                    className="login-botao"
                    onClick={cadastrar}
                >
                    Criar usuário
                </button>


                <button
                    className="login-voltar"
                    onClick={() => {
                        setCriando(false);
                        setErro("");
                    }}
                >
                    Voltar para login
                </button>

            </div>
        );
    }


    return (

        <div className="login-box">

            <div className="login-logo">
                📚
            </div>


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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    type="email"
                />

            </div>


            <div className="login-campo">

                <label>
                    Senha
                </label>

                <input
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    type="password"
                />

            </div>


            {erro && (
                <p className="login-erro">
                    {erro}
                </p>
            )}


            <button
                className="login-botao"
                onClick={login}
            >
                Entrar
            </button>


            <div className="login-divisor">
                <span>ou</span>
            </div>


            <button
                className="login-secundario"
                onClick={() => {
                    setCriando(true);
                    setErro("");
                }}
            >
                Criar usuário
            </button>

        </div>
    );
}