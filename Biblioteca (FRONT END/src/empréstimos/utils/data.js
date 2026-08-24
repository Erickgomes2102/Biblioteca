export const hoje = () => new Date().toISOString().slice(0, 10);

export const fmtData = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};