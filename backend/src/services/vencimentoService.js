const pool = require('../config/db')
const { dataDeHoje, somarDias, diasEntre } = require('../utils/dataUtils')

const DIAS_DE_ANTECEDENCIA = 2

const buscarGastosComAviso = async (idUsuario) => {
    const hoje = dataDeHoje()
    const parametros = [somarDias(hoje, DIAS_DE_ANTECEDENCIA)]

    if (idUsuario !== undefined) {
        parametros.push(idUsuario)
    }

    const resultado = await pool.query(
        `select v.*
         from valores v
         left join previsao p on p.idgasto = v.idvalor
         where v.rescdespes = 0
           and v.datavenc is not null
           and v.datavenc <= $1
           and (p.idprevisao is null or p.pago = 0)
           and not exists (
             select 1 from valores levado
             where levado.idpendente = coalesce(v.idpendente, v.idvalor)
               and levado.dataentra > v.dataentra
           )
           ${idUsuario !== undefined ? 'and v.idusuario = $2' : ''}
         order by v.datavenc, v.idvalor`,
        parametros
    )

    return resultado.rows.map((linha) => ({
        linha,
        situacao: linha.datavenc < hoje ? 'vencido' : 'aVencer',
        diasParaVencer: diasEntre(hoje, linha.datavenc)
    }))
}

module.exports = { buscarGastosComAviso }
