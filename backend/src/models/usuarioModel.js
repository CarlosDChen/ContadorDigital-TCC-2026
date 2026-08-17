class Usuario {
    #idUsuario
    #cpfUso
    #email
    #telefone
    #nomeUso
    #nomeFanUso
    #senhaUso

    constructor(
        idUsuario,
        cpfUso,
        email,
        telefone,
        nomeUso,
        nomeFanUso,
        senhaUso
    ) {
        this.#idUsuario = idUsuario
        this.#cpfUso = cpfUso
        this.#email = email
        this.#telefone = telefone
        this.#nomeUso = nomeUso
        this.#nomeFanUso = nomeFanUso
        this.#senhaUso = senhaUso
    }

    get idUsuario() {
        return this.#idUsuario
    }

    set idUsuario(valor) {
        this.#idUsuario = valor
    }

    get cpfUso() {
        return this.#cpfUso
    }

    set cpfUso(valor) {
        this.#cpfUso = valor
    }

    get email() {
        return this.#email
    }

    set email(valor) {
        this.#email = valor
    }

    get telefone() {
        return this.#telefone
    }

    set telefone(valor) {
        this.#telefone = valor
    }

    get nomeUso() {
        return this.#nomeUso
    }

    set nomeUso(valor) {
        this.#nomeUso = valor
    }

    get nomeFanUso() {
        return this.#nomeFanUso
    }

    set nomeFanUso(valor) {
        this.#nomeFanUso = valor
    }

    get senhaUso() {
        return this.#senhaUso
    }

    set senhaUso(valor) {
        this.#senhaUso = valor
    }

    toJSON() {
        return {
            idUsuario: this.#idUsuario,
            cpfUso: this.#cpfUso,
            email: this.#email,
            telefone: this.#telefone,
            nomeUso: this.#nomeUso,
            nomeFanUso: this.#nomeFanUso,
            senhaUso: this.#senhaUso
        }
    }
}

module.exports = Usuario
