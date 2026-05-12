class Categoria {
    constructor(
        idCategoria, 
        cpfUso,
        nomeCategoria,
        tipoCategoria,
        descCategoria,
        importanciaCategoria,
    ) {
        this.idCategoria = idCategoria
        this.cpfUso = cpfUso
        this.nomeCategoria = nomeCategoria
        this.tipoCategoria = tipoCategoria
        this.descCategoria = descCategoria
        this.importanciaCategoria = importanciaCategoria
    }
}

module.exports = Categoria