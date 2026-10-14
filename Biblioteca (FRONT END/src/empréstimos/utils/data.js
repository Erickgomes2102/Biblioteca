
export function fmtData(data) {
  if (!data) return "Data não informada";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return "Data inválida";
  }

  return dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}
