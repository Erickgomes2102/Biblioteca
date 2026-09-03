await api.post("/CadastrarUsuario", {
    nome,
    email,
    senha,
    tipo
});

const resposta = await api.get("/ListarUsuarios");
setUsuarios(resposta.data);

await api.get(`/BuscarUsuario/${id_usuarios}`);
await api.get(
    `/BuscarUsuario/email/${email}`
);

await api.put(
    `/EditarUsuario/${id_usuarios}`,
    dados
);
await api.delete(
    `/ExcluirUsuario/${id_usuarios}`
);