import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cores, botaoIcone } from "../../styles/tema";
import Cabecalho from "../comum/Cabecalho";
import BarraBusca from "../comum/BarraBusca";
import BotaoPrincipal from "../comum/BotaoPrincipal";
import LinhaItem from "../comum/LinhaItem";
import ModalLeitor from "./ModalLeitor";

export default function Leitores({ leitores, setLeitores }) {
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(null);

  const filtrados = leitores.filter((p) => (p.nome + p.turma).toLowerCase().includes(busca.toLowerCase()));

  const adicionar = (dados) => {
    setLeitores([...leitores, { id: Date.now(), ...dados }]);
    setNovo(null);
  };
  const remover = (id) => setLeitores(leitores.filter((p) => p.id !== id));

  return (
    <div>
      <Cabecalho titulo="Leitores" subtitulo={`${leitores.length} pessoas cadastradas`}
        acao={<BotaoPrincipal onClick={() => setNovo({})}><Plus size={15} /> Novo leitor</BotaoPrincipal>} />

      <BarraBusca valor={busca} onChange={setBusca} placeholder="Buscar por nome ou turma" />

      <div style={{ marginTop: 16, background: cores.papel, border: `1px solid ${cores.linha}`, borderRadius: 6, padding: "4px 20px" }}>
        {filtrados.map((p) => (
          <LinhaItem key={p.id} titulo={p.nome} sub={`${p.turma} · ${p.contato}`}
            acao={<button onClick={() => remover(p.id)} style={botaoIcone}><Trash2 size={14} color={cores.tintaSuave} /></button>} />
        ))}
        {filtrados.length === 0 && <p style={{ color: cores.tintaSuave, fontSize: 13.5, padding: "10px 0" }}>Nenhum leitor encontrado.</p>}
      </div>

      {novo !== null && <ModalLeitor onFechar={() => setNovo(null)} onSalvar={adicionar} />}
    </div>
  );
}