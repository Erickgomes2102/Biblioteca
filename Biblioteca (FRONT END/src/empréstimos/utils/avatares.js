export const AVATARES = [
  { codigo: "avatar_1", emoji: "🐱" },
  { codigo: "avatar_2", emoji: "🐶" },
  { codigo: "avatar_3", emoji: "🦊" },
  { codigo: "avatar_4", emoji: "🐼" },
  { codigo: "avatar_5", emoji: "🦉" },
  { codigo: "avatar_6", emoji: "🐧" },
  { codigo: "avatar_7", emoji: "🦁" },
  { codigo: "avatar_8", emoji: "🐸" },
  { codigo: "avatar_9", emoji: "📚" },
  { codigo: "avatar_10", emoji: "🎓" },
  { codigo: "avatar_11", emoji: "🧑‍💻" },
  { codigo: "avatar_12", emoji: "🧑‍🏫" },
];

export function emojiDoAvatar(codigo) {
  return AVATARES.find((a) => a.codigo === codigo)?.emoji || "👤";
}