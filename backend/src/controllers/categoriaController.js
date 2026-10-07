const pool = require('../config/db')
const Categoria = require('../models/categoriaModel')

const linhaParaCategoria = (linha) => new Categoria(
  linha.idcatego,
  linha.idusuario,
  linha.nomecatego,
  linha.tipocatego,
  linha.desccatego,
  linha.imporcatego,
  linha.idtemplate
)

// Em todas as funcoes, o usuario vem do token da sessao (req.idUsuario) e toda
// consulta filtra por ele: ninguem le ou altera categoria de outra pessoa
const listarCategoriasPorUsuario = async (req, res) => {
  const idUsuario = req.idUsuario

  const resultado = await pool.query(
    'select * from categoria where idusuario = $1 order by idcatego',
    [idUsuario]
  )

  res.status(200).json(resultado.rows.map(linhaParaCategoria))
}

const criarCategoria = async (req, res) => {
  const dadosCategoria = req.body

  if (!dadosCategoria.nomeCategoria) {
    return res.status(400).json({
      erro: 'O nome da categoria e obrigatorio'
    })
  }

  try {
    const resultado = await pool.query(
      `insert into categoria (idusuario, nomecatego, tipocatego, desccatego, imporcatego)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [
        req.idUsuario,
        dadosCategoria.nomeCategoria,
        dadosCategoria.tipoCategoria,
        dadosCategoria.descCategoria,
        dadosCategoria.importanciaCategoria
      ]
    )

    res.status(201).json({
      mensagem: 'Categoria criada com sucesso',
      categoria: linhaParaCategoria(resultado.rows[0])
    })
  } catch (erro) {
    if (erro.code === '23503') {
      return res.status(400).json({
        erro: 'Usuario informado nao existe'
      })
    }
    throw erro
  }
}

// Categoria de outro usuario responde 404 (como se nao existisse), sem revelar que existe
const buscarCategoriaPorId = async (req, res) => {
  const id = Number(req.params.id)

  const resultado = await pool.query(
    'select * from categoria where idcatego = $1 and idusuario = $2',
    [id, req.idUsuario]
  )

  if (resultado.rows.length === 0) {
    return res.status(404).json({
      erro: 'Categoria nao encontrada'
    })
  }

  res.status(200).json(linhaParaCategoria(resultado.rows[0]))
}

const atualizarCategoria = async (req, res) => {
  const id = Number(req.params.id)

  const resultadoBusca = await pool.query(
    'select * from categoria where idcatego = $1 and idusuario = $2',
    [id, req.idUsuario]
  )

  if (resultadoBusca.rows.length === 0) {
    return res.status(404).json({
      erro: 'Categoria nao encontrada'
    })
  }

  const categoriaEncontrada = linhaParaCategoria(resultadoBusca.rows[0])
  categoriaEncontrada.nomeCategoria = req.body.nomeCategoria

  await pool.query(
    'update categoria set nomecatego = $1 where idcatego = $2',
    [categoriaEncontrada.nomeCategoria, id]
  )

  res.status(200).json({
    mensagem: 'Categoria atualizada com sucesso',
    categoria: categoriaEncontrada
  })
}

const deletarCategoria = async (req, res) => {
  const id = Number(req.params.id)

  const resultado = await pool.query(
    'delete from categoria where idcatego = $1 and idusuario = $2',
    [id, req.idUsuario]
  )

  if (resultado.rowCount === 0) {
    return res.status(404).json({
      erro: 'Categoria nao encontrada'
    })
  }

  res.status(200).json({
    mensagem: 'Categoria deletada com sucesso'
  })
}

module.exports = {
  listarCategoriasPorUsuario,
  criarCategoria,
  buscarCategoriaPorId,
  atualizarCategoria,
  deletarCategoria
}
