import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verify } from "jsonwebtoken";
import { decode } from "punycode";

let io: Server;

function configurarSocket(servidor: HttpServer) { 
    io = new Server(servidor, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PATCH"],
            credentials: true
        }
    });

    io.use((socket, next) => {
        try {
        const token = socket.handshake.auth?.token;

        if(!token) {
            return next(new Error("Token não informado"))
        }

        const decoded = verify(
            token,
            process.env.JWT_SECRETO as string
        ) as {
            sub?: string;
        }

        if (!decoded.sub) {
            return next(new Error("Token inválido"));
        }

        socket.data.id_usuarios = Number(decoded.sub);

        next();
        } catch {
            next(new Error("Token inválido ou expirado"))
        }
    })

    io.on("connection", (socket) => {
        const id_usuarios = socket.data.id_usuarios;

        socket.join(`usuario:${id_usuarios}`);

        console.log(`Chat conectado: usuário ${id_usuarios}`);

        socket.on("disconnect", () => { 
            console.log(`Chat desconectado: usuário ${id_usuarios}`)
        })
    })

    return io;
}

function obterSocket() {
    if (!io) { 
        throw new Error(
            "Socket.io ainda não inicializou"
        )
    }

    return io;
}

export { configurarSocket, obterSocket }
