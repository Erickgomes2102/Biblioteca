import prismaClient from "../Prisma/PrismaClient";

interface cadLivros {
    isbn: string,
    titulo: string,
    autor: string,
    editora: string,
    ano: number,
    quantidade: number
}

class livrosServices {

}

export { livrosServices }