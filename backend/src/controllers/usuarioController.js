const pool = require('../config/db')
const Usuario = require('../models/usuarioModel')
const { encrypt, decrypt, hashCpf } = require('../utils/cryptoUtils')

// Converte uma linha do banco (campos criptografados) num Usuario
// com os valores em claro, sempre passando pelo constructor/setters da classe
const linhaParaUsuario = (linha) => new Usuario(
  linha.idusuario,
  decrypt(linha.cpfuso),
  linha.email,
  decrypt(linha.tell),
  linha.nomeuso,
  linha.nomefanusu,
  decrypt(linha.senhauso)
)

// Nunca devolvemos a senha (nem descriptografada) nas respostas da API
const usuarioParaResposta = (usuario) => {
  const dados = usuario.toJSON()
  delete dados.senhaUso
  return dados
}

// Categorias criadas automaticamente para todo usuario novo
const CATEGORIAS_PADRAO = [
  { nome: 'Entretenimento', tipo: 0 },
  { nome: 'Alimentação', tipo: 0 },
  { nome: 'Moradia', tipo: 0 },
  { nome: 'Transporte', tipo: 0 },
  { nome: 'Compra Pessoal', tipo: 0 },
  { nome: 'Saúde', tipo: 0 },
  { nome: 'Educação', tipo: 0 },
  { nome: 'Assinaturas e Serviços', tipo: 0 },
  { nome: 'Pets', tipo: 0 },
  { nome: 'Viagem', tipo: 0 },
  { nome: 'Outro', tipo: 0 },
  { nome: 'Ativa', tipo: 1 },
  { nome: 'Ativa Secundária', tipo: 1 },
  { nome: 'Passiva', tipo: 1 },
  { nome: 'Vendas', tipo: 1 },
  { nome: 'Ganhos Eventuais', tipo: 1 },
  { nome: 'Benefícios', tipo: 1 },
  { nome: 'Outro', tipo: 1 }
]

const listarUsuarios = async (req, res) => {
  const resultado = await pool.query('select * from usuario order by idusuario')

  const usuarios = resultado.rows
    .map(linhaParaUsuario)
    .map(usuarioParaResposta)

  res.status(200).json(usuarios)
}

const criarUsuario = async (req, res) => {
  const dadosUsuario = req.body

  if (!dadosUsuario.email || !dadosUsuario.email.includes('@')) {
    return res.status(400).json({
      erro: 'Email invalido'
    })
  }

  if (!dadosUsuario.senhaUso || dadosUsuario.senhaUso.length !== 9) {
    return res.status(400).json({
      erro: 'A senha deve ter exatamente 9 caracteres'
    })
  }

  if (!dadosUsuario.cpfUso || dadosUsuario.cpfUso.length !== 11 || !/^\d+$/.test(dadosUsuario.cpfUso)) {
    return res.status(400).json({
      erro: 'O CPF deve ter exatamente 11 digitos sem separadores'
    })
  }

  if (!dadosUsuario.telefone || dadosUsuario.telefone.length > 11 || !/^\d+$/.test(dadosUsuario.telefone)) {
    return res.status(400).json({
      erro: 'O telefone deve possuir no maximo 11 digitos e sem separadores'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const resultado = await client.query(
      `insert into usuario (cpfuso, cpf_hash, email, tell, nomeuso, nomefanusu, senhauso)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning idusuario`,
      [
        encrypt(dadosUsuario.cpfUso),
        hashCpf(dadosUsuario.cpfUso),
        dadosUsuario.email,
        encrypt(dadosUsuario.telefone),
        dadosUsuario.nomeUso,
        dadosUsuario.nomeFanUso,
        encrypt(dadosUsuario.senhaUso)
      ]
    )

    const idUsuario = resultado.rows[0].idusuario

    for (const categoria of CATEGORIAS_PADRAO) {
      await client.query(
        'insert into categoria (idusuario, nomecatego, tipocatego) values ($1, $2, $3)',
        [idUsuario, categoria.nome, categoria.tipo]
      )
    }

    await client.query('COMMIT')

    const novoUsuario = new Usuario(
      idUsuario,
      dadosUsuario.cpfUso,
      dadosUsuario.email,
      dadosUsuario.telefone,
      dadosUsuario.nomeUso,
      dadosUsuario.nomeFanUso,
      dadosUsuario.senhaUso
    )

    res.status(201).json({
      mensagem: 'Usuario criado com sucesso',
      usuario: usuarioParaResposta(novoUsuario)
    })
  } catch (erro) {
    await client.query('ROLLBACK')

    if (erro.code === '23505') {
      return res.status(409).json({
        erro: 'CPF ja cadastrado'
      })
    }
    throw erro
  } finally {
    client.release()
  }
}

const buscarUsuarioPorId = async (req, res) => {
  const id = Number(req.params.id)

  const resultado = await pool.query('select * from usuario where idusuario = $1', [id])

  if (resultado.rows.length === 0) {
    return res.status(404).json({
      erro: 'Usuario nao encontrado'
    })
  }

  const usuarioEncontrado = linhaParaUsuario(resultado.rows[0])

  res.status(200).json(usuarioParaResposta(usuarioEncontrado))
}

const atualizarUsuario = async (req, res) => {
  const id = Number(req.params.id)

  const resultadoBusca = await pool.query('select * from usuario where idusuario = $1', [id])

  if (resultadoBusca.rows.length === 0) {
    return res.status(404).json({
      erro: 'Usuario nao encontrado'
    })
  }

  const usuarioEncontrado = linhaParaUsuario(resultadoBusca.rows[0])
  usuarioEncontrado.nomeUso = req.body.nomeUso

  await pool.query(
    'update usuario set nomeuso = $1 where idusuario = $2',
    [usuarioEncontrado.nomeUso, id]
  )

  res.status(200).json({
    mensagem: 'Usuario atualizado com sucesso',
    usuario: usuarioParaResposta(usuarioEncontrado)
  })
}

const loginUsuario = async (req, res) => {
  const { email, senhaUso } = req.body

  if (!email || !senhaUso) {
    return res.status(400).json({
      erro: 'Email e senha sao obrigatorios'
    })
  }

  const resultado = await pool.query('select * from usuario where email = $1', [email])

  if (resultado.rows.length === 0) {
    return res.status(401).json({
      erro: 'Email ou senha invalidos'
    })
  }

  const usuarioEncontrado = linhaParaUsuario(resultado.rows[0])

  if (usuarioEncontrado.senhaUso !== senhaUso) {
    return res.status(401).json({
      erro: 'Email ou senha invalidos'
    })
  }

  res.status(200).json({
    mensagem: 'Login realizado com sucesso',
    usuario: usuarioParaResposta(usuarioEncontrado)
  })
}

const deletarUsuario = async (req, res) => {
  const id = Number(req.params.id)

  const resultado = await pool.query('delete from usuario where idusuario = $1', [id])

  if (resultado.rowCount === 0) {
    return res.status(404).json({
      erro: 'Usuario nao encontrado'
    })
  }

  res.status(200).json({
    mensagem: 'Usuario deletado com sucesso'
  })
}

module.exports = {
  listarUsuarios,
  criarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
  loginUsuario
}
