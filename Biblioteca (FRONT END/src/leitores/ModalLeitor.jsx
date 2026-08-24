import React, { useState } from "react";
import { cores, inputStyle } from "../../styles/tema";
import Modal from "../comum/Modal";
import Campo from "../comum/Campo";
import BotaoPrincipal from "../comum/BotaoPrincipal";

export default function ModalLeitor({ onFechar, onSalvar }) {
  const [nome, setNome] = useState("");
  const [turma, setTurma] = useState("");
  const [contato, setContato] = useState("");
  const [erro, setErro] = useState("");

  const salvar = () => {
    if (!nome.trim()) { setErro("Informe o nome do leitor."); return; }
    onSalvar({ nome: nome.trim(), turma: turma.trim() || "—", contato: contato.trim() || "—" });
  };

  return (
    <Modal onFechar={onFechar} titulo="Cadastrar leitor">
      <Campo label="Nome completo">
        <input style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex: Maria Oliveira" />
      </Campo>
      <Campo label="Turma / vínculo">
        <input style={inputStyle} value={turma} onChange={(e) => setTurma(e.target.value)} placeholder="ex: 7º Ano A" />
      </Campo>
      <Campo label="Contato">
        <input style={inputStyle} value={contato} onChange={(e) => setContato(e.target.value)} placeholder="ex: (14) 90000-0000" />
      </Campo>
      {erro && <p style={{ color: cores.carimbo, fontSize: 13 }}>{erro}</p>}
      <BotaoPrincipal onClick={salvar} full>Salvar leitor</BotaoPrincipal>
    </Modal>
  );
}