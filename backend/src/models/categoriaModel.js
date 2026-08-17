class Categoria {
    #idCategoria
    #idUsuario
    #nomeCategoria
    #tipoCategoria
    #descCategoria
    #importanciaCategoria

    constructor(
        idCategoria,
        idUsuario,
        nomeCategoria,
        tipoCategoria,
        descCategoria,
        importanciaCategoria
    ) {
        this.#idCategoria = idCategoria
        this.#idUsuario = idUsuario
        this.#nomeCategoria = nomeCategoria
        this.#tipoCategoria = tipoCategoria
        this.#descCategoria = descCategoria
        this.#importanciaCategoria = importanciaCategoria
    }

    get idCategoria() {
        return this.#idCategoria
    }

    set idCategoria(valor) {
        this.#idCategoria = valor
    }

    get idUsuario() {
        return this.#idUsuario
    }

    set idUsuario(valor) {
        this.#idUsuario = valor
    }

    get nomeCategoria() {
        return this.#nomeCategoria
    }

    set nomeCategoria(valor) {
        this.#nomeCategoria = valor
    }

    get tipoCategoria() {
        return this.#tipoCategoria
    }

    set tipoCategoria(valor) {
        this.#tipoCategoria = valor
    }

    get descCategoria() {
        return this.#descCategoria
    }

    set descCategoria(valor) {
        this.#descCategoria = valor
    }

    get importanciaCategoria() {
        return this.#importanciaCategoria
    }

    set importanciaCategoria(valor) {
        this.#importanciaCategoria = valor
    }

    toJSON() {
        return {
            idCategoria: this.#idCategoria,
            idUsuario: this.#idUsuario,
            nomeCategoria: this.#nomeCategoria,
            tipoCategoria: this.#tipoCategoria,
            descCategoria: this.#descCategoria,
            importanciaCategoria: this.#importanciaCategoria
        }
    }
}

module.exports = Categoria
