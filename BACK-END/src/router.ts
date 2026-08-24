import { Router } from "express";
import { categoriaController } from "./Controllers/categoriasControllers";

const router = Router()
router.post('/CadastrarCategorias', new categoriaController().cadastrarCategorias)
router.get('/ListarCategorias', new categoriaController().listarCategorias)
router.get('/BuscarCategorias/:id_categorias', new categoriaController().buscarCategorias)
router.put('/EditarCategorias/:id_categorias', new categoriaController().editarCategorias)
router.delete('/ExcluirCategorias/:id_categorias', new categoriaController().excluirCategorias)

export default router