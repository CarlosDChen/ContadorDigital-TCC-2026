const pool = require('../config/db')
const Valor = require('../models/valorModel')
const { dataValida, dataDeHoje } = require('../utils/dataUtils')
const { buscarGastosComAviso } = require('../services/vencimentoService')

const linhaParaValor = (linha) => new Valor(
  linha.idvalor,
  linha.idusuario,
  linha.idcatego,
  linha.nomevalor,
  linha.valorvalor,
  linha.recorvalor,
  linha.rescdespes,
  linha.dataentra,
  linha.datafinal,
  linha.discri,
  linha.idorigem,
  linha.datavenc,
  linha.idpendente
)

// Em todas as funcoes, o usuario vem do token da sessao (req.idUsuario) e toda
// consulta filtra por ele: ninguem le ou altera lançamento de outra pessoa
const listarValoresPorUsuario = async (req, res) => {
  const idUsuario = req.idUsuario

  const resultado = await pool.query(
    'select * from valores where idusuario = $1 order by dataentra desc, idvalor desc',
    [idUsuario]
  )

  res.status(200).json(resultado.rows.map(linhaParaValor))
}

const criarValor = async (req, res) => {
  const dadosValor = req.body
  const idUsuario = req.idUsuario

  if (!dadosValor.nomeValor) {
    return res.status(400).json({
      erro: 'O nome do lançamento e obrigatorio'
    })
  }

  if (!dadosValor.valorValor) {
    return res.status(400).json({
      erro: 'O valor e obrigatorio'
    })
  }

  // RD-02: todo lançamento deve pertencer obrigatoriamente a uma categoria
  if (!dadosValor.idCategoria) {
    return res.status(400).json({
      erro: 'A categoria e obrigatoria'
    })
  }

  // A categoria tem que existir E ser do proprio usuario
  const resultadoCategoria = await pool.query(
    'select tipocatego from categoria where idcatego = $1 and idusuario = $2',
    [dadosValor.idCategoria, idUsuario]
  )

  if (resultadoCategoria.rows.length === 0) {
    return res.status(400).json({
      erro: 'Categoria informada nao existe'
    })
  }

  if (resultadoCategoria.rows[0].tipocatego !== dadosValor.receitaDespesa) {
    return res.status(400).json({
      erro: 'A categoria selecionada nao corresponde ao tipo do lançamento (receita/despesa)'
    })
  }

  const informouVencimento = dadosValor.receitaDespesa === 0 &&
    dadosValor.dataVencimento !== undefined && dadosValor.dataVencimento !== null && dadosValor.dataVencimento !== ''

  if (informouVencimento && !dataValida(dadosValor.dataVencimento)) {
    return res.status(400).json({
      erro: 'A data de vencimento e invalida'
    })
  }

  const dataVencimento = informouVencimento ? String(dadosValor.dataVencimento) : null

  if (!dadosValor.confirmarDuplicado) {
    const resultadoDuplicado = await pool.query(
      `select 1 from valores
       where idusuario = $1 and idcatego = $2 and nomevalor = $3
         and valorvalor = $4 and rescdespes = $5 and dataentra = $6`,
      [
        idUsuario,
        dadosValor.idCategoria,
        dadosValor.nomeValor,
        dadosValor.valorValor,
        dadosValor.receitaDespesa,
        dadosValor.dataEntrada
      ]
    )

    if (resultadoDuplicado.rows.length > 0) {
      return res.status(409).json({
        possivelDuplicado: true,
        erro: 'Já existe um lançamento igual (mesma descrição, valor, categoria e data). Deseja salvar mesmo assim?'
      })
    }
  }

  try {
    const resultado = await pool.query(
      `insert into valores (idusuario, idcatego, nomevalor, valorvalor, recorvalor, rescdespes, dataentra, datafinal, discri, datavenc)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning *`,
      [
        idUsuario,
        dadosValor.idCategoria,
        dadosValor.nomeValor,
        dadosValor.valorValor,
        dadosValor.recorValor,
        dadosValor.receitaDespesa,
        dadosValor.dataEntrada,
        dadosValor.dataFinal,
        dadosValor.discricao,
        dataVencimento
      ]
    )

    res.status(201).json({
      mensagem: 'Valor criado com sucesso',
      valor: linhaParaValor(resultado.rows[0])
    })
  } catch (erro) {
    if (erro.code === '23503') {
      return res.status(400).json({
        erro: 'Usuario ou categoria informado nao existe'
      })
    }
    throw erro
  }
}

