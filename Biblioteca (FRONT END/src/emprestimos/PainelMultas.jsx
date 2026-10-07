import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  CalendarDays
} from "lucide-react";

import {
  cores
} from "../empréstimos/styles/tema";

export default function PainelMultas({
  multas = [],
  onConsultar
}) {

  const formatarDinheiro = (valor) => {

    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

  };


  const formatarData = (data) => {

    if (!data) return "-";

    return new Date(data).toLocaleDateString(
      "pt-BR"
    );

  };


  if (!multas.length) {

    return (

      <div
        style={{
          padding: 20,
          textAlign: "center",
          color: cores.tintaSuave
        }}
      >

        <CheckCircle2
          size={28}
          style={{
            marginBottom: 8
          }}
        />

        <div>
          Nenhuma multa encontrada.
        </div>

      </div>

    );

  }


  return (

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10
      }}
    >

      {multas.map((multa) => {

        const valor =
          Number(multa.multa || 0);

        const paga =
          emprestimo.multaRegistro?.status === "PAGA";


        return (

          <div
            key={
              multa.id_emprestimo
            }

            style={{
              border:
                `1px solid ${
                  paga
                    ? cores.linha
                    : cores.carimbo
                }`,

              borderRadius: 6,

              padding: 14,

              background:
                cores.papel
            }}
          >

            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                gap: 10
              }}
            >

              <div>

                <strong
                  style={{
                    fontSize: 14
                  }}
                >

                  {multa.livro ||
                    "Livro não encontrado"}

                </strong>


                <div
                  style={{
                    marginTop: 4,
                    color:
                      cores.tintaSuave,
                    fontSize: 12
                  }}
                >

                  {multa.leitor ||
                    "Leitor não encontrado"}

                </div>

              </div>


              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,

                  color:
                    paga
                      ? cores.verdeOk
                      : cores.carimbo,

                  fontSize: 12,
                  fontWeight: 600
                }}
              >

                {paga ? (

                  <CheckCircle2
                    size={14}
                  />

                ) : (

                  <AlertTriangle
                    size={14}
                  />

                )}

                {paga
                  ? "PAGA"
                  : "PENDENTE"}

              </div>

            </div>


            {/* =================================================
                INFORMAÇÕES
            ================================================= */}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,

                marginTop: 12,

                color:
                  cores.tintaSuave,

                fontSize: 12
              }}
            >

              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >

                <CalendarDays
                  size={13}
                />

                Prevista:{" "}

                {formatarData(
                  multa.data_prevista
                )}

              </span>


              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >

                <DollarSign
                  size={13}
                />

                Multa:{" "}

                <strong
                  style={{
                    color:
                      paga
                        ? cores.verdeOk
                        : cores.carimbo
                  }}
                >

                  {formatarDinheiro(
                    valor
                  )}

                </strong>

              </span>

            </div>


            {/* =================================================
                BOTÃO CONSULTAR
            ================================================= */}

            {onConsultar && (

              <button
                onClick={() =>
                  onConsultar(
                    multa.id_emprestimo
                  )
                }

                style={{
                  marginTop: 12,

                  width: "100%",

                  border:
                    `1px solid ${cores.linha}`,

                  background:
                    "transparent",

                  color:
                    cores.tinta,

                  borderRadius: 5,

                  padding: "7px 10px",

                  cursor: "pointer",

                  fontSize: 12
                }}
              >

                Consultar multa

              </button>

            )}

          </div>

        );

      })}

    </div>

  );

}