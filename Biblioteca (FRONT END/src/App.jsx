import React, { useEffect, useState } from "react";
import api from "./services/api";
import { cores, fontUI } from "./empréstimos/styles/tema";
import Login from "./pages/login";
import Sidebar from "./layout/Sidebar";
import Dashboard from "./dashboard/Dashboard";
import Livros from "./livros/Livros";
import Leitores from "./leitores/Leitores";
import Emprestimos from "./emprestimos/Emprestimos";

export default function App() {

  const [logado, setLogado] = useState(
    !!localStorage.getItem("token")
  );

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

    setLogado(false);

    setAba("dashboard");

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

        </main>

      </div>

      {/* LOGIN */}

      {!logado && (
        <Login
          onLogin={() => setLogado(true)}
        />
      )}

    </div>
  );
}