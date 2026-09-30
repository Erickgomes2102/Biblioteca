import express, {
    Request,
    Response,
    NextFunction
} from "express";

import "express-async-errors";
import cors from "cors";
import router from "./router";
import path from "path";

const app = express();

app.use(express.json());

app.use(cors());
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

app.listen(3334, () => {
    console.log("Servidor Online / Porta 3334");
});