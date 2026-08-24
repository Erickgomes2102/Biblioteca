import React, { useState } from "react";
import { cores, inputStyle } from "../../styles/tema";
import Modal from "../comum/Modal";
import Campo from "../comum/Campo";
import BotaoPrincipal from "../comum/BotaoPrincipal";

export default function ModalLivro({ onFechar, onSalvar }) {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [total, setTotal] = useState(1);
  const [erro, setErro] = useState("");

  const salvar = () => {
    if (!titulo.trim() || !autor.trim()) {
      setErro("Preencha ao menos título e autor.");
      return;
    }
    onSalvar({ titulo: titulo.trim(), autor: autor.trim(), categoria: categoria.trim() || "Geral", total: Number(total) || 1 });
  };

  return (
    <Modal onFechar={onFechar} titulo="Cadastrar livro">
      <Campo label="Título">
        <input style={inputStyle} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="ex: Vidas Secas" />
      </Campo>
      <Campo label="Autor">
        <input style={inputStyle} value={autor} onChange={(e) => setAutor(e.target.value)} placeholder="ex: Graciliano Ramos" />
      </Campo>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Campo label="Categoria">
            <input style={inputStyle} value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="ex: Romance" />
          </Campo>
        </div>
        <div style={{ width: 110 }}>
          <Campo label="Exemplares">
            <input type="number" min={1} style={inputStyle} value={total} onChange={(e) => setTotal(e.target.value)} />
          </Campo>
        </div>
      </div>
      {erro && <p style={{ color: cores.carimbo, fontSize: 13 }}>{erro}</p>}
      <BotaoPrincipal onClick={salvar} full>Salvar livro</BotaoPrincipal>
    </Modal>
  );
}