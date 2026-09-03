import React from "react";
import { cores } from "../../empréstimos/styles/tema";

export default function Selo({ tipo, children }) {
  const estilos = {
    atraso: { bg: cores.carimboClaro, cor: cores.carimbo },
    ok: { bg: cores.verdeOkClaro, cor: cores.verdeOk },
    neutro: { bg: cores.lataoClaro, cor: cores.latao },
  };
  const s = estilos[tipo] || estilos.neutro;
  return (
    <span style={{
      background: s.bg, color: s.cor, fontSize: 11, fontWeight: 700, padding: "3px 9px",
      borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.4,
    }}>
      {children}
    </span>
  );
}