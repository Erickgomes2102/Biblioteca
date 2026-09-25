import React, { useState } from "react";
import {
  BookOpen,
  Users,
  Repeat,
  LayoutDashboard,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
  UserCog,
  UserX
} from "lucide-react";

import { cores, fontDisplay } from "../empréstimos/styles/tema";

const ITENS = [
  { id: "dashboard", label: "Painel", icone: LayoutDashboard },
  { id: "livros", label: "Livros", icone: BookOpen },
  { id: "leitores", label: "Leitores", icone: Users },
  { id: "emprestimos", label: "Empréstimos", icone: Repeat },
];

export default function Sidebar({
  aba,
  setAba,
  onLogout,
  onExcluirConta
}) {
  const [configAberta, setConfigAberta] = useState(false);

  return (
    <div
      style={{
        width: 210,
        background: cores.tinta,
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }}
    >

      {/* LOGO */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 20px 22px",
          borderBottom: "1px solid #3B4C3B"
        }}
      >
        <BookOpen size={20} color={cores.latao} />
        <span style={{ fontFamily: fontDisplay, color: "#fff", fontSize: 16, fontWeight: 600 }}>
          Biblioteca
        </span>
      </div>


      {/* MENU */}

      <div style={{ flex: 1, padding: "16px 10px" }}>

        {ITENS.map((it) => {
          const Icone = it.icone;
          const ativo = aba === it.id;

          return (
            <button
              key={it.id}
              type="button"
              onClick={() => setAba(it.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
                marginBottom: 4, background: ativo ? "#3B4C3B" : "transparent", border: "none",
                borderLeft: ativo ? `3px solid ${cores.latao}` : "3px solid transparent",
                borderRadius: 3, color: ativo ? "#fff" : "#B9C4B4", fontSize: 13.5, cursor: "pointer",
                fontWeight: ativo ? 600 : 500, textAlign: "left",
              }}
            >
              <Icone size={16} />
              {it.label}
            </button>
          );
        })}

      </div>


      {/* CONFIGURAÇÕES + SAIR */}

      <div style={{ padding: "12px 10px", borderTop: "1px solid #3B4C3B" }}>

        <button
          type="button"
          onClick={() => setConfigAberta((v) => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
            padding: "10px 12px", background: "transparent", border: "none", borderRadius: 3,
            color: "#B9C4B4", fontSize: 13.5, fontWeight: 500, textAlign: "left", cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Settings size={16} />
            Configurações
          </span>
          {configAberta ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {configAberta && (
          <div style={{ paddingLeft: 8, marginTop: 2 }}>
            <button
              type="button"
              onClick={() => setAba("perfil")}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px",
                background: aba === "perfil" ? "#3B4C3B" : "transparent", border: "none", borderRadius: 3,
                color: aba === "perfil" ? "#fff" : "#9BA79A", fontSize: 12.5, cursor: "pointer", textAlign: "left",
              }}
            >
              <UserCog size={14} />
              Editar perfil
            </button>

            <button
              type="button"
              onClick={onExcluirConta}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px",
                background: "transparent", border: "none", borderRadius: 3,
                color: "#D18B7D", fontSize: 12.5, cursor: "pointer", textAlign: "left",
              }}
            >
              <UserX size={14} />
              Excluir usuário
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
            background: "transparent", border: "none", borderRadius: 3, color: "#B9C4B4",
            fontSize: 13.5, fontWeight: 500, textAlign: "left", cursor: "pointer", marginTop: 4,
          }}
        >
          <LogOut size={16} />
          Sair
        </button>

      </div>

    </div>
  );
}