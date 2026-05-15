const Usuario = require('../models/usuarioModel')

const listarUsuarios = (req, res) => {
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

  res.json(usuarios)
}

const criarUsuario = (req, res) => {
  const dadosUsuario = req.body
  console.log(dadosUsuario)
  
  if (!dadosUsuario.email || !dadosUsuario.email.includes('@') ) {
    return res.json({
      erro: 'Email invalido'
    })
  }

  if (!dadosUsuario.senhaUso || dadosUsuario.senhaUso.length < 8 ){
    return res.json({
      erro: 'A senha deve ter pelo menos 8 caracteres'
    })
  }

  if (!dadosUsuario.cpfUso ||  dadosUsuario.cpfUso.length != 11 || !/^\d+$/.test(dadosUsuario.cpfUso)){
    return res.json({
      erro: 'O CPF deve ter exatamente 11 digitos sem separadores'
    })
  }

  if (!dadosUsuario.telefone ||  dadosUsuario.telefone.length > 11 || !/^\d+$/.test(dadosUsuario.telefone)){
    return res.json({
      erro: 'O telefone deve possuir no maximo 11 digitos e sem separadores'
    })
  }

  res.json({
    mensagem: 'Usuario criado com sucesso',
    usuario: dadosUsuario
  })
}

module.exports = {
  listarUsuarios,
  criarUsuario
}