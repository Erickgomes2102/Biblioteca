const resposta = await api.get("/ListarCategorias");
setCategorias(resposta.data);

const resposta = await api.post(
    "/CadastrarCategorias",
    { nome }
);

await api.put(
    `/EditarCategorias/${id_categorias}`,
    { nome }
);

await api.delete(
    `/ExcluirCategorias/${id_categorias}`
);