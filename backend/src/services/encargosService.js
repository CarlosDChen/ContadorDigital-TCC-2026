const { diasEntre } = require('../utils/dataUtils')

const arredondar = (valor) => Math.round(valor * 100) / 100

const calcularMulta = (formaMulta, taxaMulta, valorOriginal) => {
    if (formaMulta === 0) {
        return arredondar(taxaMulta)
    }

    if (formaMulta === 1) {
        return arredondar(valorOriginal * taxaMulta / 100)
    }

    return 0
}

const diasDeAtraso = (dataVencimento, dataFinal) =>
    dataVencimento ? Math.max(diasEntre(dataVencimento, dataFinal), 0) : 0

const calcularJuros = (encargos, valorBase, dias) => {
    if (!encargos.taxaJuros) {
        return 0
    }

    const meses = encargos.contagemJuros === 1 ? dias / 30 : 1

    if (encargos.tipoJurosSC === 1) {
        return arredondar(valorBase * (Math.pow(1 + encargos.taxaJuros / 100, meses) - 1))
    }

    const jurosPorMes = encargos.tipoJuros === 0 ? encargos.taxaJuros : valorBase * encargos.taxaJuros / 100
    return arredondar(jurosPorMes * meses)
}

const calcularEncargos = (gasto, encargos, dataFinal) => {
    const valorAtual = Number(gasto.valorvalor)
    const ehPendencia = Boolean(gasto.idpendente)
    const valorOriginal = ehPendencia ? Number(gasto.valorbase) : valorAtual
    const multaJaCobrada = ehPendencia ? Number(gasto.multaorigem || 0) : 0
    const valorJurosPass = ehPendencia ? arredondar(Math.max(valorAtual - valorOriginal - multaJaCobrada, 0)) : 0
    const valorMulta = ehPendencia ? 0 : calcularMulta(encargos.formaMulta, encargos.taxaMulta, valorOriginal)
    const dias = encargos.contagemJuros === 1 ? diasDeAtraso(gasto.datavenc, dataFinal) : 0
    const valorBase = encargos.tipoJurosSC === 1 ? valorOriginal + valorJurosPass : valorOriginal
    const valorJuros = calcularJuros(encargos, valorBase, dias)

    return {
        valorMulta,
        valorJuros,
        valorJurosPass,
        dias,
        valorTotal: arredondar(valorAtual + valorMulta + valorJuros)
    }
}

const situacaoDaConta = (pago, dataVencimento, hoje) => {
    if (pago === 1) {
        return 1
    }

    return dataVencimento && dataVencimento < hoje ? 2 : 0
}

module.exports = {
    calcularEncargos,
    situacaoDaConta
}
