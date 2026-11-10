const express = require('express')
const router = express.Router()

const {
    listarValoresPorUsuario,
    listarVencimentosPorUsuario,
    listarRecorrentesNoFimPorUsuario,
    renovarRecorrente,
    encerrarRecorrente,
    criarValor,
    buscarValorPorId,
    atualizarValor,
    deletarValor
} = require('../controllers/valorController')

const { autenticar, exigirProprioUsuario } = require('../middlewares/autenticacao')

// Todas exigem o token da sessao; cada usuario so enxerga e altera os proprios lançamentos
router.get('/valores/usuario/:idUsuario', autenticar, exigirProprioUsuario, listarValoresPorUsuario)

router.get('/valores/vencimentos/usuario/:idUsuario', autenticar, exigirProprioUsuario, listarVencimentosPorUsuario)

router.get('/valores/recorrentes/usuario/:idUsuario', autenticar, exigirProprioUsuario, listarRecorrentesNoFimPorUsuario)

router.post('/valores/id/:id/renovar', autenticar, renovarRecorrente)

router.post('/valores/id/:id/encerrar', autenticar, encerrarRecorrente)

router.post('/valores', autenticar, criarValor)

router.get('/valores/id/:id', autenticar, buscarValorPorId)

router.put('/valores/id/:id', autenticar, atualizarValor)

router.delete('/valores/id/:id', autenticar, deletarValor)

module.exports = router
