const pool = require('../config/db')
const { dataDeHoje, somarDias, diasEntre } = require('../utils/dataUtils')

const DIAS_DE_ANTECEDENCIA = 2

const buscarGastosComAviso = async (idUsuario) => {
    const hoje = dataDeHoje()
    const parametros = [somarDias(hoje, DIAS_DE_ANTECEDENCIA), hoje]

    if (idUsuario !== undefined) {
        parametros.push(idUsuario)
    }

    const resultado = await pool.query(
        `select v.*, marcado.idmarcado,
                (marcado.contagemjuros = 1 and marcado.taxajuros > 0
                  and marcado.dataprevpag is not null and marcado.dataprevpag < $2
                  and substring(v.dataentra, 1, 6) = to_char(
                    to_date(substring(marcado.dataentramarcado, 1, 6) || '01', 'YYYYMMDD') + interval '1 month', 'YYYYMM'
                  )) as pedenovadata,
                (v.idpendente is null and semencargos.pede is true) as pedeencargos
         from valores v
         left join previsao p on p.idgasto = v.idvalor
         left join lateral (
             select c.idvalor as idmarcado, c.dataentra as dataentramarcado, pm.contagemjuros, pm.taxajuros, pm.dataprevpag
             from valores c
             join previsao pm on pm.idgasto = c.idvalor
             where v.idpendente is not null
               and (c.idvalor = v.idpendente or c.idpendente = v.idpendente)
               and c.dataentra < v.dataentra
               and pm.pago = 0
               and pm.datanaopago is not null
             order by c.dataentra desc
             limit 1
         ) marcado on true
         left join lateral (
             select true as pede
             from valores r
             left join previsao pr on pr.idgasto = r.idvalor
             where r.idvalor = coalesce(v.idpendente, v.idvalor)
               and r.idpendente is null
               and r.datavenc is not null
               and r.datavenc < $2
               and (pr.idprevisao is null or (pr.pago = 0 and pr.datanaopago is null))
               and not exists (
                 select 1 from valores c
                 join previsao pc on pc.idgasto = c.idvalor
                 where c.idpendente = r.idvalor
                   and (pc.pago = 1 or pc.datanaopago is not null)
               )
         ) semencargos on true
         where v.rescdespes = 0
           and v.datavenc is not null
           and v.datavenc <= $1
           and (p.idprevisao is null or p.pago = 0)
           and (
             (v.idpendente is null and semencargos.pede is true)
             or (
               semencargos.pede is null
               and not exists (
                 select 1 from valores levado
                 where levado.idpendente = coalesce(v.idpendente, v.idvalor)
                   and levado.dataentra > v.dataentra
               )
             )
           )
           ${idUsuario !== undefined ? 'and v.idusuario = $3' : ''}
         order by v.datavenc, v.idvalor`,
        parametros
    )

    return resultado.rows.map((linha) => {
        let pedido = null
        let idGastoDoPedido = null

        if (linha.pedenovadata) {
            pedido = 'novaDataPagamento'
            idGastoDoPedido = linha.idmarcado
        } else if (linha.pedeencargos) {
            pedido = 'informarEncargos'
            idGastoDoPedido = linha.idvalor
        }

        return {
            linha,
            situacao: linha.datavenc < hoje ? 'vencido' : 'aVencer',
            diasParaVencer: diasEntre(hoje, linha.datavenc),
            pedido,
            idGastoDoPedido
        }
    })
}

module.exports = { buscarGastosComAviso }
