import React, { useEffect, useState } from "react";
import api from "./services/api";
import { cores, fontUI } from "./empréstimos/styles/tema";
import Login from "./pages/login";
import PerfilUsuario from "./pages/PerfilUsuario";
import Sidebar from "./layout/Sidebar";
import Dashboard from "./dashboard/Dashboard";
import Livros from "./livros/Livros";
import Leitores from "./leitores/Leitores";
import Emprestimos from "./emprestimos/Emprestimos";

export default function App() {

  const [logado, setLogado] = useState(
    !!localStorage.getItem("token")
  );

  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  const [aba, setAba] = useState("dashboard");

  const [livros, setLivros] = useState([]);
  const [leitores, setLeitores] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {

    if (!logado) {
      return;
    }

    const carregarDados = async () => {

      try {

        const [
          respostaLivros,
          respostaLeitores,
          respostaEmprestimos,
          respostaCategorias,
          respostaUsuarios
        ] = await Promise.all([

          api.get("/ListarLivros"),
          api.get("/ListarLeitores"),
          api.get("/ListarEmprestimo"),
          api.get("/ListarCategorias"),
          api.get("/ListarUsuarios")

        ]);

        setLivros(respostaLivros.data);
        setLeitores(respostaLeitores.data);
        setEmprestimos(respostaEmprestimos.data);
        setCategorias(respostaCategorias.data);
        setUsuarios(respostaUsuarios.data);

      } catch (error) {

        console.log(
          error.response?.data || error.message
        );

      }

    };

    carregarDados();

  }, [logado]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setLogado(false);
    setUsuarioLogado(null);
    setAba("dashboard");
  }

  function atualizarUsuarioLogado(novoUsuario) {
    setUsuarioLogado(novoUsuario);
    localStorage.setItem("usuario", JSON.stringify(novoUsuario));
  }

  async function excluirContaLogada() {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
    );
    if (!confirmar || !usuarioLogado) return;

    try {
      await api.delete(`/ExcluirUsuario/${usuarioLogado.id}`);
      logout();
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Não foi possível excluir a conta."
      );
    }
  }

  return (

    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: cores.fundo,
        fontFamily: fontUI
      }}
    >

      {/* SISTEMA */}

      <div
        className={!logado ? "sistema-bloqueado" : ""}
        style={{
          display: "flex",
          width: "100%",
          height: "100vh",
          background: cores.fundo
        }}
      >

        <Sidebar
          aba={aba}
          setAba={setAba}
          onLogout={logout}
          usuario={usuarioLogado}
        />

        <main
          style={{
            flex: 1,
            minWidth: 0,
            height: "100vh",
            padding: "40px 48px",
            overflowY: "auto",
            overflowX: "hidden"
          }}
        >

          {aba === "dashboard" && (
            <Dashboard
              livros={livros}
              leitores={leitores}
              emprestimos={emprestimos}
            />
          )}

          {aba === "livros" && (
            <Livros
              livros={livros}
              setLivros={setLivros}
              categorias={categorias}
            />
          )}

          {aba === "leitores" && (
            <Leitores
              leitores={leitores}
              setLeitores={setLeitores}
              usuarios={usuarios}
            />
          )}

          {aba === "emprestimos" && (
            <Emprestimos
              livros={livros}
              setLivros={setLivros}
              leitores={leitores}
              emprestimos={emprestimos}
              setEmprestimos={setEmprestimos}
              usuarios={usuarios}
            />
          )}

          {aba === "perfil" && usuarioLogado && (
            <PerfilUsuario
              usuario={usuarioLogado}
              onAtualizar={atualizarUsuarioLogado}
              onExcluido={logout}
            />
          )}

        </main>

      </div>

      {/* LOGIN */}

      {!logado && (
        <Login
          onLogin={(usuario) => {
            setUsuarioLogado(usuario);
            setLogado(true);
          }}
        />
      )}

    </div>
  );
}