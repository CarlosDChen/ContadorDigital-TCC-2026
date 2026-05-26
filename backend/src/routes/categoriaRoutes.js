const express = require('express')
const router = express.Router()

const {
    listarCategorias,
    criarCategoria,
    buscarCategoriaPorId,
    atualizarCategoria,
    deletarCategoria
} = require('../controllers/categoriaController')

router.get('/categorias', listarCategorias)

router.post('/categorias', criarCategoria) 

router.get('/categorias/id/:id', buscarCategoriaPorId)

router.put('/categorias/id/:id', atualizarCategoria)

router.delete('/categorias/id/:id', deletarCategoria)

module.exports = router