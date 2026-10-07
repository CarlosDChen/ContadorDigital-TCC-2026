const pool = require('../config/db')
const Previsao = require('../models/previsaoModel')

const linhaParaPrevisao = (linha) => new Previsao(
  linha.idprevisao,
  linha.idgasto,
  linha.idusuario,
  linha.idcatego,
  linha.valororiginal,
  linha.serepete,
  linha.importancia,
  linha.taxajuros,
  linha.valorjuros,
  linha.valortotal,
  linha.pago
)

// O usuario vem sempre do token da sessao (req.idUsuario), nunca da URL ou do corpo
const listarPrevisoesPorUsuario = async (req, res) => {
  const resultado = await pool.query(
    'select * from previsao where idusuario = $1 order by idprevisao',
    [req.idUsuario]
  )

  res.status(200).json(resultado.rows.map(linhaParaPrevisao))
}

// Cria (ou atualiza, se o gasto ja tiver previsao) a previsao de juros simples de um gasto
const criarPrevisao = async (req, res) => {
  const idUsuario = req.idUsuario
  const { idGasto, taxaJuros } = req.body

  if (!idGasto) {
    return res.status(400).json({
      erro: 'idGasto e obrigatorio'
    })
  }

  const taxa = Number(taxaJuros)

  if (taxaJuros === undefined || taxaJuros === null || Number.isNaN(taxa) || taxa < 0 || taxa > 999.99) {
    return res.status(400).json({
      erro: 'Os juros por atraso devem ser um percentual entre 0 e 999,99'
    })
  }

  // Filtra pelo usuario tambem, pra ninguem criar previsao em gasto de outra pessoa
  const resultadoGasto = await pool.query(
    `select v.*, c.imporcatego
     from valores v
     left join categoria c on c.idcatego = v.idcatego
     where v.idvalor = $1 and v.idusuario = $2`,
    [idGasto, idUsuario]
  )

  if (resultadoGasto.rows.length === 0) {
    return res.status(404).json({
      erro: 'Gasto nao encontrado para este usuario'
    })
  }

  const gasto = resultadoGasto.rows[0]

  if (gasto.rescdespes !== 0) {
    return res.status(400).json({
      erro: 'Previsao de juros so pode ser feita para gastos'
    })
  }

  const valorOriginal = Number(gasto.valorvalor)
  const valorJuros = Math.round(valorOriginal * taxa) / 100
  const valorTotal = Math.round((valorOriginal + valorJuros) * 100) / 100

  const resultado = await pool.query(
    `insert into previsao (idgasto, idusuario, idcatego, valororiginal, serepete, importancia, taxajuros, valorjuros, valortotal)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     on conflict (idgasto) do update set
       idcatego = excluded.idcatego,
       valororiginal = excluded.valororiginal,
       serepete = excluded.serepete,
       importancia = excluded.importancia,
       taxajuros = excluded.taxajuros,
       valorjuros = excluded.valorjuros,
       valortotal = excluded.valortotal
     returning *`,
    [
      gasto.idvalor,
      gasto.idusuario,
      gasto.idcatego,
      valorOriginal.toFixed(2),
      gasto.recorvalor || 0,
      gasto.imporcatego,
      taxa,
      valorJuros.toFixed(2),
      valorTotal.toFixed(2)
    ]
  )

  res.status(201).json({
    mensagem: 'Previsao salva com sucesso',
    previsao: linhaParaPrevisao(resultado.rows[0])
  })
}

module.exports = {
  listarPrevisoesPorUsuario,
  criarPrevisao
}