// Lançamento de outro usuario responde 404 (como se nao existisse), sem revelar que existe
const buscarValorPorId = async (req, res) => {
  const id = Number(req.params.id)

  const resultado = await pool.query(
    'select * from valores where idvalor = $1 and idusuario = $2',
    [id, req.idUsuario]
  )

  if (resultado.rows.length === 0) {
    return res.status(404).json({
      erro: 'Valor nao encontrado'
    })
  }

  res.status(200).json(linhaParaValor(resultado.rows[0]))
}

const textoOuNulo = (texto) => (texto === undefined || texto === null || texto === '' ? null : String(texto))

const atualizarValor = async (req, res) => {
  const id = Number(req.params.id)
  const dados = req.body
  const cliente = await pool.connect()

  const responderErro = async (status, erro) => {
    await cliente.query('rollback')
    return res.status(status).json({ erro })
  }

  try {
    await cliente.query('begin')

    const resultadoBusca = await cliente.query(
      'select * from valores where idvalor = $1 and idusuario = $2',
      [id, req.idUsuario]
    )

    if (resultadoBusca.rows.length === 0) {
      return responderErro(404, 'Valor nao encontrado')
    }

    const atual = resultadoBusca.rows[0]
    const resultadoPendencias = await cliente.query('select 1 from valores where idpendente = $1 limit 1', [id])
    const ligadoAPendencia = atual.idpendente !== null || resultadoPendencias.rows.length > 0

    const nomeValor = dados.nomeValor !== undefined ? String(dados.nomeValor).trim() : atual.nomevalor

    if (!nomeValor) {
      return responderErro(400, 'O nome do lançamento e obrigatorio')
    }

    const valorValor = dados.valorValor !== undefined ? String(dados.valorValor) : atual.valorvalor
    const idCategoria = dados.idCategoria !== undefined ? String(dados.idCategoria) : String(atual.idcatego)
    const dataEntrada = dados.dataEntrada !== undefined ? String(dados.dataEntrada) : atual.dataentra
    const dataVencimento = atual.rescdespes === 0 && dados.dataVencimento !== undefined
      ? textoOuNulo(dados.dataVencimento)
      : atual.datavenc

    const mudouValor = Number(valorValor) !== Number(atual.valorvalor)
    const mudouCategoria = idCategoria !== String(atual.idcatego)
    const mudouData = dataEntrada !== atual.dataentra
    const mudouVencimento = dataVencimento !== atual.datavenc

    if (ligadoAPendencia && (mudouValor || mudouCategoria || mudouData || mudouVencimento)) {
      return responderErro(409, 'Este lançamento faz parte de uma pendencia com juros: so a descricao pode ser alterada')
    }

    if (Number.isNaN(Number(valorValor)) || Number(valorValor) <= 0 || valorValor.length > 12) {
      return responderErro(400, 'O valor deve ser maior que zero e ter no maximo 12 caracteres')
    }

    if (!dataValida(dataEntrada)) {
      return responderErro(400, 'A data do lançamento e invalida')
    }

    if (dataVencimento !== null && !dataValida(dataVencimento)) {
      return responderErro(400, 'A data de vencimento e invalida')
    }

    if (mudouCategoria) {
      const resultadoCategoria = await cliente.query(
        'select tipocatego from categoria where idcatego = $1 and idusuario = $2',
        [idCategoria, req.idUsuario]
      )

      if (resultadoCategoria.rows.length === 0) {
        return responderErro(400, 'Categoria informada nao existe')
      }

      if (resultadoCategoria.rows[0].tipocatego !== atual.rescdespes) {
        return responderErro(400, 'A categoria selecionada nao corresponde ao tipo do lançamento (receita/despesa)')
      }
    }

    const resultado = await cliente.query(
      `update valores
       set nomevalor = $1, valorvalor = $2, idcatego = $3, dataentra = $4, datavenc = $5,
           avisovenc = case when $6::boolean then 0 else avisovenc end
       where idvalor = $7
       returning *`,
      [nomeValor, valorValor, idCategoria, dataEntrada, dataVencimento, mudouVencimento, id]
    )

    await cliente.query(
      `update previsao pr
       set valororiginal = v.valorvalor,
           valortotal = to_char(v.valorvalor::numeric + coalesce(pr.valorjuros::numeric, 0), 'FM999999999990.00'),
           idcatego = v.idcatego,
           importancia = c.imporcatego,
           datavenc = v.datavenc
       from valores v
       left join categoria c on c.idcatego = v.idcatego
       where pr.idgasto = v.idvalor
         and v.idvalor = $1
         and pr.pago = 1`,
      [id]
    )

    await cliente.query('commit')

    res.status(200).json({
      mensagem: 'Valor atualizado com sucesso',
      valor: linhaParaValor(resultado.rows[0])
    })
  } catch (erro) {
    await cliente.query('rollback')
    throw erro
  } finally {
    cliente.release()
  }
}

