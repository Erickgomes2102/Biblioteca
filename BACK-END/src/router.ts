import { Router } from "express";
import { categoriaController } from "./Controllers/categoriasControllers";
import { livrosController } from "./Controllers/livrosControllers";
import { usuariosController } from "./Controllers/usuariosControllers";
import { leitoresController } from "./Controllers/leitoresControllers";
import { emprestimosController } from "./Controllers/emprestimosControllers";
import { dashboardController } from "./Controllers/dashboardControllers";
import { authMiddleware } from "./Middleware/authMiddleware";
import { LogarUsuariosControllers } from "./Controllers/loginusuariosControllers";

const router = Router()

router.post("/login", new LogarUsuariosControllers().loginUsuarios)
// Categorias 
router.post('/CadastrarCategorias', authMiddleware, new categoriaController().cadastrarCategorias)
router.get('/ListarCategorias', authMiddleware, new categoriaController().listarCategorias)
router.get('/BuscarCategorias/:id_categorias', authMiddleware, new categoriaController().buscarCategorias)
router.put('/EditarCategorias/:id_categorias', authMiddleware, new categoriaController().editarCategorias)
router.delete('/ExcluirCategorias/:id_categorias', authMiddleware, new categoriaController().excluirCategorias)

// Livros
router.post('/CadastrarLivro', authMiddleware, new livrosController().criarLivro)
router.get('/ListarLivros', authMiddleware, new livrosController().listarLivros)
router.put('/EditarLivro/:id_livros', authMiddleware, new livrosController().editarLivro)
router.get('/BuscarLivro/isbn/:isbn', authMiddleware, new livrosController().buscarLivroPorISBN)
router.get('/BuscarLivro/:id_livros', authMiddleware, new livrosController().buscarLivroPorId)
router.delete('/ExcluirLivro/:id_livros', authMiddleware, new livrosController().excluirLivro)

// Usuarios
router.post('/CadastrarUsuario', new usuariosController().criarUsuario)
router.get('/ListarUsuarios', authMiddleware, new usuariosController().listarUsuarios)
router.get('/BuscarUsuario/:id_usuarios', authMiddleware, new usuariosController().buscarUsuarioPorId)
router.get('/BuscarUsuario/email/:email', authMiddleware, new usuariosController().buscarUsuarioPorEmail)
router.put('/EditarUsuario/:id_usuarios', authMiddleware, new usuariosController().editarUsuario)
router.delete('/ExcluirUsuario/:id_usuarios', authMiddleware, new usuariosController().excluirUsuario)

// Leitores
router.post('/CriarLeitores', authMiddleware, new leitoresController().criarLeitor)
router.get('/ListarLeitores', authMiddleware, new leitoresController().listarLeitores)
router.get('/BuscarLeitor/CPF/:cpf', authMiddleware, new leitoresController().buscarLeitorPorCPF)
router.get('/BuscarLeitor/:id_leitores',  authMiddleware, new leitoresController().buscarLeitorPorId)
router.delete('/RemoverLeitor/:id_leitores', authMiddleware, new leitoresController().excluirLeitor)
router.put('/EditarLeitores/:id_leitores', authMiddleware, new leitoresController().editarLeitor)

// Emprestimo
router.post('/CriarEmprestimos', authMiddleware, new emprestimosController().criarEmprestimo)
router.get('/ListarEmprestimo', authMiddleware, new emprestimosController().listarEmprestimos)
router.get('/BuscarEmprestimo/:id_emprestimo', authMiddleware, new emprestimosController().buscarEmprestimoPorId)
router.get('/ListarEmprestimos/Ativos', authMiddleware, new emprestimosController().listarEmprestimosAtivos)
router.get('/ListarEmprestimosAtrasados',  authMiddleware, new emprestimosController().listarEmprestimosAtrasados)
router.patch('/DevolverLivro/:id_emprestimo', authMiddleware, new emprestimosController().devolverLivro)
router.get('/CalcularMulta/:id_emprestimo', authMiddleware, new emprestimosController().calcularMulta)
router.patch('/CancelarEmprestimo/:id_emprestimo', authMiddleware, new emprestimosController().cancelarEmprestimo)

//Dashboard
router.get('/Dashboard', new dashboardController().obterEstatisticas)



export default router