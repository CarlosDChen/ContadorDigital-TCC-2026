const express = require('express')
const router = express.Router()

const {
    listarPrevisoesPorUsuario,
    criarPrevisao,
    criarPrevisoesEmLote
} = require('../controllers/previsaoController')

const { autenticar, exigirProprioUsuario } = require('../middlewares/autenticacao')

// Todas exigem o token da sessao; cada usuario so enxerga e cria as proprias previsoes
router.get('/previsoes/usuario/:idUsuario', autenticar, exigirProprioUsuario, listarPrevisoesPorUsuario)

router.post('/previsoes', autenticar, criarPrevisao)

router.post('/previsoes/lote', autenticar, criarPrevisoesEmLote)

module.exports = router
