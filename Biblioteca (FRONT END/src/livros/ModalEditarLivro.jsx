import React, { useState } from "react";
import { cores, inputStyle } from "../empréstimos/styles/tema";
import Modal from "../components/comum/Modal";
import Campo from "../components/comum/Campo";
import BotaoPrincipal from "../components/comum/BotaoPrincipal";

export default function ModalEditarLivro({
    livro,
    onFechar,
    onSalvar
}) {

    const [isbn, setIsbn] = useState(livro.isbn);
    const [titulo, setTitulo] = useState(livro.titulo);
    const [autor, setAutor] = useState(livro.autor);
    const [editora, setEditora] = useState(livro.editora);
    const [ano, setAno] = useState(livro.ano);
    const [quantidade, setQuantidade] = useState(livro.quantidade);
    const [erro, setErro] = useState("");

    const salvar = () => {

        if (
            !isbn.trim() ||
            !titulo.trim() ||
            !autor.trim() ||
            !editora.trim() ||
            !ano ||
            quantidade === ""
        ) {
            setErro("Preencha todos os campos.");
            return;
        }

        onSalvar(livro.id_livros, {
            isbn: isbn.trim(),
            titulo: titulo.trim(),
            autor: autor.trim(),
            editora: editora.trim(),
            ano: Number(ano),
            quantidade: Number(quantidade),
            id_categorias: livro.id_categorias
        });
    };

    return (
        <Modal onFechar={onFechar} titulo="Editar livro">

            <Campo label="ISBN">
                <input
                    style={inputStyle}
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                />
            </Campo>

            <Campo label="Título">
                <input
                    style={inputStyle}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                />
            </Campo>

            <Campo label="Autor">
                <input
                    style={inputStyle}
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                />
            </Campo>

            <Campo label="Editora">
                <input
                    style={inputStyle}
                    value={editora}
                    onChange={(e) => setEditora(e.target.value)}
                />
            </Campo>

            <Campo label="Ano">
                <input
                    type="number"
                    style={inputStyle}
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                />
            </Campo>

            <Campo label="Quantidade">
                <input
                    type="number"
                    min={0}
                    style={inputStyle}
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                />
            </Campo>

            {erro && (
                <p style={{
                    color: cores.carimbo,
                    fontSize: 13
                }}>
                    {erro}
                </p>
            )}

            <BotaoPrincipal onClick={salvar} full>
                Salvar alterações
            </BotaoPrincipal>

        </Modal>
    );
}