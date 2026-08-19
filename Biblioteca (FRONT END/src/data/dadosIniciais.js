export const LIVROS_INICIAIS = [
  { id: 1, titulo: "Dom Casmurro", autor: "Machado de Assis", categoria: "Romance", total: 3, disponiveis: 2 },
  { id: 2, titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", categoria: "Infantil", total: 4, disponiveis: 4 },
  { id: 3, titulo: "1984", autor: "George Orwell", categoria: "Ficção", total: 2, disponiveis: 0 },
  { id: 4, titulo: "Capitães da Areia", autor: "Jorge Amado", categoria: "Romance", total: 2, disponiveis: 2 },
];

export const LEITORES_INICIAIS = [
  { id: 1, nome: "Ana Souza", turma: "9º Ano B", contato: "(14) 99999-0001" },
  { id: 2, nome: "Bruno Lima", turma: "8º Ano A", contato: "(14) 99999-0002" },
  { id: 3, nome: "Carla Melo", turma: "Professora", contato: "(14) 99999-0003" },
];

export const EMPRESTIMOS_INICIAIS = [
  { id: 1, livroId: 1, leitorId: 1, dataEmprestimo: "2026-08-05", dataPrevista: "2026-08-19", devolvido: false },
  { id: 2, livroId: 3, leitorId: 2, dataEmprestimo: "2026-07-20", dataPrevista: "2026-08-03", devolvido: false },
  { id: 3, livroId: 3, leitorId: 3, dataEmprestimo: "2026-07-01", dataPrevista: "2026-07-15", devolvido: true, dataDevolucao: "2026-07-14" },
];