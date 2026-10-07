const pool = require('../config/db')
const Valor = require('../models/valorModel')
const { calcularFechamentoMensal } = require('../utils/fechamentoUtils')

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
  linha.jurosvalor
)

const listarValores = async (req, res) => {
  const resultado = await pool.query('select * from valores order by idvalor')

  res.status(200).json(resultado.rows.map(linhaParaValor))
}

const listarValoresPorUsuario = async (req, res) => {
  const idUsuario = Number(req.params.idUsuario)

  const resultado = await pool.query(
    'select * from valores where idusuario = $1 order by dataentra desc, idvalor desc',
    [idUsuario]
  )

  res.status(200).json(resultado.rows.map(linhaParaValor))
}

// Fechamento do mes atual (RD-04): saldo do mes e, se estiver no vermelho,
// quais faturas deixar para o proximo mes (as de juros mais baixo primeiro)
const fechamentoMensal = async (req, res) => {
  const idUsuario = Number(req.params.idUsuario)
  const hoje = new Date()
  const anoMes = hoje.getFullYear() + String(hoje.getMonth() + 1).padStart(2, '0')

  const resultado = await pool.query(
    'select * from valores where idusuario = $1 and dataentra like $2',
    [idUsuario, anoMes + '%']
  )

  res.status(200).json({
    anoMes,
    ...calcularFechamentoMensal(resultado.rows.map(linhaParaValor), hoje)
  })
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

  // RD-02: todo lançamento deve pertencer obrigatoriamente a uma categoria
  if (!dadosValor.idCategoria) {
    return res.status(400).json({
      erro: 'A categoria e obrigatoria'
    })
  }

  // Juros por atraso e opcional (so faturas/parcelamentos tem), e so faz sentido em despesa
  const temJuros = dadosValor.jurosValor !== undefined && dadosValor.jurosValor !== null

  if (temJuros) {
    if (dadosValor.receitaDespesa !== 0) {
      return res.status(400).json({
        erro: 'Juros por atraso so pode ser informado em despesas'
      })
    }

    const juros = Number(dadosValor.jurosValor)

    if (Number.isNaN(juros) || juros < 0 || juros > 999.99) {
      return res.status(400).json({
        erro: 'Os juros por atraso devem ser um percentual entre 0 e 999,99'
      })
    }
  }

  const resultadoCategoria = await pool.query(
    'select tipocatego from categoria where idcatego = $1',
    [dadosValor.idCategoria]
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
        dadosValor.idUsuario,
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
      `insert into valores (idusuario, idcatego, nomevalor, valorvalor, recorvalor, rescdespes, dataentra, datafinal, discri, jurosvalor)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning *`,
      [
        dadosValor.idUsuario,
        dadosValor.idCategoria,
        dadosValor.nomeValor,
        dadosValor.valorValor,
        dadosValor.recorValor,
        dadosValor.receitaDespesa,
        dadosValor.dataEntrada,
        dadosValor.dataFinal,
        dadosValor.discricao,
        temJuros ? Number(dadosValor.jurosValor) : null
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
  listarValoresPorUsuario,
  fechamentoMensal,
  criarValor,
  buscarValorPorId,
  atualizarValor,
  deletarValor
}
