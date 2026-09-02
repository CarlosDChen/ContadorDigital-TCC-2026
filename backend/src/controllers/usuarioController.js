const pool = require('../config/db')
const Usuario = require('../models/usuarioModel')
const { encrypt, decrypt, hashCpf } = require('../utils/cryptoUtils')
const { enviarCodigo2FA } = require('../utils/emailUtils')

// Codigos de 2FA pendentes de confirmacao, em memoria: idUsuario -> { codigo, expiraEm }
const codigos2FA = new Map()
const VALIDADE_CODIGO_MS = 5 * 60 * 1000

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

  if (!dadosUsuario.nomeUso) {
    return res.status(400).json({
      erro: 'O nome e obrigatorio'
    })
  }

  if (!dadosUsuario.nomeFanUso || dadosUsuario.nomeFanUso.length > 20) {
    return res.status(400).json({
      erro: 'O usuario deve ter no maximo 20 caracteres'
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

    // As categorias padrao vem da tabela categoria_padrao (fonte unica da verdade),
    // cada uma virando uma linha propria e editavel para esse usuario, ligada
    // de volta ao padrao de origem via idtemplate
    const templates = await client.query(
      'select idtemplate, nome, tipo from categoria_padrao order by idtemplate'
    )

    for (const template of templates.rows) {
      await client.query(
        'insert into categoria (idusuario, nomecatego, tipocatego, idtemplate) values ($1, $2, $3, $4)',
        [idUsuario, template.nome, template.tipo, template.idtemplate]
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

// Etapa 1 do login: valida email/senha e envia o codigo de 2FA por email
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

  const codigo = String(Math.floor(100000 + Math.random() * 900000))

  codigos2FA.set(usuarioEncontrado.idUsuario, {
    codigo,
    expiraEm: Date.now() + VALIDADE_CODIGO_MS
  })

  await enviarCodigo2FA(usuarioEncontrado.email, codigo)

  res.status(200).json({
    mensagem: 'Codigo de verificacao enviado para o seu email',
    requer2FA: true,
    idUsuario: usuarioEncontrado.idUsuario
  })
}

// Etapa 2 do login: confirma o codigo de 2FA e libera a sessao
const verificarCodigo2FA = async (req, res) => {
  const { idUsuario, codigo } = req.body

  if (!idUsuario || !codigo) {
    return res.status(400).json({
      erro: 'idUsuario e codigo sao obrigatorios'
    })
  }

  const pendente = codigos2FA.get(idUsuario)

  if (!pendente || Date.now() > pendente.expiraEm) {
    codigos2FA.delete(idUsuario)
    return res.status(401).json({
      erro: 'Codigo expirado ou nao solicitado. Faca login novamente.'
    })
  }

  if (pendente.codigo !== String(codigo)) {
    return res.status(401).json({
      erro: 'Codigo invalido'
    })
  }

  codigos2FA.delete(idUsuario)

  const resultado = await pool.query('select * from usuario where idusuario = $1', [idUsuario])

  if (resultado.rows.length === 0) {
    return res.status(404).json({
      erro: 'Usuario nao encontrado'
    })
  }

  const usuarioEncontrado = linhaParaUsuario(resultado.rows[0])

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
  loginUsuario,
  verificarCodigo2FA
}
