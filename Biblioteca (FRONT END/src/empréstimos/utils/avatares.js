
export const AVATARES = [
  { codigo: "avatar_1", imagem: "/avatares/avatar_1.jpg" },
  { codigo: "avatar_2", imagem: "/avatares/avatar_2.jpg" },
  { codigo: "avatar_3", imagem: "/avatares/avatar_3.jpg" },
  { codigo: "avatar_4", imagem: "/avatares/avatar_4.jpg" },
  { codigo: "avatar_5", imagem: "/avatares/avatar_5.jpg" },
  { codigo: "avatar_6", imagem: "/avatares/avatar_6.jpg" },
  { codigo: "avatar_7", imagem: "/avatares/avatar_7.jpg" },
  { codigo: "avatar_8", imagem: "/avatares/avatar_8.jpg" },
  { codigo: "avatar_9", imagem: "/avatares/avatar_9.jpg" },
  { codigo: "avatar_10", imagem: "/avatares/avatar_10.jpg" },
  { codigo: "avatar_11", imagem: "/avatares/avatar_11.jpg" },
  { codigo: "avatar_12", imagem: "/avatares/avatar_12.jpg" },
];

export function imagemDoAvatar(codigo) {
  return AVATARES.find((avatar) => avatar.codigo === codigo)?.imagem ?? null;
}
