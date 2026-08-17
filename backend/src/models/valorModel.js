class Valor {
    #idValor
    #idUsuario
    #idCategoria
    #nomeValor
    #valorValor
    #recorValor
    #receitaDespesa
    #dataEntrada
    #discricao

    constructor(
        idValor,
        idUsuario,
        idCategoria,
        nomeValor,
        valorValor,
        recorValor,
        receitaDespesa,
        dataEntrada,
        discricao
    ) {
        this.#idValor = idValor
        this.#idUsuario = idUsuario
        this.#idCategoria = idCategoria
        this.#nomeValor = nomeValor
        this.#valorValor = valorValor
        this.#recorValor = recorValor
        this.#receitaDespesa = receitaDespesa
        this.#dataEntrada = dataEntrada
        this.#discricao = discricao
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

    get discricao() {
        return this.#discricao
    }

    set discricao(valor) {
        this.#discricao = valor
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
            discricao: this.#discricao
        }
    }
}

module.exports = Valor
