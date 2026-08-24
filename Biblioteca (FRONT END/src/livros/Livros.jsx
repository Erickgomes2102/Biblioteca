import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cores, botaoIcone } from "../../styles/tema";
import Cabecalho from "../comum/Cabecalho";
import BarraBusca from "../comum/BarraBusca";
import BotaoPrincipal from "../comum/BotaoPrincipal";
import Selo from "../comum/Selo";
import ModalLivro from "./ModalLivro";

export default function Livros({ livros, setLivros }) {
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(null);

  const filtrados = livros.filter((l) =>
    (l.titulo + l.autor + l.categoria).toLowerCase().includes(busca.toLowerCase())
  );

  const adicionar = (dados) => {
    setLivros([...livros, { id: Date.now(), disponiveis: dados.total, ...dados }]);
    setNovo(null);
  };

  const remover = (id) => setLivros(livros.filter((l) => l.id !== id));

  return (
    <div>
      <Cabecalho titulo="Livros" subtitulo={`${livros.length} títulos cadastrados`}
        acao={<BotaoPrincipal onClick={() => setNovo({})}><Plus size={15} /> Novo livro</BotaoPrincipal>} />

      <BarraBusca valor={busca} onChange={setBusca} placeholder="Buscar por título, autor ou categoria" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 16 }}>
        {filtrados.map((l) => (
          <div key={l.id} style={{
            background: cores.papel, border: `1px solid ${cores.linha}`, borderRadius: 6, padding: "14px 16px",
            display: "flex", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontWeight: 700, color: cores.tinta, fontSize: 14 }}>{l.titulo}</div>
              <div style={{ fontSize: 12.5, color: cores.tintaSuave, marginTop: 2 }}>{l.autor} · {l.categoria}</div>
              <div style={{ marginTop: 8 }}>
                <Selo tipo={l.disponiveis > 0 ? "ok" : "atraso"}>
                  {l.disponiveis > 0 ? `${l.disponiveis} de ${l.total} disponíveis` : "todos emprestados"}
                </Selo>
              </div>
            </div>
            <button onClick={() => remover(l.id)} style={botaoIcone}>
              <Trash2 size={15} color={cores.tintaSuave} />
            </button>
          </div>
        ))}
        {filtrados.length === 0 && <p style={{ color: cores.tintaSuave, fontSize: 13.5 }}>Nenhum livro encontrado.</p>}
      </div>

      {novo !== null && <ModalLivro onFechar={() => setNovo(null)} onSalvar={adicionar} />}
    </div>
  );
}