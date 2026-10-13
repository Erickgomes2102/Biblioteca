import { io } from "socket.io-client";

let socket = null;

export function conectarChat() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    if (socket?.connected) {
        return socket;
    }

    if (socket) {
        socket.auth = { token };
        socket.connect();
        return socket;
    }

    socket = io("http://localhost:3334", {
        autoConnect: false,
        auth: { token }
    });

    socket.on("connect_error", (error) => {
        console.error(
            "[CHAT] Falha na conexão:",
            error.message
        );
    });

    socket.connect();

    return socket;
}

export function desconectarChat() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}