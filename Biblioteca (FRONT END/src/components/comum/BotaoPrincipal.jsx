import React from "react";
import { cores } from "../../styles/tema";

export default function BotaoPrincipal({ children, onClick, full }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      background: cores.tinta, color: "#fff", border: "none", borderRadius: 5,
      padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
      width: full ? "100%" : "auto", marginTop: full ? 6 : 0,
    }}>
      {children}
    </button>
  );
}