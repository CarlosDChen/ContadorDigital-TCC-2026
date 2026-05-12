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

module.exports = {
  listarUsuarios
}