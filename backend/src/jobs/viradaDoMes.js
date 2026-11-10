const pool = require('../config/db')
const { dataDeHoje } = require('../utils/dataUtils')
const {
    CAMPOS_PARA_LEVAR,
    JUNCOES_PARA_LEVAR,
    valorDaPendenciaSeguinte,
    criarPendenciaSeguinte
} = require('../services/pendenciaService')
const { criarPrevisoesEmAbertoFaltantes } = require('../services/previsaoService')

const MAXIMO_DE_PASSADAS = 36

const buscarContasParaLevar = async (anoMesAtual) => {
    const resultado = await pool.query(
        `select ${CAMPOS_PARA_LEVAR}
         ${JUNCOES_PARA_LEVAR}
         where v.rescdespes = 0
           and substring(v.dataentra, 1, 6) < $1
           and (p.idprevisao is null or p.pago = 0)
           and not exists (
             select 1 from valores seguinte
             where seguinte.idpendente = coalesce(v.idpendente, v.idvalor)
               and seguinte.dataentra like to_char(
                 to_date(substring(v.dataentra, 1, 6) || '01', 'YYYYMMDD') + interval '1 month', 'YYYYMM'
               ) || '%'
           )
         order by v.dataentra, v.idvalor`,
        [anoMesAtual]
    )

    return resultado.rows
}

const levarContasNaoPagasParaOMesSeguinte = async (anoMesAtual) => {
    const hoje = dataDeHoje()
    const ignorados = new Set()

    for (let passada = 0; passada < MAXIMO_DE_PASSADAS; passada++) {
        const contas = (await buscarContasParaLevar(anoMesAtual)).filter((gasto) => !ignorados.has(String(gasto.idvalor)))

        if (contas.length === 0) {
            return
        }

        for (const gasto of contas) {
            const { valor, vencimento } = await valorDaPendenciaSeguinte(pool, gasto, hoje)
            const valorTexto = valor.toFixed(2)

            if (valorTexto.length > 12) {
                ignorados.add(String(gasto.idvalor))
                console.error(`Pendência do gasto idvalor=${gasto.idvalor} passou do limite de valor e não foi levada`)
                continue
            }

            await criarPendenciaSeguinte(pool, gasto, valorTexto, vencimento)

            console.log(`Conta não paga levada para o mês seguinte: idvalor=${gasto.idvalor}, valor=${valorTexto}`)
        }
    }
}

const processarViradaDoMes = async () => {
    const anoMesAtual = dataDeHoje().slice(0, 6)

    const criadas = await criarPrevisoesEmAbertoFaltantes(pool)

    if (criadas > 0) {
        console.log(`Previsões em aberto criadas para gastos sem previsão: ${criadas}`)
    }

    await levarContasNaoPagasParaOMesSeguinte(anoMesAtual)
}

module.exports = { processarViradaDoMes }
