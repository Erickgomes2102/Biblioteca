import React from "react";
import { Search } from "lucide-react";
import { cores, inputStyle } from "../../empréstimos/styles/tema";

export default function BarraBusca({ valor, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", maxWidth: 360 }}>
      <Search size={15} color={cores.tintaSuave} style={{ position: "absolute", left: 12, top: 11 }} />
      <input value={valor} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputStyle, paddingLeft: 34 }} />
    </div>
  );
}