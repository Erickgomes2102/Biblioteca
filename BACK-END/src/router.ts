import { Router } from "express";

import { uploadAvatar } from "./Middleware/uploadAvatar";

import { authMiddleware } from "./Middleware/authMiddleware";

import { categoriaController } from "./Controllers/categoriasControllers";

import { livrosController } from "./Controllers/livrosControllers";

import { usuariosController } from "./Controllers/usuariosControllers";

import { leitoresController } from "./Controllers/leitoresControllers";

import { emprestimosController } from "./Controllers/emprestimosControllers";

import { dashboardController } from "./Controllers/dashboardControllers";

import { LogarUsuariosControllers } from "./Controllers/loginusuariosControllers";

import { avatarController } from "./Controllers/perfilsControllers";

import { adminMiddleware } from "./Middleware/adminMiddleware";

import { mensagensController } from "./Controllers/mensagensControllers";
const router = Router();
const mensagens = new mensagensController();

// =====================
// LOGIN
// =====================

const login = new LogarUsuariosControllers();

router.post(
    "/Login",
    login.loginUsuarios
);


// =====================
// USUÁRIOS
// =====================

const usuarios = new usuariosController();

router.post(
    "/CadastrarUsuario",
    usuarios.criarUsuario
);



// =====================
// LIVROS
// =====================

const livros = new livrosController();

router.post(
    "/CadastrarLivro",
    authMiddleware,
    livros.criarLivro
);

router.get(
    "/ListarLivros",
    authMiddleware,
    livros.listarLivros
);

router.get(
    "/BuscarLivro/:id_livros",
    authMiddleware,
    livros.buscarLivroPorId
);

router.put(
    "/EditarLivro/:id_livros",
    authMiddleware,
    livros.editarLivro
);

router.delete(
    "/ExcluirLivro/:id_livros",
    authMiddleware, adminMiddleware,
    livros.excluirLivro
);


// =====================
// LEITORES
// =====================

const leitores = new leitoresController();

router.post(
    "/CriarLeitores",
    authMiddleware,
    leitores.criarLeitor
);

router.get(
    "/ListarLeitores",
    authMiddleware,
    leitores.listarLeitores
);

router.get(
    "/BuscarLeitor/:id_leitores",
    authMiddleware,
    leitores.buscarLeitorPorId
);

router.put(
    "/EditarLeitores/:id_leitores",
    authMiddleware, adminMiddleware,
    leitores.editarLeitor
);

router.delete(
    "/RemoverLeitor/:id_leitores",
    authMiddleware, adminMiddleware,
    leitores.excluirLeitor
);


// =====================
// CATEGORIAS
// =====================

const categorias = new categoriaController();

router.post(
    "/CadastrarCategorias",
    authMiddleware,
    categorias.cadastrarCategorias
);

router.get(
    "/ListarCategorias",
    authMiddleware,
    categorias.listarCategorias
);

router.get(
    "/BuscarCategorias/:id_categorias",
    authMiddleware,
    categorias.buscarCategorias
);

router.put(
    "/EditarCategorias/:id_categorias",
    authMiddleware,
    categorias.editarCategorias
);


// =====================
// EMPRÉSTIMOS
// =====================

const emprestimos = new emprestimosController();

router.post(
    "/CriarEmprestimos",
    authMiddleware,
    emprestimos.criarEmprestimo
);

router.get(
    "/ListarEmprestimo",
    authMiddleware,
    emprestimos.listarEmprestimos
);

router.get(
    "/BuscarEmprestimo/:id_emprestimo",
    authMiddleware,
    emprestimos.buscarEmprestimoPorId
);

router.get(
    "/ListarEmprestimos/Ativos",
    authMiddleware,
    emprestimos.listarEmprestimosAtivos
);

router.get(
    "/ListarEmprestimosAtrasados",
    authMiddleware,
    emprestimos.listarEmprestimosAtrasados
);

router.patch(
    "/DevolverLivro/:id_emprestimo",
    authMiddleware,
    emprestimos.devolverLivro
);

router.get(
    "/CalcularMulta/:id_emprestimo",
    authMiddleware,
    emprestimos.calcularMulta
);

router.patch(
    "/CancelarEmprestimo/:id_emprestimo",
    authMiddleware,
    emprestimos.cancelarEmprestimo
);

router.patch("/PagarMulta/:id_emprestimo", authMiddleware, emprestimos.marcarMultaComoPaga)




// =====================
// DASHBOARD
// =====================

router.get(
    "/Dashboard",
    authMiddleware,
    new dashboardController().obterEstatisticas
);


// =====================
// PERFIL AVATAR
// =====================

router.post(
    "/MeuPerfil/Avatar",
    authMiddleware,
    uploadAvatar.single("avatar"),
    new avatarController().salvarAvatar
);

router.delete(
    "/MeuPerfil/Avatar/:id_usuarios",
    authMiddleware,
    new avatarController().removerAvatar
);

router.get("/Administracao/Usuarios", authMiddleware, adminMiddleware, new usuariosController().listarUsuarios)

router.get("/Administracao/Usuarios/:id_usuarios", authMiddleware, adminMiddleware, new usuariosController().buscarUsuarioPorId)

router.put("/Administracao/Usuarios/Editar/:id_usuarios", authMiddleware, adminMiddleware, new usuariosController().editarUsuario)

router.put("/EditarUsuario/:id", authMiddleware, new usuariosController().editarMeuPerfil )
router.patch("/Administracao/Usuarios/Privilegio/:id_usuarios/", authMiddleware, adminMiddleware, new usuariosController().alterarPrivilegio)

router.delete("/Administracao/Usuarios/Deletar/:id_usuarios", authMiddleware, adminMiddleware, new usuariosController().excluirUsuario)
router.delete("/MeuPerfil/DesativarConta/:id_usuarios", authMiddleware, new usuariosController().excluirUsuario)

router.patch(
    "/CancelarSuspensao/:id_leitores", authMiddleware, new leitoresController().cancelarSuspensao
);

router.delete("/ExcluirEmprestimo/:id_emprestimo", authMiddleware, new emprestimosController().excluirEmprestimo)


router.get(
    "/Mensagens/Contatos",
    authMiddleware,
    mensagens.listarContatos
);

router.get(
    "/Mensagens/Conversas",
    authMiddleware,
    mensagens.listarConversas
);

router.post(
    "/Mensagens/Conversas",
    authMiddleware,
    mensagens.obterOuCriarConversa
);

router.get(
    "/Mensagens/Conversas/:id_conversa",
    authMiddleware,
    mensagens.listarMensagens
);

router.post(
    "/Mensagens/Conversas/:id_conversa",
    authMiddleware,
    mensagens.enviarMensagem
);

router.patch(
    "/Mensagens/Conversas/:id_conversa/Lidas",
    authMiddleware,
    mensagens.marcarComoLidas
);
export default router;