const listarUsuarios = (req, res) => {
    const usuarios = [
        {
            idUsuario: 1,    
            nomeUso: "Joaquim"
        },
        {
            idUsuario: 2,
            nomeUso: "Maria"
        }
    ]
    res.json(usuarios)
}

module.exports = {
    listarUsuarios
}