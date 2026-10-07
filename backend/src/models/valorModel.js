class Valor {
    #idValor
    #idUsuario
    #idCategoria
    #nomeValor
    #valorValor
    #recorValor
    #receitaDespesa
    #dataEntrada
    #dataFinal
    #discricao
    #idOrigem

    constructor(
        idValor,
        idUsuario,
        idCategoria,
        nomeValor,
        valorValor,
        recorValor,
        receitaDespesa,
        dataEntrada,
        dataFinal,
        discricao,
        idOrigem
    ) {
        this.#idValor = idValor
        this.#idUsuario = idUsuario
        this.#idCategoria = idCategoria
        this.#nomeValor = nomeValor
        this.#valorValor = valorValor
        this.#recorValor = recorValor
        this.#receitaDespesa = receitaDespesa
        this.#dataEntrada = dataEntrada
        this.#dataFinal = dataFinal
        this.#discricao = discricao
        this.#idOrigem = idOrigem
    }

    get idValor() {
        return this.#idValor
    }

    set idValor(valor) {
        this.#idValor = valor
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

    get nomeValor() {
        return this.#nomeValor
    }

    set nomeValor(valor) {
        this.#nomeValor = valor
    }

    get valorValor() {
        return this.#valorValor
    }

    set valorValor(valor) {
        this.#valorValor = valor
    }

    get recorValor() {
        return this.#recorValor
    }

    set recorValor(valor) {
        this.#recorValor = valor
    }

    get receitaDespesa() {
        return this.#receitaDespesa
    }

    set receitaDespesa(valor) {
        this.#receitaDespesa = valor
    }

    get dataEntrada() {
        return this.#dataEntrada
    }

    set dataEntrada(valor) {
        this.#dataEntrada = valor
    }

    // Data em que o lançamento recorrente deixa de se repetir (null = sem data final)
    get dataFinal() {
        return this.#dataFinal
    }

    set dataFinal(valor) {
        this.#dataFinal = valor
    }

    get discricao() {
        return this.#discricao
    }

    set discricao(valor) {
        this.#discricao = valor
    }

    // idValor do lançamento recorrente que originou este (null = lançamento normal/template)
    get idOrigem() {
        return this.#idOrigem
    }

    set idOrigem(valor) {
        this.#idOrigem = valor
    }

    toJSON() {
        return {
            idValor: this.#idValor,
            idUsuario: this.#idUsuario,
            idCategoria: this.#idCategoria,
            nomeValor: this.#nomeValor,
            valorValor: this.#valorValor,
            recorValor: this.#recorValor,
            receitaDespesa: this.#receitaDespesa,
            dataEntrada: this.#dataEntrada,
            dataFinal: this.#dataFinal,
            discricao: this.#discricao,
            idOrigem: this.#idOrigem
        }
    }
}

module.exports = Valor
