import React from "react";
import { cores } from "../../empréstimos/styles/tema";
import { emojiDoAvatar } from "../../empréstimos/utils/avatares";

const API_URL = "http://localhost:3334";

export default function Avatar({ avatar, tamanho = 34 }) {
  const ehImagem = avatar && !avatar.startsWith("avatar_");

  const srcImagem = ehImagem
    ? avatar.startsWith("http")
      ? avatar
      : `${API_URL}${avatar}`
    : null;

  return (
    <span
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: "50%",
        overflow: "hidden",
        background: cores.lataoClaro,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: tamanho * 0.5,
        flexShrink: 0,
      }}
    >
      {ehImagem ? (
        <img
          src={srcImagem}
          alt="Avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            console.error("Erro ao carregar avatar:", srcImagem);
          }}
        />
      ) : (
        emojiDoAvatar(avatar)
      )}
    </span>
  );
}