import React from "react";
import {
  BookOpen,
  Users,
  Repeat,
  LayoutDashboard,
  LogOut,
  UserCog,
  Shield
} from "lucide-react";

import { cores, fontDisplay } from "../empréstimos/styles/tema";
import Avatar from "../components/comum/Avatar";

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
  usuario
}) {

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
          LibrarySys
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
              type="button"
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
                textAlign: "left"
              }}
            >

              <Icone size={16} />

              {it.label}

            </button>
          );

        })}


        {/* ADMINISTRAÇÃO */}

        {usuario?.tipo === "ADMINISTRADOR" && (

          <button
            type="button"
            onClick={() => setAba("administracao")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 12px",
              marginBottom: 4,
              background:
                aba === "administracao"
                  ? "#3B4C3B"
                  : "transparent",
              border: "none",
              borderLeft:
                aba === "administracao"
                  ? `3px solid ${cores.latao}`
                  : "3px solid transparent",
              borderRadius: 3,
              color:
                aba === "administracao"
                  ? "#fff"
                  : "#B9C4B4",
              fontSize: 13.5,
              cursor: "pointer",
              fontWeight:
                aba === "administracao"
                  ? 600
                  : 500,
              textAlign: "left"
            }}
          >

            <Shield size={16} />

            Administração

          </button>

        )}

      </div>


      {/* PERFIL */}

      <div
        style={{
          padding: "14px 10px",
          borderTop: "1px solid #3B4C3B"
        }}
      >

        <button
          type="button"
          onClick={() => setAba("perfil")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 10px",
            background:
              aba === "perfil"
                ? "#3B4C3B"
                : "transparent",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            textAlign: "left"
          }}
        >

          <Avatar
            avatar={usuario?.avatar}
            tamanho={38}
          />

          <div
            style={{
              minWidth: 0,
              flex: 1
            }}
          >

            <div
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {usuario?.nome || "Usuário"}
            </div>

            <div
              style={{
                color: "#9BA79A",
                fontSize: 11,
                marginTop: 2
              }}
            >
              Editar perfil
            </div>

          </div>

          <UserCog
            size={15}
            color="#9BA79A"
          />

        </button>


        {/* SAIR */}

        <button
          type="button"
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 12px",
            background: "transparent",
            border: "none",
            borderRadius: 3,
            color: "#B9C4B4",
            fontSize: 13.5,
            fontWeight: 500,
            textAlign: "left",
            cursor: "pointer",
            marginTop: 4
          }}
        >

          <LogOut size={16} />

          Sair

        </button>

      </div>

    </div>
  );
}