const deletarValor = async (req, res) => {
  const id = Number(req.params.id)
  const cliente = await pool.connect()

  try {
    await cliente.query('begin')

    const resultadoBusca = await cliente.query(
      'select * from valores where idvalor = $1 and idusuario = $2',
      [id, req.idUsuario]
    )

    if (resultadoBusca.rows.length === 0) {
      await cliente.query('rollback')
      return res.status(404).json({
        erro: 'Valor nao encontrado'
      })
    }

    const valor = resultadoBusca.rows[0]

    if (valor.idpendente) {
      await cliente.query(
        'delete from valores where idpendente = $1 and dataentra >= $2 and idusuario = $3',
        [valor.idpendente, valor.dataentra, req.idUsuario]
      )

      const resultadoAnterior = await cliente.query(
        `select idvalor from valores
         where (idvalor = $1 or idpendente = $1) and dataentra < $2 and idusuario = $3
         order by dataentra desc
         limit 1`,
        [valor.idpendente, valor.dataentra, req.idUsuario]
      )

      if (resultadoAnterior.rows.length > 0) {
        await cliente.query(
          'update previsao set pago = 1, datapago = coalesce(datapago, $1) where idgasto = $2',
          [dataDeHoje(), resultadoAnterior.rows[0].idvalor]
        )
      }
    } else {
      await cliente.query(
        'delete from valores where idpendente = $1 and idusuario = $2',
        [id, req.idUsuario]
      )
      await cliente.query('delete from valores where idvalor = $1', [id])
    }

    await cliente.query('commit')

    res.status(200).json({
      mensagem: 'Valor deletado com sucesso'
    })
  } catch (erro) {
    await cliente.query('rollback')
    throw erro
  } finally {
    cliente.release()
  }
}

const listarVencimentosPorUsuario = async (req, res) => {
  const avisos = await buscarGastosComAviso(req.idUsuario)

  res.status(200).json(avisos.map(({ linha, situacao, diasParaVencer }) => ({
    idValor: linha.idvalor,
    nomeValor: linha.nomevalor,
    valorValor: linha.valorvalor,
    dataEntrada: linha.dataentra,
    dataVencimento: linha.datavenc,
    situacao,
    diasParaVencer
  })))
}

module.exports = {
  listarValoresPorUsuario,
  listarVencimentosPorUsuario,
  criarValor,
  buscarValorPorId,
  atualizarValor,
  deletarValor
}
