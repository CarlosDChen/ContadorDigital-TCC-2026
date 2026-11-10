const pool = require('../config/db')
const { dataDeHoje } = require('../utils/dataUtils')
const { CAMPOS_DA_ORIGEM, atualizarValorDaPendencia } = require('../services/pendenciaService')
const { calcularEncargos } = require('../services/encargosService')

const buscarPendenciaDoMesAtual = async (gasto, anoMesAtual) => {
    const resultado = await pool.query(
        `select v.idvalor, v.valorvalor, v.datavenc, v.dataentra, p.pago, p.datanaopago
         from valores v
         left join previsao p on p.idgasto = v.idvalor
         where v.idpendente = $1
           and v.dataentra > $2
           and v.dataentra like $3
         order by v.dataentra desc
         limit 1`,
        [gasto.idpendente || gasto.idvalor, gasto.dataentra, anoMesAtual + '%']
    )

    return resultado.rows[0] || null
}

const existeMarcacaoMaisRecente = async (gasto, pendencia) => {
    const resultado = await pool.query(
        `select 1
         from valores v
         join previsao p on p.idgasto = v.idvalor
         where v.idpendente = $1
           and v.dataentra > $2
           and v.dataentra < $3
           and p.pago = 0
           and p.datanaopago is not null
         limit 1`,
        [gasto.idpendente || gasto.idvalor, gasto.dataentra, pendencia.dataentra]
    )

    return resultado.rows.length > 0
}

const atualizarJurosDiarios = async () => {
    const hoje = dataDeHoje()

    const resultado = await pool.query(
        `select v.*, origem.valorvalor as valorbase, prevorigem.valormulta as multaorigem,
                p.idprevisao, p.tipojuros, p.tipojurossc, p.taxajuros, p.valortotal, p.valormulta as multaprevisao,
                ${CAMPOS_DA_ORIGEM}
         from previsao p
         join valores v on v.idvalor = p.idgasto
         left join valores origem on origem.idvalor = v.idpendente
         left join previsao prevorigem on prevorigem.idgasto = v.idpendente
         where p.pago = 0
           and p.datanaopago is not null
           and p.contagemjuros = 1
           and (p.dataprevpag is null or p.dataprevpag < $1)
           and p.taxajuros > 0
           and v.datavenc is not null`,
        [hoje]
    )

    for (const gasto of resultado.rows) {
        const pendencia = await buscarPendenciaDoMesAtual(gasto, hoje.slice(0, 6))

        if (!pendencia || Number(pendencia.pago) === 1 || pendencia.datanaopago) {
            continue
        }

        if (await existeMarcacaoMaisRecente(gasto, pendencia)) {
            continue
        }

        const { valorJuros, valorTotal } = calcularEncargos(gasto, {
            tipoJuros: Number(gasto.tipojuros),
            tipoJurosSC: Number(gasto.tipojurossc),
            taxaJuros: Number(gasto.taxajuros),
            contagemJuros: 1,
            formaMulta: 0,
            taxaMulta: Number(gasto.multaprevisao || 0)
        }, hoje)

        const total = valorTotal.toFixed(2)

        if (total === Number(pendencia.valorvalor).toFixed(2) || total.length > 12) {
            continue
        }

        await pool.query(
            'update previsao set valorjuros = $1, valortotal = $2 where idprevisao = $3',
            [valorJuros.toFixed(2), total, gasto.idprevisao]
        )
        await atualizarValorDaPendencia(pool, pendencia.idvalor, total, pendencia.datavenc)

        console.log(`Juros pro rata atualizados: idvalor=${gasto.idvalor}, pendência idvalor=${pendencia.idvalor}, total=${total}`)
    }
}

module.exports = { atualizarJurosDiarios }
