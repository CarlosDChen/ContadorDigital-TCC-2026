const { dataDeHoje, mesSeguinte, somarMeses, diferencaEmMeses, diaNoMes } = require('../utils/dataUtils')
const { criarPrevisaoEmAberto } = require('./previsaoService')

const MESES_A_FRENTE = 12

const ultimoMesGerado = (template) => template.mesrecor || template.dataentra.slice(0, 6)

const limiteDeUmAno = (anoMesBase) => {
    const anoMesAtual = dataDeHoje().slice(0, 6)
    return somarMeses(anoMesBase > anoMesAtual ? anoMesBase : anoMesAtual, MESES_A_FRENTE)
}

const proximaDataDaCopia = (template) =>
    diaNoMes(mesSeguinte(ultimoMesGerado(template)), template.dataentra.slice(6, 8))

const temMesesParaGerar = (template) =>
    !template.datafinal || proximaDataDaCopia(template) <= template.datafinal

const gerarCopiasDoRecorrente = async (cliente, template, anoMesLimite) => {
    const anoMesTemplate = template.dataentra.slice(0, 6)
    const diaTemplate = template.dataentra.slice(6, 8)
    let anoMes = mesSeguinte(ultimoMesGerado(template))
    let ultimoMesProcessado = null

    while (anoMes <= anoMesLimite) {
        const dataDaCopia = diaNoMes(anoMes, diaTemplate)

        if (template.datafinal && dataDaCopia > template.datafinal) {
            break
        }

        const jaGerado = await cliente.query(
            'select 1 from valores where idorigem = $1 and dataentra like $2',
            [template.idvalor, anoMes + '%']
        )

        if (jaGerado.rows.length === 0) {
            const dataVencimentoDaCopia = template.datavenc
                ? diaNoMes(
                    somarMeses(template.datavenc.slice(0, 6), diferencaEmMeses(anoMesTemplate, anoMes)),
                    template.datavenc.slice(6, 8)
                )
                : null

            const copia = await cliente.query(
                `insert into valores (idusuario, idcatego, nomevalor, valorvalor, recorvalor, rescdespes, dataentra, datafinal, discri, idorigem, datavenc)
                 values ($1, $2, $3, $4, 0, $5, $6, null, $7, $8, $9)
                 returning idvalor`,
                [
                    template.idusuario,
                    template.idcatego,
                    template.nomevalor,
                    template.valorvalor,
                    template.rescdespes,
                    dataDaCopia,
                    template.discri,
                    template.idvalor,
                    dataVencimentoDaCopia
                ]
            )

            await criarPrevisaoEmAberto(cliente, copia.rows[0].idvalor)
        }

        ultimoMesProcessado = anoMes
        anoMes = mesSeguinte(anoMes)
    }

    if (ultimoMesProcessado) {
        await cliente.query(
            'update valores set mesrecor = $1 where idvalor = $2',
            [ultimoMesProcessado, template.idvalor]
        )
        template.mesrecor = ultimoMesProcessado
    }

    return ultimoMesGerado(template)
}

const gerarCopiasDoPrimeiroAno = (cliente, template) =>
    gerarCopiasDoRecorrente(cliente, template, limiteDeUmAno(template.dataentra.slice(0, 6)))

const renovarPorMaisUmAno = (cliente, template) =>
    gerarCopiasDoRecorrente(cliente, template, limiteDeUmAno(ultimoMesGerado(template)))

const encerrarRepeticao = async (cliente, template) => {
    const dataFinal = diaNoMes(ultimoMesGerado(template), template.dataentra.slice(6, 8))

    await cliente.query('update valores set datafinal = $1 where idvalor = $2', [dataFinal, template.idvalor])

    return dataFinal
}

const buscarRecorrentesNoFim = async (cliente, idUsuario) => {
    const anoMesAtual = dataDeHoje().slice(0, 6)
    const resultado = await cliente.query(
        'select * from valores where recorvalor = 1 and idusuario = $1 order by dataentra, idvalor',
        [idUsuario]
    )

    return resultado.rows
        .filter((template) => ultimoMesGerado(template) <= anoMesAtual && temMesesParaGerar(template))
        .map((template) => ({
            template,
            ultimoMes: ultimoMesGerado(template),
            acabou: ultimoMesGerado(template) < anoMesAtual
        }))
}

const copiasSeguintesEmAberto = async (cliente, idDaSerie, dataEntrada, idUsuario) => {
    const resultado = await cliente.query(
        `select c.idvalor
         from valores c
         where c.idorigem = $1
           and c.dataentra > $2
           and c.idusuario = $3
           and not exists (
             select 1 from previsao p
             where p.idgasto = c.idvalor and (p.pago = 1 or p.datanaopago is not null)
           )
           and not exists (
             select 1 from valores pend
             join previsao pp on pp.idgasto = pend.idvalor
             where pend.idpendente = c.idvalor and (pp.pago = 1 or pp.datanaopago is not null)
           )`,
        [idDaSerie, dataEntrada, idUsuario]
    )

    return resultado.rows.map((linha) => linha.idvalor)
}

const apagarCopiasSeguintesEmAberto = async (cliente, idDaSerie, dataEntrada, idUsuario) => {
    const ids = await copiasSeguintesEmAberto(cliente, idDaSerie, dataEntrada, idUsuario)

    if (ids.length > 0) {
        await cliente.query('delete from valores where idpendente = any($1::bigint[])', [ids])
        await cliente.query('delete from valores where idvalor = any($1::bigint[])', [ids])
    }

    return ids.length
}

const passarRepeticaoParaAProximaCopia = async (cliente, template) => {
    const resultado = await cliente.query(
        'select idvalor from valores where idorigem = $1 order by dataentra, idvalor limit 1',
        [template.idvalor]
    )

    if (resultado.rows.length === 0) {
        return null
    }

    const idNovo = resultado.rows[0].idvalor

    await cliente.query(
        'update valores set recorvalor = 1, mesrecor = $1, datafinal = $2, idorigem = null where idvalor = $3',
        [template.mesrecor, template.datafinal, idNovo]
    )
    await cliente.query(
        'update valores set idorigem = $1 where idorigem = $2 and idvalor <> $1',
        [idNovo, template.idvalor]
    )

    return idNovo
}

const atualizarCopiasFuturasEmAberto = async (cliente, template, dados) => {
    const resultado = await cliente.query(
        `update valores c
         set nomevalor = $1, valorvalor = $2, idcatego = $3
         where c.idorigem = $4
           and c.dataentra > $5
           and not exists (
             select 1 from previsao p
             where p.idgasto = c.idvalor and (p.pago = 1 or p.datanaopago is not null)
           )
           and not exists (select 1 from valores pend where pend.idpendente = c.idvalor)
         returning c.idvalor`,
        [dados.nomeValor, dados.valorValor, dados.idCategoria, template.idvalor, dataDeHoje()]
    )

    return resultado.rows.map((linha) => linha.idvalor)
}

module.exports = {
    ultimoMesGerado,
    gerarCopiasDoRecorrente,
    gerarCopiasDoPrimeiroAno,
    renovarPorMaisUmAno,
    encerrarRepeticao,
    buscarRecorrentesNoFim,
    apagarCopiasSeguintesEmAberto,
    passarRepeticaoParaAProximaCopia,
    atualizarCopiasFuturasEmAberto
}
