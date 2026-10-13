const pool = require('../config/db')
const Previsao = require('../models/previsaoModel')
const { dataDeHoje } = require('../utils/dataUtils')
const {
  CAMPOS_DA_ORIGEM,
  buscarPendenciaSeguinte,
  salvarPendenciaSeguinte,
  removerPendenciaSeguinte
} = require('../services/pendenciaService')

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
  linha.pago,
  linha.dataoriginal,
  linha.datavenc,
  linha.datanaopago,
  linha.datapago,
  linha.tipojuros
)

// O usuario vem sempre do token da sessao (req.idUsuario), nunca da URL ou do corpo
const listarPrevisoesPorUsuario = async (req, res) => {
  const resultado = await pool.query(
    'select * from previsao where idusuario = $1 order by idprevisao',
    [req.idUsuario]
  )

  res.status(200).json(resultado.rows.map(linhaParaPrevisao))
}

const salvarPrevisao = async (cliente, idUsuario, dados) => {
  const { idGasto, taxaJuros, tipoJuros, pago } = dados

  if (!idGasto) {
    return { status: 400, erro: 'idGasto e obrigatorio' }
  }

  const tipo = tipoJuros === undefined || tipoJuros === null ? 1 : Number(tipoJuros)

  if (tipo !== 0 && tipo !== 1) {
    return { status: 400, erro: 'tipoJuros deve ser 0 (valor em R$) ou 1 (porcentagem)' }
  }

  const situacaoPago = pago === undefined || pago === null ? 0 : Number(pago)

  if (situacaoPago !== 0 && situacaoPago !== 1) {
    return { status: 400, erro: 'pago deve ser 0 (nao pago) ou 1 (pago)' }
  }

  const taxa = Number(taxaJuros)

  if (taxaJuros === undefined || taxaJuros === null || Number.isNaN(taxa) || taxa < 0 || taxa > 9999999999.99) {
    return { status: 400, erro: 'Os juros devem ser um valor entre 0 e 9.999.999.999,99' }
  }

  // Filtra pelo usuario tambem, pra ninguem criar previsao em gasto de outra pessoa
  const resultadoGasto = await cliente.query(
    `select v.*, c.imporcatego, origem.valorvalor as valorbase, ${CAMPOS_DA_ORIGEM}
     from valores v
     left join categoria c on c.idcatego = v.idcatego
     left join valores origem on origem.idvalor = v.idpendente
     where v.idvalor = $1 and v.idusuario = $2`,
    [idGasto, idUsuario]
  )

  if (resultadoGasto.rows.length === 0) {
    return { status: 404, erro: 'Gasto nao encontrado para este usuario' }
  }

  const gasto = resultadoGasto.rows[0]

  if (gasto.rescdespes !== 0) {
    return { status: 400, erro: 'Previsao de juros so pode ser feita para gastos' }
  }

  const valorAtual = Number(gasto.valorvalor)
  const valorBase = gasto.valorbase !== null ? Number(gasto.valorbase) : valorAtual
  const valorJuros = tipo === 0
    ? Math.round(taxa * 100) / 100
    : Math.round(valorBase * taxa) / 100
  const valorTotal = Math.round((valorAtual + valorJuros) * 100) / 100

  if (valorTotal.toFixed(2).length > 12) {
    return { status: 400, erro: 'O valor com juros passa do limite permitido' }
  }

  const pendenciaSeguinte = await buscarPendenciaSeguinte(cliente, gasto)

  if (situacaoPago === 1 && pendenciaSeguinte && pendenciaSeguinte.pago !== null && Number(pendenciaSeguinte.pago) === 0) {
    return {
      status: 409,
      erro: 'A pendencia deste gasto no mes seguinte ja esta marcada como nao paga. Desmarque ela primeiro.'
    }
  }

  const resultadoExistente = await cliente.query(
    'select pago, datanaopago, datapago from previsao where idgasto = $1',
    [gasto.idvalor]
  )
  const existente = resultadoExistente.rows[0]
  const hoje = dataDeHoje()

  const dataNaoPago = situacaoPago === 0
    ? (existente && Number(existente.pago) === 0 && existente.datanaopago ? existente.datanaopago : hoje)
    : (existente ? existente.datanaopago : null)

  const dataPago = situacaoPago === 1
    ? (existente && Number(existente.pago) === 1 && existente.datapago ? existente.datapago : hoje)
    : null

  const resultado = await cliente.query(
    `insert into previsao (idgasto, idusuario, idcatego, valororiginal, serepete, importancia, taxajuros, valorjuros, valortotal,
                           dataoriginal, datavenc, datanaopago, datapago, tipojuros, pago)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     on conflict (idgasto) do update set
       idcatego = excluded.idcatego,
       valororiginal = excluded.valororiginal,
       serepete = excluded.serepete,
       importancia = excluded.importancia,
       taxajuros = excluded.taxajuros,
       valorjuros = excluded.valorjuros,
       valortotal = excluded.valortotal,
       dataoriginal = excluded.dataoriginal,
       datavenc = excluded.datavenc,
       datanaopago = excluded.datanaopago,
       datapago = excluded.datapago,
       tipojuros = excluded.tipojuros,
       pago = excluded.pago
     returning *`,
    [
      gasto.idvalor,
      gasto.idusuario,
      gasto.idcatego,
      valorAtual.toFixed(2),
      gasto.recorvalor || 0,
      gasto.imporcatego,
      taxa,
      valorJuros.toFixed(2),
      valorTotal.toFixed(2),
      gasto.dataentra,
      gasto.datavenc,
      dataNaoPago,
      dataPago,
      tipo,
      situacaoPago
    ]
  )

  if (situacaoPago === 0) {
    await salvarPendenciaSeguinte(cliente, gasto, valorTotal.toFixed(2))
  } else {
    await removerPendenciaSeguinte(cliente, gasto)
  }

  return { status: 201, previsao: linhaParaPrevisao(resultado.rows[0]) }
}

// Cria (ou atualiza, se o gasto ja tiver previsao) a previsao de juros simples de um gasto
const criarPrevisao = async (req, res) => {
  const cliente = await pool.connect()

  try {
    await cliente.query('begin')

    const resultado = await salvarPrevisao(cliente, req.idUsuario, req.body)

    if (resultado.erro) {
      await cliente.query('rollback')
      return res.status(resultado.status).json({
        erro: resultado.erro
      })
    }

    await cliente.query('commit')

    res.status(201).json({
      mensagem: 'Previsao salva com sucesso',
      previsao: resultado.previsao
    })
  } catch (erro) {
    await cliente.query('rollback')
    throw erro
  } finally {
    cliente.release()
  }
}

const criarPrevisoesEmLote = async (req, res) => {
  const itens = req.body.itens

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      erro: 'Envie a lista de itens para salvar'
    })
  }

  const cliente = await pool.connect()

  try {
    await cliente.query('begin')

    const previsoes = []

    for (const item of itens) {
      const resultado = await salvarPrevisao(cliente, req.idUsuario, item)

      if (resultado.erro) {
        await cliente.query('rollback')
        return res.status(resultado.status).json({
          erro: resultado.erro,
          idGasto: item.idGasto
        })
      }

      previsoes.push(resultado.previsao)
    }

    await cliente.query('commit')

    res.status(201).json({
      mensagem: 'Previsoes salvas com sucesso',
      previsoes
    })
  } catch (erro) {
    await cliente.query('rollback')
    throw erro
  } finally {
    cliente.release()
  }
}

module.exports = {
  listarPrevisoesPorUsuario,
  criarPrevisao,
  criarPrevisoesEmLote
}
