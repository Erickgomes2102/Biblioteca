import { PrismaClient } from "@prisma/client"

interface CadUsuarios { 
    nome: string,
    email: string,
    senha: string,
    tipo: string
}

class UsuariosServices {
     async cadastrarUsuario({nome, email, senha, tipo}: CadUsuarios) {
        
     }
}