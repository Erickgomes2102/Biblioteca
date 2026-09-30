import multer from "multer";
import path from "path";


const pastaUploads = path.resolve(__dirname, "..", "tmp");

console.log("📁 MULTER SALVA EM:", pastaUploads);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pastaUploads);
    },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);

    const nomeArquivo = `avatar-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extensao}`;

        console.log("🖼️ Arquivo criado:", nomeArquivo);

        cb(null, nomeArquivo);
    }
});

const uploadAvatar = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
  },
);

export { uploadAvatar };