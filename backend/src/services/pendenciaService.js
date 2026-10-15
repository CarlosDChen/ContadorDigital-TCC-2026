const { mesSeguinte, somarMeses, diferencaEmMeses, diaNoMes } = require('../utils/dataUtils')

const CAMPOS_DA_ORIGEM = `
    coalesce(origem.nomevalor, v.nomevalor) as nomeorigem,
    coalesce(origem.dataentra, v.dataentra) as dataorigem,
    coalesce(origem.discri, v.discri) as discriorigem,
    coalesce(origem.datavenc, v.datavenc) as datavencorigem`

const buscarPendenciaSeguinte = async (cliente, gasto) => {
    const resultado = await cliente.query(
        `select v.idvalor, p.pago
         from valores v
         left join previsao p on p.idgasto = v.idvalor
         where v.idpendente = $1 and v.dataentra like $2`,
        [gasto.idpendente || gasto.idvalor, mesSeguinte(gasto.dataentra.slice(0, 6)) + '%']
    )

    return resultado.rows[0] || null
}

const criarPendenciaSeguinte = async (cliente, gasto, valorComJuros) => {
    const anoMesDestino = mesSeguinte(gasto.dataentra.slice(0, 6))
    const mesAnoOrigem = gasto.dataorigem.slice(4, 6) + '/' + gasto.dataorigem.slice(2, 4)
    const nomePendencia = gasto.nomeorigem.slice(0, 98) + ' (pendente de ' + mesAnoOrigem + ')'
    const dataVencimento = gasto.datavencorigem
        ? diaNoMes(
            somarMeses(gasto.datavencorigem.slice(0, 6), diferencaEmMeses(gasto.dataorigem.slice(0, 6), anoMesDestino)),
            gasto.datavencorigem.slice(6, 8)
        )
        : null

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

    return resultado.rows[0].idvalor
}

const salvarPendenciaSeguinte = async (cliente, gasto, valorComJuros) => {
    const existente = await buscarPendenciaSeguinte(cliente, gasto)

    if (existente) {
        await cliente.query('update valores set valorvalor = $1 where idvalor = $2', [valorComJuros, existente.idvalor])
        return existente.idvalor
    }

    return criarPendenciaSeguinte(cliente, gasto, valorComJuros)
}

const removerPendenciaSeguinte = async (cliente, gasto) => {
    const existente = await buscarPendenciaSeguinte(cliente, gasto)

    if (existente) {
        await cliente.query('delete from valores where idvalor = $1', [existente.idvalor])
    }
}

module.exports = {
    CAMPOS_DA_ORIGEM,
    buscarPendenciaSeguinte,
    criarPendenciaSeguinte,
    salvarPendenciaSeguinte,
    removerPendenciaSeguinte
}
