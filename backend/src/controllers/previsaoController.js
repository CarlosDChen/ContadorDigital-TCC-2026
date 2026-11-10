const pool = require('../config/db')
const Previsao = require('../models/previsaoModel')
const { dataDeHoje, dataValida, mesSeguinte } = require('../utils/dataUtils')
const {
  CAMPOS_DA_ORIGEM,
  salvarPendenciaSeguinte,
  atualizarPendenciasEmAbertoSeguintes,
  existePendenciaPosteriorNaoPaga,
  removerPendenciaSeguinte
} = require('../services/pendenciaService')
const { calcularEncargos, situacaoDaConta } = require('../services/encargosService')

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
  linha.tipojuros,
  linha.situacao,
  linha.valormulta,
  linha.formamulta,
  linha.contagemjuros,
  linha.valorjurospass,
  linha.dataprevpag,
  linha.tipojurossc
)

const numeroOuPadrao = (valor, padrao) =>
  valor === undefined || valor === null || valor === '' ? padrao : Number(valor)

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

  const tipoJurosSC = numeroOuPadrao(dados.tipoJurosSC, 0)

  if (tipoJurosSC !== 0 && tipoJurosSC !== 1) {
    return { status: 400, erro: 'tipoJurosSC deve ser 0 (juros simples) ou 1 (juros compostos)' }
  }

  if (tipoJurosSC === 1 && tipo === 0) {
    return { status: 400, erro: 'Juros compostos so podem ser informados em porcentagem' }
  }

  const contagemJuros = numeroOuPadrao(dados.contagemJuros, 0)

  if (contagemJuros !== 0 && contagemJuros !== 1) {
    return { status: 400, erro: 'contagemJuros deve ser 0 (mensal) ou 1 (diaria, pro rata)' }
  }

  const formaMulta = numeroOuPadrao(dados.formaMulta, null)

  if (formaMulta !== null && ![0, 1, 2].includes(formaMulta)) {
    return { status: 400, erro: 'formaMulta deve ser 0 (valor em R$), 1 (porcentagem) ou 2 (sem multa)' }
  }

  const taxaMulta = formaMulta === 0 || formaMulta === 1 ? Number(dados.taxaMulta) : 0

  if (Number.isNaN(taxaMulta) || taxaMulta < 0 || taxaMulta > 9999999999.99) {
    return { status: 400, erro: 'A multa deve ser um valor entre 0 e 9.999.999.999,99' }
  }

  const dataPrevPagamento = dados.dataPrevPagamento || null

  if (dataPrevPagamento !== null && !dataValida(dataPrevPagamento)) {
    return { status: 400, erro: 'Data de pagamento invalida' }
  }

  const emAberto = pago === null
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
    `select v.*, c.imporcatego, origem.valorvalor as valorbase, prevorigem.valormulta as multaorigem, ${CAMPOS_DA_ORIGEM}
     from valores v
     left join categoria c on c.idcatego = v.idcatego
     left join valores origem on origem.idvalor = v.idpendente
     left join previsao prevorigem on prevorigem.idgasto = v.idpendente
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

  if (!emAberto && contagemJuros === 1 && !gasto.datavenc) {
    return { status: 400, erro: 'Juros pro rata precisam da data de vencimento do gasto' }
  }

  if (!emAberto && dataPrevPagamento !== null) {
    if (dataPrevPagamento.slice(0, 6) !== mesSeguinte(gasto.dataentra.slice(0, 6))) {
      return { status: 400, erro: 'A data de pagamento deve ser no mes seguinte ao do gasto' }
    }

    if (gasto.datavenc && dataPrevPagamento <= gasto.datavenc) {
      return { status: 400, erro: 'A data de pagamento deve ser depois do vencimento' }
    }
  }

  const hoje = dataDeHoje()
  const encargos = emAberto
    ? { tipoJuros: tipo, tipoJurosSC: 0, taxaJuros: 0, contagemJuros: 0, formaMulta: null, taxaMulta: 0 }
    : { tipoJuros: tipo, tipoJurosSC, taxaJuros: taxa, contagemJuros, formaMulta, taxaMulta }
  const dataPagamentoPrevista = emAberto ? null : dataPrevPagamento
  const dataFinalDosJuros = situacaoPago === 1 ? hoje : (dataPagamentoPrevista || hoje)
  const valorAtual = Number(gasto.valorvalor)
  const { valorMulta, valorJuros, valorJurosPass, valorTotal } = calcularEncargos(gasto, encargos, dataFinalDosJuros)

  if (valorTotal.toFixed(2).length > 12) {
    return { status: 400, erro: 'O valor com juros passa do limite permitido' }
  }

  if ((situacaoPago === 1 || emAberto) && await existePendenciaPosteriorNaoPaga(cliente, gasto)) {
    return {
      status: 409,
      erro: 'Uma pendencia deste gasto em um mes seguinte ja esta marcada como nao paga. Desmarque ela primeiro.'
    }
  }

  const resultadoExistente = await cliente.query(
    'select pago, datanaopago, datapago from previsao where idgasto = $1',
    [gasto.idvalor]
  )
  const existente = resultadoExistente.rows[0]

  let dataNaoPago = existente ? existente.datanaopago : null

  if (emAberto) {
    dataNaoPago = null
  } else if (situacaoPago === 0) {
    dataNaoPago = existente && Number(existente.pago) === 0 && existente.datanaopago ? existente.datanaopago : hoje
  }

  const dataPago = situacaoPago === 1
    ? (existente && Number(existente.pago) === 1 && existente.datapago ? existente.datapago : hoje)
    : null

  const resultado = await cliente.query(
    `insert into previsao (idgasto, idusuario, idcatego, valororiginal, serepete, importancia, taxajuros, valorjuros, valortotal,
                           dataoriginal, datavenc, datanaopago, datapago, tipojuros, pago,
                           situacao, valormulta, formamulta, contagemjuros, valorjurospass, dataprevpag, tipojurossc)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
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
       pago = excluded.pago,
       situacao = excluded.situacao,
       valormulta = excluded.valormulta,
       formamulta = excluded.formamulta,
       contagemjuros = excluded.contagemjuros,
       valorjurospass = excluded.valorjurospass,
       dataprevpag = excluded.dataprevpag,
       tipojurossc = excluded.tipojurossc
     returning *`,
    [
      gasto.idvalor,
      gasto.idusuario,
      gasto.idcatego,
      valorAtual.toFixed(2),
      gasto.recorvalor || 0,
      gasto.imporcatego,
      encargos.taxaJuros,
      valorJuros.toFixed(2),
      valorTotal.toFixed(2),
      gasto.dataentra,
      gasto.datavenc,
      dataNaoPago,
      dataPago,
      tipo,
      situacaoPago,
      situacaoDaConta(situacaoPago, gasto.datavenc, hoje),
      valorMulta.toFixed(2),
      encargos.formaMulta,
      encargos.contagemJuros,
      valorJurosPass.toFixed(2),
      dataPagamentoPrevista,
      encargos.tipoJurosSC
    ]
  )

  if (situacaoPago === 0 && !emAberto) {
    await salvarPendenciaSeguinte(cliente, gasto, valorTotal.toFixed(2), dataPagamentoPrevista)
    await atualizarPendenciasEmAbertoSeguintes(cliente, gasto)
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
