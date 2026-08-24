import React, { useState } from "react";
import { cores, fontUI } from "./styles/tema";
import { LIVROS_INICIAIS, LEITORES_INICIAIS, EMPRESTIMOS_INICIAIS } from "./data/dadosIniciais";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import Livros from "./components/livros/Livros";
import Leitores from "./components/leitores/Leitores";
import Emprestimos from "./components/emprestimos/Emprestimos";

export default function BibliotecaDigital() {
  const [aba, setAba] = useState("dashboard");

  const [livros, setLivros] = useState(LIVROS_INICIAIS);
  const [leitores, setLeitores] = useState(LEITORES_INICIAIS);
  const [emprestimos, setEmprestimos] = useState(EMPRESTIMOS_INICIAIS);

  return (
    <div style={{ display: "flex", minHeight: 600, background: cores.fundo, fontFamily: fontUI, borderRadius: 12, overflow: "hidden", border: `1px solid ${cores.linha}` }}>
      <Sidebar aba={aba} setAba={setAba} />
      <div style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>
        {aba === "dashboard" && <Dashboard livros={livros} leitores={leitores} emprestimos={emprestimos} />}
        {aba === "livros" && <Livros livros={livros} setLivros={setLivros} />}
        {aba === "leitores" && <Leitores leitores={leitores} setLeitores={setLeitores} />}
        {aba === "emprestimos" && (
          <Emprestimos
            livros={livros} setLivros={setLivros}
            leitores={leitores}
            emprestimos={emprestimos} setEmprestimos={setEmprestimos}
          />
        )}
      </div>
    </div>
  );
}