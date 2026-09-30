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


const router = Router();


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

router.get(
    "/ListarUsuarios",
    authMiddleware,
    usuarios.listarUsuarios
);

router.get(
    "/BuscarUsuario/:id_usuarios",
    authMiddleware,
    usuarios.buscarUsuarioPorId
);

router.put(
    "/EditarUsuario/:id_usuarios",
    authMiddleware,
    usuarios.editarUsuario
);

router.delete(
    "/ExcluirUsuario/:id_usuarios",
    usuarios.excluirUsuario
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
    authMiddleware,
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
    authMiddleware,
    leitores.editarLeitor
);


router.delete(
    "/RemoverLeitor/:id_leitores",
    authMiddleware,
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


export default router;