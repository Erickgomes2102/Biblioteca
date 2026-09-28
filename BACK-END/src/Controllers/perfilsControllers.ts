import { Request, Response } from "express";
import { avatarServices } from "../Services/perfilsServices";

class avatarController {
    async salvarAvatar(req: Request, res: Response) {
        const { id_usuarios } = req.body

        if(!req.file) {
           throw new Error("Arquivo com problemas")
        } else{

            const { originalname, filename: banner } = req.file
             const service = new avatarServices()
             const caminho = `/uploads/avatares/$(req.file.filename)`

        const resposta = await service.salvarAvatar(
            Number(id_usuarios), 
            caminho
        )

        return res.json(resposta)
        }
    
    }

    async removerAvatar(req: Request, res: Response) {
        const { id_usuarios } = req.body

        const service = new avatarServices()
        const resposta = await service.removerAvatar(
            Number(id_usuarios),
        
        )

        return res.json(resposta)
    }

}

export { avatarController }