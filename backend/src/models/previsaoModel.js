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
    #dataOriginal
    #dataVencimento
    #dataNaoPago
    #dataPago
    #tipoJuros

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
        pago,
        dataOriginal,
        dataVencimento,
        dataNaoPago,
        dataPago,
        tipoJuros
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
        this.#dataOriginal = dataOriginal
        this.#dataVencimento = dataVencimento
        this.#dataNaoPago = dataNaoPago
        this.#dataPago = dataPago
        this.#tipoJuros = tipoJuros
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

    get dataOriginal() {
        return this.#dataOriginal
    }

    set dataOriginal(valor) {
        this.#dataOriginal = valor
    }

    get dataVencimento() {
        return this.#dataVencimento
    }

    set dataVencimento(valor) {
        this.#dataVencimento = valor
    }

    get dataNaoPago() {
        return this.#dataNaoPago
    }

    set dataNaoPago(valor) {
        this.#dataNaoPago = valor
    }

    get dataPago() {
        return this.#dataPago
    }

    set dataPago(valor) {
        this.#dataPago = valor
    }

    get tipoJuros() {
        return this.#tipoJuros
    }

    set tipoJuros(valor) {
        this.#tipoJuros = valor
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
            pago: this.#pago,
            dataOriginal: this.#dataOriginal,
            dataVencimento: this.#dataVencimento,
            dataNaoPago: this.#dataNaoPago,
            dataPago: this.#dataPago,
            tipoJuros: this.#tipoJuros
        }
    }
}

module.exports = Previsao
