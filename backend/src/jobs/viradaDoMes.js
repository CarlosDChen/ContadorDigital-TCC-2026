const pool = require('../config/db')
const { dataDeHoje } = require('../utils/dataUtils')
const { CAMPOS_DA_ORIGEM, buscarPendenciaSeguinte, criarPendenciaSeguinte } = require('../services/pendenciaService')

const levarPendentesParaOMesSeguinte = async (anoMesAtual) => {
    const pendentes = await pool.query(
        `select v.*, p.valorjuros, ${CAMPOS_DA_ORIGEM}
         from previsao p
         join valores v on v.idvalor = p.idgasto
         left join valores origem on origem.idvalor = v.idpendente
         where p.pago = 0
           and substring(v.dataentra, 1, 6) < $1`,
        [anoMesAtual]
    )

    for (const gasto of pendentes.rows) {
        if (await buscarPendenciaSeguinte(pool, gasto)) {
            continue
        }

        const valorComJuros = (Number(gasto.valorvalor) + Number(gasto.valorjuros || 0)).toFixed(2)

        if (valorComJuros.length > 12) {
            console.error(`Pendência do gasto idvalor=${gasto.idvalor} passou do limite de valor e não foi levada`)
            continue
        }

        await criarPendenciaSeguinte(pool, gasto, valorComJuros)

        console.log(`Gasto não pago levado para o mês seguinte: idvalor=${gasto.idvalor}`)
    }
}

const marcarGastosAnterioresComoPagos = async (anoMesAtual) => {
    const resultado = await pool.query(
        `insert into previsao (idgasto, idusuario, idcatego, valororiginal, serepete, importancia, taxajuros, valorjuros, valortotal,
                               dataoriginal, datavenc, datapago, tipojuros, pago)
         select v.idvalor, v.idusuario, v.idcatego, v.valorvalor, coalesce(v.recorvalor, 0), c.imporcatego, 0, '0.00', v.valorvalor,
                v.dataentra, v.datavenc,
                to_char(to_date(substring(v.dataentra, 1, 6) || '01', 'YYYYMMDD') + interval '1 month', 'YYYYMMDD'),
                0, 1
         from valores v
         left join categoria c on c.idcatego = v.idcatego
         where v.rescdespes = 0
           and substring(v.dataentra, 1, 6) < $1
           and not exists (select 1 from previsao p where p.idgasto = v.idvalor)
         on conflict (idgasto) do nothing`,
        [anoMesAtual]
    )

    if (resultado.rowCount > 0) {
        console.log(`Gastos de meses anteriores marcados como pagos: ${resultado.rowCount}`)
    }
}

const processarViradaDoMes = async () => {
    const anoMesAtual = dataDeHoje().slice(0, 6)

    await levarPendentesParaOMesSeguinte(anoMesAtual)
    await marcarGastosAnterioresComoPagos(anoMesAtual)
}

module.exports = { processarViradaDoMes }
