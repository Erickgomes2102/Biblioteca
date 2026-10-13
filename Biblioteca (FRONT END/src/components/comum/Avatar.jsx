
import React from "react";
import { cores } from "../../empréstimos/styles/tema";
import { UserRound } from "lucide-react";
import { imagemDoAvatar } from "../../empréstimos/utils/avatares";

const API_URL = "http://localhost:3334";

export default function Avatar({ avatar, tamanho = 34 }) {
  const ehAvatarPredefinido =
    typeof avatar === "string" && avatar.startsWith("avatar_");

  const imagemPredefinida = ehAvatarPredefinido
    ? imagemDoAvatar(avatar)
    : null;

  const ehImagemPersonalizada =
    typeof avatar === "string" &&
    avatar.trim() !== "" &&
    !ehAvatarPredefinido;

  const srcImagem = imagemPredefinida
    ? imagemPredefinida
    : ehImagemPersonalizada
      ? avatar.startsWith("http")
        ? avatar
        : `${API_URL}${avatar}`
      : null;

  if (!srcImagem) {
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
          flexShrink: 0,
        }}
      >
        <UserRound
          size={tamanho * 0.58}
          strokeWidth={1.8}
          color="#6B7280"
        />
      </span>
    );
  }

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
        flexShrink: 0,
      }}
    >
      <img
        src={srcImagem}
        alt="Avatar do usuário"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          console.error("Erro ao carregar avatar:", srcImagem);
          e.currentTarget.style.display = "none";
          e.currentTarget.parentElement.style.background = "#E5E7EB";
          e.currentTarget.parentElement.style.color = "#6B7280";
        }}
      />
    </span>
  );
}
