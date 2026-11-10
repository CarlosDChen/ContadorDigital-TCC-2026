const pool = require('../config/db')
const { dataDeHoje } = require('../utils/dataUtils')

const marcarContasAtrasadas = async () => {
    const resultado = await pool.query(
        `update previsao
         set situacao = 2
         where pago = 0
           and situacao = 0
           and datavenc is not null
           and datavenc < $1`,
        [dataDeHoje()]
    )

    if (resultado.rowCount > 0) {
        console.log(`Contas marcadas como atrasadas: ${resultado.rowCount}`)
    }
}

module.exports = { marcarContasAtrasadas }
