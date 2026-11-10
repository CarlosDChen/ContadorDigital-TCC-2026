const { dataDeHoje, mesSeguinte, somarMeses, diferencaEmMeses, diaNoMes } = require('../utils/dataUtils')
const { criarPrevisaoEmAberto } = require('./previsaoService')
const { calcularEncargos } = require('./encargosService')

const CAMPOS_DA_ORIGEM = `
    coalesce(origem.nomevalor, v.nomevalor) as nomeorigem,
    coalesce(origem.dataentra, v.dataentra) as dataorigem,
    coalesce(origem.discri, v.discri) as discriorigem,
    coalesce(origem.datavenc, v.datavenc) as datavencorigem`

const CAMPOS_PARA_LEVAR = `
    v.*, p.pago, p.datanaopago, p.valortotal, p.dataprevpag,
    origem.valorvalor as valorbase, prevorigem.valormulta as multaorigem,
    ${CAMPOS_DA_ORIGEM}`

const JUNCOES_PARA_LEVAR = `
    from valores v
    left join previsao p on p.idgasto = v.idvalor
    left join valores origem on origem.idvalor = v.idpendente
    left join previsao prevorigem on prevorigem.idgasto = v.idpendente`

const buscarEncargosDaCadeia = async (cliente, gasto) => {
    const resultado = await cliente.query(
        `select p.tipojuros, p.tipojurossc, p.taxajuros, p.contagemjuros, p.valormulta
         from valores c
         join previsao p on p.idgasto = c.idvalor
         where (c.idvalor = $1 or c.idpendente = $1)
           and c.dataentra < $2
           and p.pago = 0
           and p.datanaopago is not null
         order by c.dataentra desc
         limit 1`,
        [gasto.idpendente, gasto.dataentra]
    )

    return resultado.rows[0] || null
}

const valorDaPendenciaSeguinte = async (cliente, gasto, hoje) => {
    if (gasto.datanaopago) {
        return { valor: Number(gasto.valortotal || gasto.valorvalor), vencimento: gasto.dataprevpag || null }
    }

    if (!gasto.idpendente) {
        const aindaNoPrazo = gasto.datavenc && gasto.datavenc >= hoje
        return { valor: Number(gasto.valorvalor), vencimento: aindaNoPrazo ? gasto.datavenc : null }
    }

    const encargosDaCadeia = await buscarEncargosDaCadeia(cliente, gasto)

    if (!encargosDaCadeia || !(Number(encargosDaCadeia.taxajuros) > 0)) {
        return { valor: Number(gasto.valorvalor), vencimento: null }
    }

    const encargos = {
        tipoJuros: Number(encargosDaCadeia.tipojuros),
        tipoJurosSC: Number(encargosDaCadeia.tipojurossc || 0),
        taxaJuros: Number(encargosDaCadeia.taxajuros),
        contagemJuros: Number(encargosDaCadeia.contagemjuros || 0),
        formaMulta: 0,
        taxaMulta: Number(gasto.multaorigem || 0)
    }

    if (encargos.contagemJuros === 1) {
        const contaOriginal = { valorvalor: gasto.valorbase, idpendente: null, datavenc: gasto.datavencorigem }
        return { valor: calcularEncargos(contaOriginal, encargos, hoje).valorTotal, vencimento: null }
    }

    return { valor: calcularEncargos(gasto, encargos, hoje).valorTotal, vencimento: null }
}

const buscarPendenciaSeguinte = async (cliente, gasto) => {
    const resultado = await cliente.query(
        `select v.idvalor, p.pago, p.datanaopago
         from valores v
         left join previsao p on p.idgasto = v.idvalor
         where v.idpendente = $1 and v.dataentra like $2`,
        [gasto.idpendente || gasto.idvalor, mesSeguinte(gasto.dataentra.slice(0, 6)) + '%']
    )

    return resultado.rows[0] || null
}

const vencimentoPadraoDaPendencia = (gasto, anoMesDestino) =>
    gasto.datavencorigem
        ? diaNoMes(
            somarMeses(gasto.datavencorigem.slice(0, 6), diferencaEmMeses(gasto.dataorigem.slice(0, 6), anoMesDestino)),
            gasto.datavencorigem.slice(6, 8)
        )
        : null

