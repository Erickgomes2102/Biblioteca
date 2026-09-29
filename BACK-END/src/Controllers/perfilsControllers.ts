import { Request, Response } from "express";
import { avatarServices } from "../Services/perfilsServices";

class avatarController {
  async salvarAvatar(req: Request, res: Response) {
    const { id_usuarios } = req.body;

    if (!id_usuarios) {
      return res.status(400).json({
        erro: "ID do usuário não informado",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        erro: "Nenhuma imagem foi enviada",
      });
    }

    const caminho = `/files/${req.file.filename}`;

    const service = new avatarServices();

    const resposta = await service.salvarAvatar(
      Number(id_usuarios),
      caminho
    );

    return res.json(resposta);
  }

  async removerAvatar(req: Request, res: Response) {
    const { id_usuarios } = req.body;

    if (!id_usuarios) {
      return res.status(400).json({
        erro: "ID do usuário não informado",
      });
    }

    const service = new avatarServices();

    const resposta = await service.removerAvatar(
      Number(id_usuarios)
    );

    return res.json(resposta);
  }
}

export { avatarController };