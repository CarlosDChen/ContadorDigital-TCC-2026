const express = require('express')
const router = express.Router()


//Equivale a const usuarioController = require('../controllers/usuarioController')
//const buscarUsuarioPorId = usuarioController.buscarUsuarioPorId
const {
  criarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
  loginUsuario,
  verificarCodigo2FA
} = require('../controllers/usuarioController')

const { autenticar, exigirProprioUsuario } = require('../middlewares/autenticacao')

// Rotas publicas: cadastro e as duas etapas do login
router.post('/usuarios', criarUsuario)

router.post('/login', loginUsuario)

router.post('/login/verificar-codigo', verificarCodigo2FA)

// Rotas protegidas: exigem o token da sessao, e so o proprio usuario acessa a propria conta
router.get('/usuarios/id/:idUsuario', autenticar, exigirProprioUsuario, buscarUsuarioPorId)

router.put('/usuarios/id/:idUsuario', autenticar, exigirProprioUsuario, atualizarUsuario)

router.delete('/usuarios/id/:idUsuario', autenticar, exigirProprioUsuario, deletarUsuario)

module.exports = router
