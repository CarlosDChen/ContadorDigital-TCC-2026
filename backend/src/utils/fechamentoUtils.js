// Quantos dias antes do fim do mes o painel passa a avisar que o mes vai fechar no vermelho
const DIAS_AVISO_FECHAMENTO = 5

// RD-10: valores monetarios sempre com 2 casas decimais
const arredondar = (valor) => Math.round(valor * 100) / 100

// Monta o fechamento do mes a partir dos lançamentos dele (objetos Valor).
// Se o saldo estiver negativo, recomenda quais faturas (gastos com juros por atraso
// informado) deixar para o proximo mes: começa pela de juros mais baixo e vai
// separando ate cobrir o que falta. Em empate de juros, a de maior valor vem antes,
// pra resolver com o menor numero de faturas adiadas
const calcularFechamentoMensal = (valoresDoMes, hoje) => {
    const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
    const diasParaFechar = ultimoDiaDoMes - hoje.getDate()

    const renda = arredondar(valoresDoMes
        .filter((valor) => valor.receitaDespesa === 1)
        .reduce((soma, valor) => soma + Number(valor.valorValor), 0))

    const gastos = arredondar(valoresDoMes
        .filter((valor) => valor.receitaDespesa === 0)
        .reduce((soma, valor) => soma + Number(valor.valorValor), 0))

    // RD-01: Fluxo de Caixa = Receitas - Despesas
    const saldo = arredondar(renda - gastos)
    const deficit = saldo < 0 ? -saldo : 0

    const faturas = valoresDoMes
        .filter((valor) => valor.receitaDespesa === 0 && valor.jurosValor !== null)
        .sort((a, b) =>
            Number(a.jurosValor) - Number(b.jurosValor) ||
            Number(b.valorValor) - Number(a.valorValor)
        )

    const recomendacoes = []
    let totalAdiado = 0
    let jurosEstimados = 0

    for (const fatura of faturas) {
        if (totalAdiado >= deficit) {
            break
        }

        const valor = Number(fatura.valorValor)
        const juros = Number(fatura.jurosValor)
        const jurosEstimado = arredondar(valor * juros / 100)

        recomendacoes.push({
            idValor: fatura.idValor,
            nomeValor: fatura.nomeValor,
            valorValor: valor,
            jurosValor: juros,
            jurosEstimado
        })

        totalAdiado = arredondar(totalAdiado + valor)
        jurosEstimados = arredondar(jurosEstimados + jurosEstimado)
    }

    return {
        renda,
        gastos,
        saldo,
        noVermelho: saldo < 0,
        diasParaFechar,
        emFechamento: diasParaFechar < DIAS_AVISO_FECHAMENTO,
        recomendacoes,
        totalAdiado,
        jurosEstimados,
        saldoAposAdiar: arredondar(saldo + totalAdiado)
    }
}

module.exports = { calcularFechamentoMensal }
