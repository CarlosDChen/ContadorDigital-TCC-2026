const express = require('express')
const router = express.Router()


//Equivale a const usuarioController = require('../controllers/usuarioController')
//const listarUsuarios = usuarioController.listarUsuarios
const {
  listarUsuarios,
  criarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario
} = require('../controllers/usuarioController')

router.get('/usuarios', listarUsuarios)

router.post('/usuarios', criarUsuario)

router.get('/usuarios/:id', buscarUsuarioPorId)

router.put('/usuarios/:id', atualizarUsuario)

router.delete('/usuarios/:id', deletarUsuario)

module.exports = router