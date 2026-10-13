import express, {
    Request,
    Response,
    NextFunction
} from "express";

import "express-async-errors";
import cors from "cors";
import { createServer } from "http";
import router from "./router";
import path from "path";
import { configurarSocket } from "./Middleware/socket";

const app = express();
const servidor = createServer(app);

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true
}));

const pastaUploads = path.resolve(__dirname, "tmp");

console.log("📂 EXPRESS SERVINDO:", pastaUploads);

app.use(
    "/files",
    express.static(pastaUploads)
);

app.use(router);

app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof Error) {
            return res.status(400).json({
                error: err.message
            });
        }

        return res.status(500).json({
            status: "Erro",
            message: "Erro Interno do Servidor"
        });
    }
);

configurarSocket(servidor);

servidor.listen(3334, () => {
    console.log("Servidor Online / Porta 3334");
});