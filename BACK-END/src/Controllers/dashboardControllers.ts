import { Request, Response } from "express"
import { dashboardServices } from "../Services/dashboardServices"

class dashboardController {

    async obterEstatisticas(req: Request, res: Response) {

        const service = new dashboardServices()

        const resposta = await service.obterEstatisticas()

        return res.json(resposta)
    }
}

export { dashboardController }