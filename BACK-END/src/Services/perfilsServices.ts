import prismaClient from "../Prisma/PrismaClient";

class avatarServices {
  async salvarAvatar(
    id_usuarios: number,
    caminho: string
  ) {
    const usuario =
      await prismaClient.usuario.findUnique({
        where: {
          id_usuarios,
        },
      });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    const usuarioAtualizado =
      await prismaClient.usuario.update({
        where: {
          id_usuarios,
        },

        data: {
          avatar: caminho,
        },

        select: {
          id_usuarios: true,
          nome: true,
          email: true,
          tipo: true,
          avatar: true,
        },
      });

    return usuarioAtualizado;
  }

  async removerAvatar(id_usuarios: number) {
    const usuario =
      await prismaClient.usuario.findUnique({
        where: {
          id_usuarios,
        },
      });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    const usuarioAtualizado =
      await prismaClient.usuario.update({
        where: {
          id_usuarios,
        },

        data: {
          avatar: null,
        },

        select: {
          id_usuarios: true,
          nome: true,
          email: true,
          tipo: true,
          avatar: true,
        },
      });

    return usuarioAtualizado;
  }
}

export { avatarServices };