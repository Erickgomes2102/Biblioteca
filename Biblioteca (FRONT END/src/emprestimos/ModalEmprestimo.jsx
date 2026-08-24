import React, { useState } from "react";
import { cores, inputStyle } from "../../styles/tema";
import Modal from "../comum/Modal";
import Campo from "../comum/Campo";
import BotaoPrincipal from "../comum/BotaoPrincipal";

export default function ModalEmprestimo({ onFechar, onSalvar, livros, leitores }) {
  const [livroId, setLivroId] = useState("");
  const [leitorId, setLeitorId] = useState("");
  const [dias, setDias] = useState(14);
  const [erro, setErro] = useState("");

  const salvar = () => {
    if (!livroId || !leitorId) { setErro("Selecione o livro e o leitor."); return; }
    onSalvar({ livroId, leitorId, dias });
  };

  return (
    <Modal onFechar={onFechar} titulo="Registrar empréstimo">
      <Campo label="Livro (apenas disponíveis)">
        <select style={inputStyle} value={livroId} onChange={(e) => setLivroId(e.target.value)}>
          <option value="">Selecione um livro</option>
          {livros.map((l) => <option key={l.id} value={l.id}>{l.titulo} ({l.disponiveis} disp.)</option>)}
        </select>
      </Campo>
      <Campo label="Leitor">
        <select style={inputStyle} value={leitorId} onChange={(e) => setLeitorId(e.target.value)}>
          <option value="">Selecione um leitor</option>
          {leitores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </Campo>
      <Campo label="Prazo (dias)">
        <input type="number" min={1} style={inputStyle} value={dias} onChange={(e) => setDias(e.target.value)} />
      </Campo>
      {erro && <p style={{ color: cores.carimbo, fontSize: 13 }}>{erro}</p>}
      <BotaoPrincipal onClick={salvar} full>Confirmar empréstimo</BotaoPrincipal>
    </Modal>
  );
}