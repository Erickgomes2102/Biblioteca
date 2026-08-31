import { Router } from "express";
import { categoriaController } from "./Controllers/categoriasControllers";
import { livrosController } from "./Controllers/livrosControllers";
import { usuariosController } from "./Controllers/usuariosControllers";
import { leitoresController } from "./Controllers/leitoresControllers";
import { emprestimosController } from "./Controllers/emprestimosControllers";
import { dashboardController } from "./Controllers/dashboardControllers";

const router = Router()

// Categorias 
router.post('/CadastrarCategorias', new categoriaController().cadastrarCategorias)
router.get('/ListarCategorias', new categoriaController().listarCategorias)
router.get('/BuscarCategorias/:id_categorias', new categoriaController().buscarCategorias)
router.put('/EditarCategorias/:id_categorias', new categoriaController().editarCategorias)
router.delete('/ExcluirCategorias/:id_categorias', new categoriaController().excluirCategorias)

// Livros
router.post('/CadastrarLivro', new livrosController().criarLivro)
router.get('/ListarLivros', new livrosController().listarLivros)
router.put('/EditarLivro/:id_livros', new livrosController().editarLivro)
router.get('/BuscarLivro/isbn/:isbn', new livrosController().buscarLivroPorISBN)
router.get('/BuscarLivro/:id_livros', new livrosController().buscarLivroPorId)
router.delete('/ExcluirLivro/:id_livros', new livrosController().excluirLivro)

// Usuarios
router.post('/CadastrarUsuario', new usuariosController().criarUsuario)
router.get('/ListarUsuarios', new usuariosController().listarUsuarios)
router.get('/BuscarUsuario/:id_usuarios', new usuariosController().buscarUsuarioPorId)
router.get('/BuscarUsuario/email/:email', new usuariosController().buscarUsuarioPorEmail)
router.put('/EditarUsuario/:id_usuarios', new usuariosController().editarUsuario)
router.delete('/ExcluirUsuario/:id_usuarios', new usuariosController().excluirUsuario)

// Leitores
router.post('/CriarLeitores', new leitoresController().criarLeitor)
router.get('/ListarLeitores', new leitoresController().listarLeitores)
router.get('/BuscarLeitor/CPF/:cpf', new leitoresController().buscarLeitorPorCPF)
router.get('/BuscarLeitor/:id_leitores', new leitoresController().buscarLeitorPorId)
router.delete('/RemoverLeitor/:id_leitores', new leitoresController().excluirLeitor)
router.put('/EditarLeitores/:id_leitores', new leitoresController().editarLeitor)

// Emprestimo
router.post('/CriarEmprestimos', new emprestimosController().criarEmprestimo)
router.get('/ListarEmprestimo', new emprestimosController().listarEmprestimos)
router.get('/BuscarEmprestimo/:id_emprestimo', new emprestimosController().buscarEmprestimoPorId)
router.get('/ListarEmprestimos/Ativos', new emprestimosController().listarEmprestimosAtivos)
router.get('/ListarEmprestimosAtrasados', new emprestimosController().listarEmprestimosAtrasados)
router.patch('/DevolverLivro/:id_emprestimo', new emprestimosController().devolverLivro)
router.get('/CalcularMulta/:id_emprestimo', new emprestimosController().calcularMulta)
router.patch('/CancelarEmprestimo/:id_emprestimo', new emprestimosController().cancelarEmprestimo)

//Dashboard
router.get('/Dashboard', new dashboardController().obterEstatisticas)

export default router