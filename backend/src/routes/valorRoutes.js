const express = require('express')
const router = express.Router()

const {
    listarValoresPorUsuario,
    criarValor,
    buscarValorPorId,
    atualizarValor,
    deletarValor
} = require('../controllers/valorController')

const { autenticar, exigirProprioUsuario } = require('../middlewares/autenticacao')

// Todas exigem o token da sessao; cada usuario so enxerga e altera os proprios lançamentos
router.get('/valores/usuario/:idUsuario', autenticar, exigirProprioUsuario, listarValoresPorUsuario)

router.post('/valores', autenticar, criarValor)

router.get('/valores/id/:id', autenticar, buscarValorPorId)

router.put('/valores/id/:id', autenticar, atualizarValor)

router.delete('/valores/id/:id', autenticar, deletarValor)

module.exports = router
