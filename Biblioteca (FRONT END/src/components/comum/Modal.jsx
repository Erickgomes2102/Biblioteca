import React from "react";
import { X } from "lucide-react";
import { cores, fontDisplay, botaoIcone } from "../../styles/tema";

export default function Modal({ titulo, children, onFechar }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(38,53,42,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 50,
    }} onClick={onFechar}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: cores.papel, width: 380, borderRadius: 6, padding: "24px 26px",
        borderTop: `4px solid ${cores.latao}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontFamily: fontDisplay, fontSize: 17, color: cores.tinta, margin: 0 }}>{titulo}</h3>
          <button onClick={onFechar} style={botaoIcone}><X size={17} color={cores.tintaSuave} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}