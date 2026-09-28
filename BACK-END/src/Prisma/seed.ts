import prismaClient from "./PrismaClient"
import { hash } from "bcryptjs";
async function main() {
    const senhaHash = await hash("admin123", 10);
     
    const categorias = [
        "Ficção",
        "Romance",
        "Fantasia",
        "Mistério",
        "História",
        "Biografia",
        "Ciências",
        "Tecnologia",
        "Filosofia",
        "Infantil",
        "Terror",
        "Ação",
        "Suspense"
    ]
    
        for (const nome of categorias) {

            await prismaClient.categoria.upsert({
                where: {
                    nome
                },
                update: {

                },
                create: {
                    nome
                }

            })
        }
        
    await prismaClient.usuario.upsert({
        where: {
            email: "admin@biblioteca.com"
        },
        update: {},
        create: {
            nome: "Administrador",
            email: "admin@biblioteca.com",
            senha: senhaHash,
            tipo: "ADMINISTRADOR"

        }
        

    })
}

main().catch((erro) => { console.error(erro), process.exit(1);}).finally(async () => { await prismaClient.$disconnect();});