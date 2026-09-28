import React from "react";
import { cores } from "../../empréstimos/styles/tema";
import { emojiDoAvatar } from "../../empréstimos/utils/avatares";

export default function Avatar({ avatar, tamanho = 34 }) {
  const ehImagem = avatar && !avatar.startsWith("avatar_");

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
          src={avatar}
          alt="Avatar"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        emojiDoAvatar(avatar)
      )}
    </span>
  );
}