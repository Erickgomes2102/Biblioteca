import React from "react";
import { cores } from "../../empréstimos/styles/tema";

export default function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: cores.tintaSuave, marginBottom: 5, fontWeight: 600 }}>
        {label}
      </label>
      {children}
    </div>
  );
}