import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, "..", "tmp"));
    },

    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname);

        const nomeArquivo =
            `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}${extensao}`;

        cb(null, nomeArquivo);
    }
});

const uploadAvatar = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Formato de imagem não permitido"));
        }
    }
});

export { uploadAvatar };