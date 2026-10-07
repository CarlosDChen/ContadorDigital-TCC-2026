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
  linha.datafinal,
  linha.discri,
  linha.idorigem
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
      `insert into valores (idusuario, idcatego, nomevalor, valorvalor, recorvalor, rescdespes, dataentra, datafinal, discri)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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

const atualizarValor = async (req, res) => {
  const id = Number(req.params.id)

  const resultadoBusca = await pool.query(
    'select * from valores where idvalor = $1 and idusuario = $2',
    [id, req.idUsuario]
  )

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

  const resultado = await pool.query(
    'delete from valores where idvalor = $1 and idusuario = $2',
    [id, req.idUsuario]
  )

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
  listarValoresPorUsuario,
  criarValor,
  buscarValorPorId,
  atualizarValor,
  deletarValor
}
