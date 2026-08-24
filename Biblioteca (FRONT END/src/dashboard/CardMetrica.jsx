import React from "react";
import { cores, fontDisplay } from "../../styles/tema";

export default function CardMetrica({ label, valor, icone: Icone, cor }) {
  return (
    <div style={{
      background: cores.papel, border: `1px solid ${cores.linha}`, borderRadius: 6, padding: "16px 16px",
      position: "relative",
    }}>
      <Icone size={18} color={cor || cores.latao} style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 26, fontFamily: fontDisplay, fontWeight: 600, color: cores.tinta }}>{valor}</div>
      <div style={{ fontSize: 12, color: cores.tintaSuave, marginTop: 2 }}>{label}</div>
    </div>
  );
}