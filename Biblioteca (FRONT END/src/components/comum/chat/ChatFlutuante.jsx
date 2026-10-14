import { imagemDoAvatar } from "../../../avatares";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

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

// =====================================================
// AVATAR
// =====================================================

function obterUrlAvatar(avatar) {
    if (!avatar || typeof avatar !== "string") {
        return null;
    }

    const valor = avatar.trim();
    
    if ( valor.startsWith("avatar_")) {
        return imagemDoAvatar(valor ) || null;
    }
    if (
        valor.startsWith("https://") ||
        valor.startsWith("http://") ||
        valor.startsWith("data:image/")
    ) {
        return valor;
    }

    if (valor.startsWith("/")) {
        const baseURL = api.defaults.baseURL?.replace(/\/$/, "") || "";
        return `${baseURL}${valor}`;
    }


    return null
}

function AvatarChat({
    nome,
    avatar,
    className = "chat-avatar"
}) {
    const [imagemErro, setImagemErro] = useState(false);

    const url = obterUrlAvatar(avatar);

    useEffect(() => {
        setImagemErro(false);
    }, [avatar]);

    return (
        <div className={className}>
            {url && !imagemErro ? (
                <img
                    src={url}
                    alt={`Foto de ${nome || "usuário"}`}
                    onError={() => setImagemErro(true)}
                />
            ) : (
                (nome || "?").charAt(0).toUpperCase()
            )}
        </div>
    );
}

// =====================================================
// CHAT FLUTUANTE
// =====================================================

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

    // =====================================================
    // NORMALIZAR RESPOSTAS DA API
    // =====================================================

    const carregarContatos = useCallback(async () => {
        const resposta = await api.get("/Mensagens/Contatos");

        const dados = Array.isArray(resposta.data)
            ? resposta.data.filter(
                (contato) => contato && typeof contato === "object"
            )
            : [];

        setContatos(dados);
    }, []);

    const carregarConversas = useCallback(async () => {
        const resposta = await api.get("/Mensagens/Conversas");

        const dados = Array.isArray(resposta.data)
            ? resposta.data.filter(
                (conversa) => conversa && typeof conversa === "object"
            )
            : [];

        setConversas(dados);

        return dados;
    }, []);

    const carregarMensagens = useCallback(async (idConversa) => {
        const resposta = await api.get(
            `/Mensagens/Conversas/${idConversa}`
        );

        const dados = Array.isArray(resposta.data)
            ? resposta.data.filter(
                (mensagem) => mensagem && typeof mensagem === "object"
            )
            : [];

        setMensagens(dados);

        return dados;
    }, []);

    // =====================================================
    // MARCAR MENSAGENS COMO LIDAS
    // =====================================================

    const marcarLidas = useCallback(async (idConversa) => {
        await api.patch(
            `/Mensagens/Conversas/${idConversa}/Lidas`
        );

        setConversas((atuais) =>
            atuais
                .filter(Boolean)
                .map((conversa) =>
                    conversa.id_conversa === idConversa
                        ? { ...conversa, naoLidas: 0 }
                        : conversa
                )
        );
    }, []);

    // =====================================================
    // ABRIR CONVERSA
    // =====================================================

    const abrirConversa = useCallback(async (conversa) => {
        if (!conversa || !conversa.id_conversa) {
            setErro("Não foi possível identificar esta conversa.");
            return;
        }

        setErro("");
        setCarregando(true);

        try {
            setConversaAtual(conversa);
            setMensagens([]);

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
    }, [
        carregarMensagens,
        marcarLidas,
        carregarConversas
    ]);

    // =====================================================
    // INICIAR CONVERSA
    // =====================================================

    const iniciarConversa = useCallback(async (contato) => {
        if (!contato?.id_usuarios) {
            setErro("Não foi possível identificar este contato.");
            return;
        }

        setErro("");
        setCarregando(true);

        try {
            const resposta = await api.post(
                "/Mensagens/Conversas",
                {
                    id_contato: contato.id_usuarios
                }
            );

            const conversaCriada = resposta.data;

            if (!conversaCriada?.id_conversa) {
                throw new Error(
                    "A API não retornou o identificador da conversa."
                );
            }

            const conversa = {
                ...conversaCriada,
                contato,
                naoLidas: 0,
                ultimaMensagem: null
            };

            await carregarConversas();

            setConversaAtual(conversa);
            setMensagens([]);

            await carregarMensagens(conversa.id_conversa);
            await marcarLidas(conversa.id_conversa);
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                error.response?.data?.error ||
                error.message ||
                "Não foi possível iniciar a conversa."
            );
        } finally {
            setCarregando(false);
        }
    }, [
        carregarConversas,
        carregarMensagens,
        marcarLidas
    ]);

    // =====================================================
    // ENVIAR MENSAGEM
    // =====================================================

    const enviarMensagem = async (event) => {
        event.preventDefault();

        const conteudo = texto.trim();

        if (
            !conteudo ||
            !conversaAtual?.id_conversa ||
            carregando
        ) {
            return;
        }

        setErro("");
        setCarregando(true);

        try {
            const resposta = await api.post(
                `/Mensagens/Conversas/${conversaAtual.id_conversa}`,
                { conteudo }
            );

            const mensagem = resposta.data;

            if (!mensagem || typeof mensagem !== "object") {
                throw new Error(
                    "A API não retornou a mensagem enviada."
                );
            }

            setMensagens((atuais) => {
                const lista = atuais.filter(Boolean);

                const existe = lista.some(
                    (item) =>
                        item.id_mensagem === mensagem.id_mensagem
                );

                return existe ? lista : [...lista, mensagem];
            });

            setTexto("");

            await carregarConversas();
        } catch (error) {
            setErro(
                error.response?.data?.erro ||
                error.response?.data?.error ||
                error.message ||
                "Não foi possível enviar a mensagem."
            );
        } finally {
            setCarregando(false);
        }
    };

    // =====================================================
    // CONECTAR CHAT E RECEBER EVENTOS
    // =====================================================

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
            if (!ativo || !mensagem) {
                return;
            }

            try {
                await carregarConversas();

                if (
                    conversaAtual?.id_conversa ===
                    mensagem.id_conversa
                ) {
                    setMensagens((atuais) => {
                        const lista = atuais.filter(Boolean);

                        const existe = lista.some(
                            (item) =>
                                item.id_mensagem === mensagem.id_mensagem
                        );

                        return existe ? lista : [...lista, mensagem];
                    });

                    if (
                        Number(mensagem.id_remetente) !== idUsuario
                    ) {
                        try {
                            await marcarLidas(mensagem.id_conversa);
                        } catch {
                            // A mensagem continua salva no servidor.
                        }
                    }
                }
            } catch {
                // Evita que uma falha de atualização derrube o chat.
            }
        };

        const receberLeitura = async (evento) => {
            if (!ativo || !evento) {
                return;
            }

            try {
                if (
                    conversaAtual?.id_conversa === evento.id_conversa
                ) {
                    await carregarMensagens(evento.id_conversa);
                }

                await carregarConversas();
            } catch {
                // A atualização poderá ocorrer na próxima consulta.
            }
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

    // =====================================================
    // ROLAR PARA A ÚLTIMA MENSAGEM
    // =====================================================

    useEffect(() => {
        if (listaRef.current) {
            listaRef.current.scrollTop =
                listaRef.current.scrollHeight;
        }
    }, [mensagens, aberto, minimizado]);

    // =====================================================
    // FILTROS
    // =====================================================

    if (!usuarioLogado) {
        return null;
    }

    const contatosValidos = contatos.filter(
        (contato) => contato && typeof contato === "object"
    );

    const conversasValidas = Array.isArray(conversas)
        ? conversas.filter(
            (conversa) =>
                conversa !== null &&
                typeof conversa === "object" &&
                !Array.isArray(conversa)
        )
        : [];

    const mensagensValidas = mensagens.filter(
        (mensagem) => mensagem && typeof mensagem === "object"
    );

    const contatosFiltrados = contatosValidos.filter((contato) =>
        String(contato.nome || "")
            .toLowerCase()
            .includes(busca.toLowerCase().trim())
    );

    const totalMensagensNaoLidas = conversasValidas.reduce(
        (total, conversa) =>
            total + (Number(conversa.naoLidas) || 0),
        0
    );

    // =====================================================
    // INTERFACE
    // =====================================================

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
                <section
                    className={`chat-janela ${minimizado ? "chat-minimizado" : ""
                        }`}
                >
                    <header className="chat-cabecalho">
                        <div className="chat-titulo">
                            {conversaAtual ? (
                                <>
                                    <button
                                        type="button"
                                        className="chat-icone"
                                        onClick={() => {
                                            setConversaAtual(null);
                                            setMensagens([]);
                                            setErro("");
                                        }}
                                        title="Voltar às conversas"
                                        aria-label="Voltar"
                                    >
                                        <ArrowLeft size={17} />
                                    </button>

                                    <AvatarChat
                                        nome={conversaAtual.contato?.nome}
                                        avatar={conversaAtual.contato?.avatar}
                                    />

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
                                onClick={() =>
                                    setMinimizado((atual) => !atual)
                                }
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
                                        {conversasValidas.map((conversa) => (
                                            <button
                                                type="button"
                                                className="chat-item"
                                                key={conversa.id_conversa}
                                                onClick={() => abrirConversa(conversa)}
                                            >
                                                <AvatarChat
                                                    nome={conversa.contato?.nome}
                                                    avatar={conversa.contato?.avatar}
                                                />

                                                <div className="chat-item-texto">
                                                    <strong>
                                                        {conversa.contato?.nome || "Contato indisponível"}
                                                    </strong>

                                                    <small>
                                                        {conversa.ultimaMensagem?.conteudo ||
                                                            "Conversa iniciada"}
                                                    </small>
                                                </div>

                                                {Number(conversa.naoLidas) > 0 && (
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
                                                <AvatarChat
                                                    nome={contato.nome}
                                                    avatar={contato.avatar}
                                                />

                                                <div className="chat-item-texto">
                                                    <strong>
                                                        {contato.nome || "Usuário"}
                                                    </strong>

                                                    <small>
                                                        {contato.tipo || ""}
                                                    </small>
                                                </div>
                                            </button>
                                        ))}

                                        {conversasValidas.length === 0 &&
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
                                        {mensagensValidas.map((mensagem) => {
                                            const minha =
                                                Number(mensagem.id_remetente) ===
                                                idUsuario;

                                            return (
                                                <div
                                                    key={mensagem.id_mensagem}
                                                    className={`chat-linha-mensagem ${minha
                                                            ? "chat-minha-mensagem"
                                                            : ""
                                                        }`}
                                                >
                                                    <div className="chat-balao">
                                                        <p>{mensagem.conteudo}</p>

                                                        <small>
                                                            {mensagem.enviada_em
                                                                ? new Date(
                                                                    mensagem.enviada_em
                                                                ).toLocaleTimeString(
                                                                    "pt-BR",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit"
                                                                    }
                                                                )
                                                                : ""}

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

                                        {mensagensValidas.length === 0 &&
                                            !carregando && (
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
                                                !texto.trim() || carregando
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
