class Previsao {
    #idPrevisao
    #idGasto
    #idUsuario
    #idCategoria
    #valorOriginal
    #seRepete
    #importancia
    #taxaJuros
    #valorJuros
    #valorTotal
    #pago

    constructor(
        idPrevisao,
        idGasto,
        idUsuario,
        idCategoria,
        valorOriginal,
        seRepete,
        importancia,
        taxaJuros,
        valorJuros,
        valorTotal,
        pago
    ) {
        this.#idPrevisao = idPrevisao
        this.#idGasto = idGasto
        this.#idUsuario = idUsuario
        this.#idCategoria = idCategoria
        this.#valorOriginal = valorOriginal
        this.#seRepete = seRepete
        this.#importancia = importancia
        this.#taxaJuros = taxaJuros
        this.#valorJuros = valorJuros
        this.#valorTotal = valorTotal
        this.#pago = pago
    }

    get idPrevisao() {
        return this.#idPrevisao
    }

    set idPrevisao(valor) {
        this.#idPrevisao = valor
    }

    get idGasto() {
        return this.#idGasto
    }

    set idGasto(valor) {
        this.#idGasto = valor
    }

    get idUsuario() {
        return this.#idUsuario
    }

    set idUsuario(valor) {
        this.#idUsuario = valor
    }

    get idCategoria() {
        return this.#idCategoria
    }

    set idCategoria(valor) {
        this.#idCategoria = valor
    }

    get valorOriginal() {
        return this.#valorOriginal
    }

    set valorOriginal(valor) {
        this.#valorOriginal = valor
    }

    get seRepete() {
        return this.#seRepete
    }

    set seRepete(valor) {
        this.#seRepete = valor
    }

    get importancia() {
        return this.#importancia
    }

    set importancia(valor) {
        this.#importancia = valor
    }

    // Juros por atraso em % ao mes (juros simples)
    get taxaJuros() {
        return this.#taxaJuros
    }

    set taxaJuros(valor) {
        this.#taxaJuros = valor
    }

    get valorJuros() {
        return this.#valorJuros
    }

    set valorJuros(valor) {
        this.#valorJuros = valor
    }

    get valorTotal() {
        return this.#valorTotal
    }

    set valorTotal(valor) {
        this.#valorTotal = valor
    }

    get pago() {
        return this.#pago
    }

    set pago(valor) {
        this.#pago = valor
    }

    toJSON() {
        return {
            idPrevisao: this.#idPrevisao,
            idGasto: this.#idGasto,
            idUsuario: this.#idUsuario,
            idCategoria: this.#idCategoria,
            valorOriginal: this.#valorOriginal,
            seRepete: this.#seRepete,
            importancia: this.#importancia,
            taxaJuros: this.#taxaJuros,
            valorJuros: this.#valorJuros,
            valorTotal: this.#valorTotal,
            pago: this.#pago
        }
    }
}

module.exports = Previsao
