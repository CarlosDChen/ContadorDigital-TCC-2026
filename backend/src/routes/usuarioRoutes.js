const express = require('express')
const router = express.Router()


//Equivale a const usuarioController = require('../controllers/usuarioController')
//const listarUsuarios = usuarioController.listarUsuarios
const {
    listarUsuarios,
    criarUsuario
} = require('../controllers/usuarioController')

router.get('/usuarios', listarUsuarios)
router.post('/usuarios', criarUsuario)
module.exports = router