class Categoria {
    #idCategoria
    #idUsuario
    #nomeCategoria
    #tipoCategoria
    #descCategoria
    #importanciaCategoria
    #idTemplate

    constructor(
        idCategoria,
        idUsuario,
        nomeCategoria,
        tipoCategoria,
        descCategoria,
        importanciaCategoria,
        idTemplate
    ) {
        this.#idCategoria = idCategoria
        this.#idUsuario = idUsuario
        this.#nomeCategoria = nomeCategoria
        this.#tipoCategoria = tipoCategoria
        this.#descCategoria = descCategoria
        this.#importanciaCategoria = importanciaCategoria
        this.#idTemplate = idTemplate
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

    // Liga essa categoria de volta a linha correspondente em categoria_padrao
    // (null quando a categoria foi criada manualmente pelo usuario, sem padrao de origem)
    get idTemplate() {
        return this.#idTemplate
    }

    set idTemplate(valor) {
        this.#idTemplate = valor
    }

    toJSON() {
        return {
            idCategoria: this.#idCategoria,
            idUsuario: this.#idUsuario,
            nomeCategoria: this.#nomeCategoria,
            tipoCategoria: this.#tipoCategoria,
            descCategoria: this.#descCategoria,
            importanciaCategoria: this.#importanciaCategoria,
            idTemplate: this.#idTemplate
        }
    }
}

module.exports = Categoria
