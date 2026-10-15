import React, { useState } from "react";

import { cores, inputStyle } from "../empréstimos/styles/tema";
import Modal from "../components/comum/Modal";
import Campo from "../components/comum/Campo";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";

export default function ModalLeitor({
  onFechar,
  onSalvar,
  usuarios = [],
  usuarioLogado,
  leitor = null
}) {
  const ehAdministrador =
    usuarioLogado?.tipo === "ADMINISTRADOR";

  const idUsuarioLogado =
    usuarioLogado?.id_usuarios ?? usuarioLogado?.id;

  const [nome, setNome] = useState(leitor?.nome || "");
  const [cpf, setCpf] = useState(leitor?.cpf || "");
  const [telefone, setTelefone] = useState(leitor?.telefone || "");
  const [email, setEmail] = useState(leitor?.email || "");

  const [id_usuarios, setIdUsuarios] = useState(() => {
    if (ehAdministrador) {
      return leitor?.id_usuarios
        ? String(leitor.id_usuarios)
        : "";
    }

    return idUsuarioLogado
      ? String(idUsuarioLogado)
      : "";
  });

  const [erro, setErro] = useState("");

  const salvar = () => {
    const usuarioResponsavel = ehAdministrador
      ? id_usuarios
      : idUsuarioLogado;

    if (
      !nome.trim() ||
      !cpf.trim() ||
      !telefone.trim() ||
      !email.trim() ||
      !usuarioResponsavel
    ) {
      setErro("Preencha todos os campos.");
      return;
    }

    onSalvar({
      nome: nome.trim(),
      cpf: cpf.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      id_usuarios: Number(usuarioResponsavel)
    });
  };

  return (
    <Modal
      onFechar={onFechar}
      titulo={leitor ? "Editar leitor" : "Cadastrar leitor"}
    >
      <Campo label="Nome completo">
        <input
          style={inputStyle}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="ex: Maria Oliveira"
        />
      </Campo>

      <Campo label="CPF">
        <input
          style={inputStyle}
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="ex: 12345678900"
          maxLength={11}
        />
      </Campo>

      <Campo label="Telefone">
        <input
          style={inputStyle}
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="ex: 14990000000"
        />
      </Campo>

      <Campo label="E-mail">
        <input
          type="email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ex: maria@email.com"
        />
      </Campo>

        {ehAdministrador && (
        <Campo label="Usuário responsável">
          <select
            style={inputStyle}
            value={id_usuarios}
            onChange={(e) => setIdUsuarios(e.target.value)}
          >
            <option value="">
              Selecione um usuário
            </option>

            {usuarios.map((usuario) => (
              <option
                key={usuario.id_usuarios}
                value={usuario.id_usuarios}
              >
                {usuario.nome}
              </option>
            ))}
          </select>
        </Campo>
      )}

      {erro && (
        <p
          style={{
            color: cores.carimbo,
            fontSize: 13
          }}
        >
          {erro}
        </p>
      )}

      <BotaoPrincipal onClick={salvar} full>
        Salvar leitor
      </BotaoPrincipal>
    </Modal>
  );
}