const criarPendenciaSeguinte = async (cliente, gasto, valorComJuros, dataVencimentoInformada) => {
    const anoMesDestino = mesSeguinte(gasto.dataentra.slice(0, 6))
    const mesAnoOrigem = gasto.dataorigem.slice(4, 6) + '/' + gasto.dataorigem.slice(2, 4)
    const nomePendencia = gasto.nomeorigem.slice(0, 98) + ' (pendente de ' + mesAnoOrigem + ')'
    const dataVencimento = dataVencimentoInformada || vencimentoPadraoDaPendencia(gasto, anoMesDestino)

    const resultado = await cliente.query(
        `insert into valores (idusuario, idcatego, nomevalor, valorvalor, recorvalor, rescdespes, dataentra, datafinal, discri, idorigem, datavenc, idpendente)
         values ($1, $2, $3, $4, 0, 0, $5, null, $6, null, $7, $8)
         returning idvalor`,
        [
            gasto.idusuario,
            gasto.idcatego,
            nomePendencia,
            valorComJuros,
            anoMesDestino + '01',
            gasto.discriorigem,
            dataVencimento,
            gasto.idpendente || gasto.idvalor
        ]
    )

    await criarPrevisaoEmAberto(cliente, resultado.rows[0].idvalor)

    return resultado.rows[0].idvalor
}

const atualizarValorDaPendencia = async (cliente, idPendencia, valorComJuros, dataVencimento) => {
    await cliente.query(
        `update valores
         set valorvalor = $1,
             datavenc = $2,
             avisovenc = case when datavenc is distinct from $2 then 0 else avisovenc end
         where idvalor = $3`,
        [valorComJuros, dataVencimento, idPendencia]
    )

    await cliente.query(
        `update previsao
         set valororiginal = $1, valortotal = $1, datavenc = $2, situacao = $3
         where idgasto = $4 and pago = 0 and datanaopago is null`,
        [valorComJuros, dataVencimento, dataVencimento && dataVencimento < dataDeHoje() ? 2 : 0, idPendencia]
    )
}

const salvarPendenciaSeguinte = async (cliente, gasto, valorComJuros, dataVencimentoInformada) => {
    const existente = await buscarPendenciaSeguinte(cliente, gasto)

    if (existente) {
        const dataVencimento = dataVencimentoInformada ||
            vencimentoPadraoDaPendencia(gasto, mesSeguinte(gasto.dataentra.slice(0, 6)))

        await atualizarValorDaPendencia(cliente, existente.idvalor, valorComJuros, dataVencimento)
        return existente.idvalor
    }

    return criarPendenciaSeguinte(cliente, gasto, valorComJuros, dataVencimentoInformada)
}

const estaEmAberto = (linha) => linha.pago === null || (Number(linha.pago) === 0 && !linha.datanaopago)

const atualizarPendenciasEmAbertoSeguintes = async (cliente, gasto) => {
    const hoje = dataDeHoje()
    const resultado = await cliente.query(
        `select ${CAMPOS_PARA_LEVAR}
         ${JUNCOES_PARA_LEVAR}
         where v.idpendente = $1 and v.dataentra > $2
         order by v.dataentra, v.idvalor`,
        [gasto.idpendente || gasto.idvalor, gasto.dataentra]
    )
    const cadeia = resultado.rows

    for (let i = 0; i + 1 < cadeia.length; i++) {
        const atual = cadeia[i]
        const seguinte = cadeia[i + 1]

        if (!estaEmAberto(atual) || !estaEmAberto(seguinte)) {
            return
        }

        const { valor } = await valorDaPendenciaSeguinte(cliente, atual, hoje)
        const valorTexto = valor.toFixed(2)

        if (valorTexto.length > 12) {
            return
        }

        await atualizarValorDaPendencia(cliente, seguinte.idvalor, valorTexto, seguinte.datavenc)
        seguinte.valorvalor = valorTexto
    }
}

const existePendenciaPosteriorNaoPaga = async (cliente, gasto) => {
    const resultado = await cliente.query(
        `select 1
         from valores v
         join previsao p on p.idgasto = v.idvalor
         where v.idpendente = $1
           and v.dataentra > $2
           and p.pago = 0
           and p.datanaopago is not null
         limit 1`,
        [gasto.idpendente || gasto.idvalor, gasto.dataentra]
    )

    return resultado.rows.length > 0
}

const removerPendenciaSeguinte = async (cliente, gasto) => {
    await cliente.query(
        `delete from valores v
         where v.idpendente = $1
           and v.dataentra > $2
           and not exists (
             select 1 from previsao p
             where p.idgasto = v.idvalor
               and (p.pago = 1 or p.datanaopago is not null)
           )`,
        [gasto.idpendente || gasto.idvalor, gasto.dataentra]
    )
}

module.exports = {
    CAMPOS_DA_ORIGEM,
    CAMPOS_PARA_LEVAR,
    JUNCOES_PARA_LEVAR,
    valorDaPendenciaSeguinte,
    buscarPendenciaSeguinte,
    criarPendenciaSeguinte,
    atualizarValorDaPendencia,
    salvarPendenciaSeguinte,
    atualizarPendenciasEmAbertoSeguintes,
    existePendenciaPosteriorNaoPaga,
    removerPendenciaSeguinte
}
