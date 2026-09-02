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

const listarCategorias = async (req, res) => {
  const resultado = await pool.query('select * from categoria order by idcatego')

  res.status(200).json(resultado.rows.map(linhaParaCategoria))
}

const listarCategoriasPorUsuario = async (req, res) => {
  const idUsuario = Number(req.params.idUsuario)

  const resultado = await pool.query(
    'select * from categoria where idusuario = $1 order by idcatego',
    [idUsuario]
  )

  res.status(200).json(resultado.rows.map(linhaParaCategoria))
}

const criarCategoria = async (req, res) => {
  const dadosCategoria = req.body

  if (!dadosCategoria.idUsuario) {
    return res.status(400).json({
      erro: 'O idUsuario e obrigatorio'
    })
  }

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
        dadosCategoria.idUsuario,
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

const buscarCategoriaPorId = async (req, res) => {
  const id = Number(req.params.id)

  const resultado = await pool.query('select * from categoria where idcatego = $1', [id])

  if (resultado.rows.length === 0) {
    return res.status(404).json({
      erro: 'Categoria nao encontrada'
    })
  }

  res.status(200).json(linhaParaCategoria(resultado.rows[0]))
}

const atualizarCategoria = async (req, res) => {
  const id = Number(req.params.id)

  const resultadoBusca = await pool.query('select * from categoria where idcatego = $1', [id])

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

  const resultado = await pool.query('delete from categoria where idcatego = $1', [id])

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
  listarCategorias,
  listarCategoriasPorUsuario,
  criarCategoria,
  buscarCategoriaPorId,
  atualizarCategoria,
  deletarCategoria
}
