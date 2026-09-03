import React from "react";
import { cores, fontDisplay } from "../../styles/tema";

export default function Cabecalho({ titulo, subtitulo, acao }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
      <div>
        <h2 style={{ fontFamily: fontDisplay, fontSize: 24, color: cores.tinta, margin: 0, fontWeight: 600 }}>{titulo}</h2>
        <p style={{ color: cores.tintaSuave, fontSize: 13, margin: "4px 0 0" }}>{subtitulo}</p>
      </div>
      {acao}
    </div>
  );
}