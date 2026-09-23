import React from "react";
import { BookOpen, Users, Repeat, LayoutDashboard } from "lucide-react";
import { cores, fontDisplay } from "../empréstimos/styles/tema"

const ITENS = [
  { id: "dashboard", label: "Painel", icone: LayoutDashboard },
  { id: "livros", label: "Livros", icone: BookOpen },
  { id: "leitores", label: "Leitores", icone: Users },
  { id: "emprestimos", label: "Empréstimos", icone: Repeat },
];

export default function Sidebar({ aba, setAba, logout }) {

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

      {/* CABEÇALHO */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 20px 22px",
          borderBottom: "1px solid #3B4C3B"
        }}
      >

        <BookOpen
          size={20}
          color={cores.latao}
        />

        <span
          style={{
            fontFamily: fontDisplay,
            color: "#fff",
            fontSize: 16,
            fontWeight: 600
          }}
        >
          Biblioteca
        </span>

      </div>


      {/* MENU */}

      <div
        style={{
          flex: 1,
          padding: "16px 10px"
        }}
      >

        {ITENS.map((it) => {

          const Icone = it.icone;
          const ativo = aba === it.id;

          return (

            <button
              key={it.id}
              onClick={() => setAba(it.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 12px",
                marginBottom: 4,
                background: ativo
                  ? "#3B4C3B"
                  : "transparent",
                border: "none",
                borderLeft: ativo
                  ? `3px solid ${cores.latao}`
                  : "3px solid transparent",
                borderRadius: 3,
                color: ativo
                  ? "#fff"
                  : "#B9C4B4",
                fontSize: 13.5,
                cursor: "pointer",
                fontWeight: ativo
                  ? 600
                  : 500,
                textAlign: "left",
              }}
            >

              <Icone size={16} />

              {it.label}

            </button>

          );

        })}

      </div>


      {/* LOGOUT */}

      <div
        style={{
          padding: "12px 10px 0",
          borderTop: "1px solid #3B4C3B"
        }}
      >

        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "10px 15px",
            background: "transparent",
            border: "none",
            borderRadius: 3,
            color: "#B9C4B4",
            fontSize: 13.5,
            cursor: "pointer",
            textAlign: "left",
          }}
        >

          Sair

        </button>

      </div>

    </div>

  );

}