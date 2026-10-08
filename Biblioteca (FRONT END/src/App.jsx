import React, { useEffect, useState } from "react";
import api from "./services/api";
import { cores, fontUI } from "./empréstimos/styles/tema";
import Login from "./pages/login";
import PerfilUsuario from "./pages/PerfilUsuario";
import Administracao from "./Administracao";
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
          respostaCategorias
        ] = await Promise.all([

          api.get("/ListarLivros"),
          api.get("/ListarLeitores"),
          api.get("/ListarEmprestimo"),
          api.get("/ListarCategorias")

        ]);

        setLivros(respostaLivros.data);
        setLeitores(respostaLeitores.data);
        setEmprestimos(respostaEmprestimos.data);
        setCategorias(respostaCategorias.data);


        /*
         * USUÁRIOS
         *
         * Essa rota é exclusiva para Administradores.
         * Bibliotecários não fazem essa requisição.
         */

        if (usuarioLogado?.tipo === "ADMINISTRADOR") {

          try {

            const respostaUsuarios =
              await api.get("/Administracao/Usuarios");

            setUsuarios(respostaUsuarios.data);

          } catch (error) {

            console.log(
              error.response?.data ||
              error.message
            );

          }

        } else {

          setUsuarios([]);

        }

      } catch (error) {

        console.log(
          error.response?.data ||
          error.message
        );

      }

    };

    carregarDados();

  }, [logado, usuarioLogado]);


  function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setLogado(false);
    setUsuarioLogado(null);
    setAba("dashboard");

  }


  function atualizarUsuarioLogado(novoUsuario) {

    setUsuarioLogado(novoUsuario);

    localStorage.setItem(
      "usuario",
      JSON.stringify(novoUsuario)
    );

  }


  async function excluirContaLogada() {

    const confirmar = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
    );

    if (!confirmar || !usuarioLogado) {
      return;
    }

    try {

      await api.delete(
        `/ExcluirUsuario/${usuarioLogado.id}`
      );

      logout();

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Não foi possível excluir a conta."
      );

    }

  }


  /*
   * Impede que a aba de Administração
   * fique acessível para Bibliotecários,
   * mesmo que o estado da aba seja alterado.
   */

  useEffect(() => {

    if (
      aba === "administracao" &&
      usuarioLogado?.tipo !== "ADMINISTRADOR"
    ) {

      setAba("dashboard");

    }

  }, [aba, usuarioLogado]);


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

          {/* DASHBOARD */}

          {aba === "dashboard" && (

            <Dashboard
              livros={livros}
              leitores={leitores}
              emprestimos={emprestimos}
            />

          )}


          {/* LIVROS */}

          {aba === "livros" && (

            <Livros
              livros={livros}
              setLivros={setLivros}
              categorias={categorias}
            />

          )}


          {/* LEITORES */}

          {aba === "leitores" && (

            <Leitores
              leitores={leitores}
              setLeitores={setLeitores}
              usuarios={usuarios}
            />

          )}


          {/* EMPRÉSTIMOS */}

          {aba === "emprestimos" && (

            <Emprestimos
              livros={livros}
              setLivros={setLivros}
              leitores={leitores}
              emprestimos={emprestimos}
              setEmprestimos={setEmprestimos}
              usuarios={usuarios}
              usuarioLogado={usuarioLogado}
            />

          )}


          {/* PERFIL */}

          {aba === "perfil" && usuarioLogado && (

            <PerfilUsuario
              usuario={usuarioLogado}
              onAtualizar={atualizarUsuarioLogado}
              onExcluido={logout}
            />

          )}


          {/* ADMINISTRAÇÃO */}

          {aba === "administracao" &&
            usuarioLogado?.tipo === "ADMINISTRADOR" && (

            <Administracao
              usuarioLogado={usuarioLogado}
              usuarios={usuarios}
              setUsuarios={setUsuarios}
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