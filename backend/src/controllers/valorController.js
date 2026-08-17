const pool = require('../config/db')
const Valor = require('../models/valorModel')

const linhaParaValor = (linha) => new Valor(
  linha.idvalor,
  linha.idusuario,
  linha.idcatego,
  linha.nomevalor,
  linha.valorvalor,
  linha.recorvalor,
  linha.rescdespes,
  linha.dataentra,
  linha.discri
)

const listarValores = async (req, res) => {
  const resultado = await pool.query('select * from valores order by idvalor')

  res.status(200).json(resultado.rows.map(linhaParaValor))
}

const criarValor = async (req, res) => {
  const dadosValor = req.body

  if (!dadosValor.idUsuario) {
    return res.status(400).json({
      erro: 'O idUsuario e obrigatorio'
    })
  }

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

  try {
    const resultado = await pool.query(
      `insert into valores (idusuario, idcatego, nomevalor, valorvalor, recorvalor, rescdespes, dataentra, discri)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning *`,
      [
        dadosValor.idUsuario,
        dadosValor.idCategoria,
        dadosValor.nomeValor,
        dadosValor.valorValor,
        dadosValor.recorValor,
        dadosValor.receitaDespesa,
        dadosValor.dataEntrada,
        dadosValor.discricao
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

const buscarValorPorId = async (req, res) => {
  const id = Number(req.params.id)

  const resultado = await pool.query('select * from valores where idvalor = $1', [id])

  if (resultado.rows.length === 0) {
    return res.status(404).json({
      erro: 'Valor nao encontrado'
    })
  }

  res.status(200).json(linhaParaValor(resultado.rows[0]))
}

const atualizarValor = async (req, res) => {
  const id = Number(req.params.id)

  const resultadoBusca = await pool.query('select * from valores where idvalor = $1', [id])

  if (resultadoBusca.rows.length === 0) {
    return res.status(404).json({
      erro: 'Valor nao encontrado'
    })
  }

  const valorEncontrado = linhaParaValor(resultadoBusca.rows[0])
  valorEncontrado.nomeValor = req.body.nomeValor

  await pool.query(
    'update valores set nomevalor = $1 where idvalor = $2',
    [valorEncontrado.nomeValor, id]
  )

  res.status(200).json({
    mensagem: 'Valor atualizado com sucesso',
    valor: valorEncontrado
  })
}

const deletarValor = async (req, res) => {
  const id = Number(req.params.id)

  const resultado = await pool.query('delete from valores where idvalor = $1', [id])

  if (resultado.rowCount === 0) {
    return res.status(404).json({
      erro: 'Valor nao encontrado'
    })
  }

  res.status(200).json({
    mensagem: 'Valor deletado com sucesso'
  })
}

module.exports = {
  listarValores,
  criarValor,
  buscarValorPorId,
  atualizarValor,
  deletarValor
}
