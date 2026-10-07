const express = require('express')
const router = express.Router()

const {
    listarPrevisoesPorUsuario,
    criarPrevisao
} = require('../controllers/previsaoController')

router.get('/previsoes/usuario/:idUsuario', listarPrevisoesPorUsuario)

router.post('/previsoes', criarPrevisao)

module.exports = router
