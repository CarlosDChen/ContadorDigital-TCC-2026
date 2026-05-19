const Usuario = require('../models/usuarioModel')

const usuario1 = new Usuario(
    1,
    '12345678900',
    'joao@email.com',
    '11999999999',
    'Joao',
    'jojo',
    '123456'
  )

  const usuario2 = new Usuario(
    2,
    '98765432100',
    'maria@email.com',
    '11888888888',
    'Maria',
    'Ma',
    '654321'
  )

  const usuarios = [usuario1, usuario2]

const listarUsuarios = (req, res) => {
  res.status(200).json(usuarios)
}

const criarUsuario = (req, res) => {
  const dadosUsuario = req.body
  console.log(dadosUsuario)
  
  if (!dadosUsuario.email || !dadosUsuario.email.includes('@') ) {
    return res.status(400).json({
      erro: 'Email invalido'
    })
  }

  if (!dadosUsuario.senhaUso || dadosUsuario.senhaUso.length < 8 ){
    return res.status(400).json({
      erro: 'A senha deve ter pelo menos 8 caracteres'
    })
  }

  if (!dadosUsuario.cpfUso ||  dadosUsuario.cpfUso.length !== 11 || !/^\d+$/.test(dadosUsuario.cpfUso)){
    return res.status(400).json({
      erro: 'O CPF deve ter exatamente 11 digitos sem separadores'
    })
  }

  if (!dadosUsuario.telefone ||  dadosUsuario.telefone.length > 11 || !/^\d+$/.test(dadosUsuario.telefone)){
    return res.status(400).json({
      erro: 'O telefone deve possuir no maximo 11 digitos e sem separadores'
    })
  }

  res.status(201).json({
    mensagem: 'Usuario criado com sucesso',
    usuario: dadosUsuario
  })
}

const buscarUsuarioPorId = (req, res) => {
  const id = Number(req.params.id)

  const usuarioEncontrado = usuarios.find(
    usuario => usuario.idUsuario === id
  )

  if (!usuarioEncontrado) {
    return res.status(404).json({
      erro: 'Usuario nao encontrado'
    })
  }

  res.status(200).json(usuarioEncontrado)
}

const atualizarUsuario = (req, res) => {
  const id = Number(req.params.id)

  const usuarioEncontrado = usuarios.find(
    usuario => usuario.idUsuario === id
  )

  if (!usuarioEncontrado) {
    return res.status(404).json({
      erro: 'Usuario nao encontrado'
    })
  }

  usuarioEncontrado.nomeUso = req.body.nomeUso

  res.status(200).json({
    mensagem: 'Usuario atualizado com sucesso',
    usuario: usuarioEncontrado
  })
}

const deletarUsuario = (req, res) => {
  const id = Number(req.params.id)

  const indiceUsuario = usuarios.findIndex(
    usuario => usuario.idUsuario === id
  )

  if (indiceUsuario === -1) {
    return res.status(404).json({
      erro: 'Usuario nao encontrado'
    })
  }

  usuarios.splice(indiceUsuario, 1)

  res.status(200).json({
    mensagem: 'Usuario deletado com sucesso'
  })
}

module.exports = {
  listarUsuarios,
  criarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario
}