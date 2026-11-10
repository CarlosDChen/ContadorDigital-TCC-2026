const { dataDeHoje } = require('../utils/dataUtils')

const SELECT_PREVISAO_EM_ABERTO = `
    select v.idvalor, v.idusuario, v.idcatego, v.valorvalor, coalesce(v.recorvalor, 0), c.imporcatego, 0, '0.00', v.valorvalor,
           v.dataentra, v.datavenc, 0, 0,
           case when v.datavenc is not null and v.datavenc < $1 then 2 else 0 end
    from valores v
    left join categoria c on c.idcatego = v.idcatego
    where v.rescdespes = 0`

const INSERT_PREVISAO = `
    insert into previsao (idgasto, idusuario, idcatego, valororiginal, serepete, importancia, taxajuros, valorjuros, valortotal,
                          dataoriginal, datavenc, tipojuros, pago, situacao)`

const criarPrevisaoEmAberto = async (cliente, idGasto) => {
    await cliente.query(
        `${INSERT_PREVISAO}
         ${SELECT_PREVISAO_EM_ABERTO}
           and v.idvalor = $2
         on conflict (idgasto) do nothing`,
        [dataDeHoje(), idGasto]
    )
}

const criarPrevisoesEmAbertoFaltantes = async (cliente) => {
    const resultado = await cliente.query(
        `${INSERT_PREVISAO}
         ${SELECT_PREVISAO_EM_ABERTO}
           and not exists (select 1 from previsao p where p.idgasto = v.idvalor)
         on conflict (idgasto) do nothing`,
        [dataDeHoje()]
    )

    return resultado.rowCount
}

module.exports = { criarPrevisaoEmAberto, criarPrevisoesEmAbertoFaltantes }
