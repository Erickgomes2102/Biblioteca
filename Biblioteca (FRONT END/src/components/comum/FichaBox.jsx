import React from "react";
import { cores, fontDisplay } from "../../empréstimos/styles/tema";

export default function FichaBox({ titulo, children, acao }) {
  return (
    <div style={{
      background: cores.papel, border: `1px solid ${cores.linha}`, borderTop: `3px dashed ${cores.latao}`,
      borderRadius: 6, padding: "18px 20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontFamily: fontDisplay, fontSize: 16, color: cores.tinta, margin: 0, fontWeight: 600 }}>{titulo}</h3>
        {acao}
      </div>
      {children}
    </div>
  );
}