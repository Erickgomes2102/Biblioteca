import React, { useState } from "react";

import { cores, inputStyle } from "../empréstimos/styles/tema";
import Modal from "../components/comum/Modal";
import Campo from "../components/comum/Campo";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";

export default function ModalLeitor({
  onFechar,
  onSalvar,
  usuarios
}) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [id_usuarios, setIdUsuarios] = useState("");
  const [erro, setErro] = useState("");

  const salvar = () => {
    if (
      !nome.trim() ||
      !cpf.trim() ||
      !telefone.trim() ||
      !email.trim() ||
      !id_usuarios
    ) {
      setErro("Preencha todos os campos.");
      return;
    }

    onSalvar({
      nome: nome.trim(),
      cpf: cpf.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      id_usuarios: Number(id_usuarios)
    });
  };

  return (
    <Modal
      onFechar={onFechar}
      titulo="Cadastrar leitor"
    >
      <Campo label="Nome completo">
        <input
          style={inputStyle}
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          placeholder="ex: Maria Oliveira"
        />
      </Campo>

      <Campo label="CPF">
        <input
          style={inputStyle}
          value={cpf}
          onChange={(e) =>
            setCpf(e.target.value)
          }
          placeholder="ex: 12345678900"
          maxLength={11}
        />
      </Campo>

      <Campo label="Telefone">
        <input
          style={inputStyle}
          value={telefone}
          onChange={(e) =>
            setTelefone(e.target.value)
          }
          placeholder="ex: 14990000000"
        />
      </Campo>

      <Campo label="E-mail">
        <input
          type="email"
          style={inputStyle}
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="ex: maria@email.com"
        />
      </Campo>

      <Campo label="Usuário responsável">
        <select
          style={inputStyle}
          value={id_usuarios}
          onChange={(e) =>
            setIdUsuarios(e.target.value)
          }
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

      <BotaoPrincipal
        onClick={salvar}
        full
      >
        Salvar leitor
      </BotaoPrincipal>
    </Modal>
  );
}