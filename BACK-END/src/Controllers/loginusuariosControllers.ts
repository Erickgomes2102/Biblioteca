import { Request, Response } from "express";
import { LogarUsuariosServices } from "../Services/loginusuariosServices";

class LogarUsuariosControllers {
    
    async loginUsuarios(req: Request, res: Response) {
        const {email, senha} = req.body
        const services = new LogarUsuariosServices()

        const resposta = await services.logarUsuarios({
            email,
            senha
        })

        return res.json(resposta)
    }
}

export { LogarUsuariosControllers }