const express = require('express')
const router = express.Router()

const {
    listarValores,
    criarValor,
    buscarValorPorId,
    atualizarValor,
    deletarValor
} = require('../controllers/valorController')

router.get('/valores', listarValores)

router.post('/valores', criarValor)

router.get('/valores/id/:id', buscarValorPorId)

router.put('/valores/id/:id', atualizarValor)

router.delete('/valores/id/:id', deletarValor)

module.exports = router