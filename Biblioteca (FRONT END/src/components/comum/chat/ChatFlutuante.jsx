
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    MessageCircle,
    Minus,
    X,
    Send,
    Search,
    ArrowLeft,
    CheckCheck,
    MessageSquare
} from "lucide-react";

import api from "../../../services/api";
import {
    conectarChat,
    desconectarChat
} from "../../../services/chatSocket";

import "./chat.css";

export default function ChatFlutuante({ usuarioLogado }) {
    const [aberto, setAberto] = useState(false);
    const [minimizado, setMinimizado] = useState(true);
    const [contatos, setContatos] = useState([]);
    const [conversas, setConversas] = useState([]);
    const [conversaAtual, setConversaAtual] = useState(null);
    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState("");
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const listaRef = useRef(null);

    const idUsuario = Number(
        usuarioLogado?.id ?? usuarioLogado?.id_usuarios
    );

    const totalNaoLidas = conversas.reduce(
        (total, conversa) => total + (conversa.naoLidas || 0),
        0
    );

    const carregarContatos = useCallback(async () => {
        const resposta = await api.get("/Mensagens/Contatos");
        setContatos(resposta.data);
    }, []);

    const carregarConversas = useCallback(async () => {
        const resposta = await api.get("/Mensagens/Conversas");
        setConversas(resposta.data);
    }, []);

    const carregarMensagens = useCallback(async (idConversa) => {
        const resposta = await api.get(
            `/Mensagens/Conversas/${idConversa}`
        );

        setMensagens(resposta.data);
    }, []);

    const marcarLidas = useCallback(async (idConversa) => {
        await api.patch(
            `/Mensagens/Conversas/${idConversa}/Lidas`
        );

        setConversas((atuais) =>
            atuais.map((conversa) =>
                conversa.id_conversa === idConversa
                    ? { ...conversa, naoLidas: 0 }
                    : conversa
            )
        );
    }, []);

    const abrirConversa = useCallback(async (conversa) => {
        setErro("");
        setCarregando(true);

        try {
            setConversaAtual(conversa);

            await carregarMensagens(conversa.id_conversa);
            await marcarLidas(conversa.id_conversa);
            await carregarConversas();
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                error.response?.data?.error ||
                "Não foi possível carregar a conversa."
            );
        } finally {
            setCarregando(false);
        }
    }, [carregarMensagens, marcarLidas, carregarConversas]);

    const iniciarConversa = useCallback(async (contato) => {
        setErro("");
        setCarregando(true);

        try {
            const resposta = await api.post(
                "/Mensagens/Conversas",
                { id_contato: contato.id_usuarios }
            );

            const conversa = {
                ...resposta.data,
                contato,
                naoLidas: 0,
                ultimaMensagem: null
            };

            await carregarConversas();
            setConversaAtual(conversa);
            await carregarMensagens(conversa.id_conversa);
            await marcarLidas(conversa.id_conversa);
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                error.response?.data?.error ||
                "Não foi possível iniciar a conversa."
            );
        } finally {
            setCarregando(false);
        }
    }, [carregarConversas, carregarMensagens, marcarLidas]);

    const enviarMensagem = async (event) => {
        event.preventDefault();

        const conteudo = texto.trim();

        if (!conteudo || !conversaAtual || carregando) {
            return;
        }

        setErro("");
        setCarregando(true);

        try {
            const resposta = await api.post(
                `/Mensagens/Conversas/${conversaAtual.id_conversa}`,
                { conteudo }
            );

            setMensagens((atuais) => {
                const existe = atuais.some(
                    (mensagem) =>
                        mensagem.id_mensagem ===
                        resposta.data.id_mensagem
                );

                return existe ? atuais : [...atuais, resposta.data];
            });

            setTexto("");
            await carregarConversas();
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                error.response?.data?.error ||
                "Não foi possível enviar a mensagem."
            );
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (!usuarioLogado || !idUsuario) {
            desconectarChat();
            return;
        }

        let ativo = true;

        const carregar = async () => {
            try {
                await Promise.all([
                    carregarContatos(),
                    carregarConversas()
                ]);
            } catch (error) {
                if (ativo) {
                    setErro(
                        error.response?.data?.erro ||
                        error.response?.data?.error ||
                        "Não foi possível carregar o chat."
                    );
                }
            }
        };

        carregar();

        const socket = conectarChat();

        if (!socket) {
            return () => {
                ativo = false;
            };
        }

        const receberMensagem = async (mensagem) => {
            if (!ativo) return;

            await carregarConversas();

            if (
                conversaAtual?.id_conversa === mensagem.id_conversa
            ) {
                setMensagens((atuais) => {
                    const existe = atuais.some(
                        (item) =>
                            item.id_mensagem === mensagem.id_mensagem
                    );

                    return existe ? atuais : [...atuais, mensagem];
                });

                if (mensagem.id_remetente !== idUsuario) {
                    try {
                        await marcarLidas(mensagem.id_conversa);
                    } catch {
                        // A mensagem permanece salva no servidor.
                    }
                }
            }
        };

        const receberLeitura = async (evento) => {
            if (!ativo) return;

            if (
                conversaAtual?.id_conversa === evento.id_conversa
            ) {
                await carregarMensagens(evento.id_conversa);
            }

            await carregarConversas();
        };

        socket.on("mensagem:nova", receberMensagem);
        socket.on("mensagem:lida", receberLeitura);

        return () => {
            ativo = false;
            socket.off("mensagem:nova", receberMensagem);
            socket.off("mensagem:lida", receberLeitura);
        };
    }, [
        usuarioLogado,
        idUsuario,
        carregarContatos,
        carregarConversas,
        conversaAtual?.id_conversa,
        marcarLidas,
        carregarMensagens
    ]);

    useEffect(() => {
        if (listaRef.current) {
            listaRef.current.scrollTop =
                listaRef.current.scrollHeight;
        }
    }, [mensagens, aberto, minimizado]);

    if (!usuarioLogado) {
        return null;
    }

    const contatosFiltrados = contatos.filter((contato) =>
        contato.nome.toLowerCase().includes(busca.toLowerCase())
    );

    const totalMensagensNaoLidas = Number(totalNaoLidas) || 0;

    return (
        <div className="chat-container">
            {!aberto && (
                <button
                    type="button"
                    className="chat-botao-flutuante"
                    onClick={() => {
                        setAberto(true);
                        setMinimizado(false);
                    }}
                    aria-label="Abrir mensagens"
                    title="Mensagens"
                >
                    <MessageCircle size={23} />

                    {totalMensagensNaoLidas > 0 && (
                        <span className="chat-badge">
                            {totalMensagensNaoLidas > 99
                                ? "99+"
                                : totalMensagensNaoLidas}
                        </span>
                    )}
                </button>
            )}

            {aberto && (
                <section className={`chat-janela ${minimizado ? "chat-minimizado" : ""}`}>
                    <header className="chat-cabecalho">
                        <div className="chat-titulo">
                            {conversaAtual ? (
                                <>
                                    <button
                                        type="button"
                                        className="chat-icone"
                                        onClick={() => setConversaAtual(null)}
                                        title="Voltar às conversas"
                                        aria-label="Voltar"
                                    >
                                        <ArrowLeft size={17} />
                                    </button>

                                    <div className="chat-avatar">
                                        {(conversaAtual.contato?.nome || "?")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className="chat-titulo-texto">
                                        <strong>
                                            {conversaAtual.contato?.nome ||
                                                "Conversa"}
                                        </strong>
                                        <small>
                                            {conversaAtual.contato?.tipo || ""}
                                        </small>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <MessageSquare size={21} />
                                    <div className="chat-titulo-texto">
                                        <strong>Mensagens</strong>
                                        <small>
                                            {totalMensagensNaoLidas > 0
                                                ? `${totalMensagensNaoLidas} não lida(s)`
                                                : "Comunicação interna"}
                                        </small>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="chat-acoes-cabecalho">
                            <button
                                type="button"
                                className="chat-icone"
                                onClick={() => setMinimizado(!minimizado)}
                                title="Minimizar"
                                aria-label="Minimizar chat"
                            >
                                <Minus size={18} />
                            </button>

                            <button
                                type="button"
                                className="chat-icone"
                                onClick={() => {
                                    setAberto(false);
                                    setMinimizado(true);
                                }}
                                title="Fechar janela"
                                aria-label="Fechar chat"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </header>

                    {!minimizado && (
                        <>
                            {erro && (
                                <div className="chat-erro">
                                    {erro}
                                    <button
                                        type="button"
                                        onClick={() => setErro("")}
                                        aria-label="Fechar aviso"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {!conversaAtual ? (
                                <div className="chat-corpo">
                                    <label className="chat-busca">
                                        <Search size={17} />

                                        <input
                                            value={busca}
                                            onChange={(event) =>
                                                setBusca(event.target.value)
                                            }
                                            placeholder="Buscar contato..."
                                        />
                                    </label>

                                    <div className="chat-lista">
                                        {conversas.map((conversa) => (
                                            <button
                                                type="button"
                                                className="chat-item"
                                                key={conversa.id_conversa}
                                                onClick={() =>
                                                    abrirConversa(conversa)
                                                }
                                            >
                                                <div className="chat-avatar">
                                                    {(conversa.contato?.nome || "?")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="chat-item-texto">
                                                    <strong>
                                                        {conversa.contato?.nome}
                                                    </strong>
                                                    <small>
                                                        {conversa.ultimaMensagem?.conteudo ||
                                                            "Conversa iniciada"}
                                                    </small>
                                                </div>

                                                {conversa.naoLidas > 0 && (
                                                    <span className="chat-nao-lidas">
                                                        {conversa.naoLidas}
                                                    </span>
                                                )}
                                            </button>
                                        ))}

                                        <div className="chat-separador">
                                            Iniciar conversa
                                        </div>

                                        {contatosFiltrados.map((contato) => (
                                            <button
                                                type="button"
                                                className="chat-item"
                                                key={contato.id_usuarios}
                                                onClick={() =>
                                                    iniciarConversa(contato)
                                                }
                                            >
                                                <div className="chat-avatar">
                                                    {(contato.nome || "?")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="chat-item-texto">
                                                    <strong>{contato.nome}</strong>
                                                    <small>
                                                        {contato.tipo}
                                                    </small>
                                                </div>
                                            </button>
                                        ))}

                                        {conversas.length === 0 &&
                                            contatosFiltrados.length === 0 && (
                                                <p className="chat-vazio">
                                                    Nenhum contato encontrado.
                                                </p>
                                            )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className="chat-mensagens"
                                        ref={listaRef}
                                    >
                                        {mensagens.map((mensagem) => {
                                            const minha =
                                                Number(mensagem.id_remetente) ===
                                                idUsuario;

                                            return (
                                                <div
                                                    key={mensagem.id_mensagem}
                                                    className={`chat-linha-mensagem ${
                                                        minha
                                                            ? "chat-minha-mensagem"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="chat-balao">
                                                        <p>{mensagem.conteudo}</p>

                                                        <small>
                                                            {new Date(
                                                                mensagem.enviada_em
                                                            ).toLocaleTimeString(
                                                                "pt-BR",
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                }
                                                            )}

                                                            {minha && (
                                                                <CheckCheck
                                                                    size={14}
                                                                    className={
                                                                        mensagem.lida_em
                                                                            ? "chat-lida"
                                                                            : ""
                                                                    }
                                                                />
                                                            )}
                                                        </small>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {mensagens.length === 0 && !carregando && (
                                            <p className="chat-vazio">
                                                Envie a primeira mensagem.
                                            </p>
                                        )}
                                    </div>

                                    <form
                                        className="chat-formulario"
                                        onSubmit={enviarMensagem}
                                    >
                                        <textarea
                                            value={texto}
                                            onChange={(event) =>
                                                setTexto(event.target.value)
                                            }
                                            placeholder="Escreva uma mensagem..."
                                            maxLength={2000}
                                            rows={1}
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" &&
                                                    !event.shiftKey
                                                ) {
                                                    event.preventDefault();
                                                    event.currentTarget.form.requestSubmit();
                                                }
                                            }}
                                        />

                                        <button
                                            type="submit"
                                            className="chat-enviar"
                                            disabled={
                                                !texto.trim() ||
                                                carregando
                                            }
                                            title="Enviar mensagem"
                                            aria-label="Enviar mensagem"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </>
                            )}
                        </>
                    )}
                </section>
            )}
        </div>
    );
}
