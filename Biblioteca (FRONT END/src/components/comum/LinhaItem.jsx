import React from "react";
import { cores } from "../../styles/tema";

export default function LinhaItem({ titulo, sub, selo, acao }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: `1px solid ${cores.linha}`,
    }}>
      <div>
        <div style={{ fontSize: 13.5, color: cores.tinta, fontWeight: 600 }}>{titulo}</div>
        <div style={{ fontSize: 12, color: cores.tintaSuave, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {selo}
        {acao}
      </div>
    </div>
  );
}