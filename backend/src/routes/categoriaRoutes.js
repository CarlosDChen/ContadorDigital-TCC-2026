const express = require('express')
const router = express.Router()

const {
    listarCategoriasPorUsuario,
    criarCategoria,
    buscarCategoriaPorId,
    atualizarCategoria,
    deletarCategoria
} = require('../controllers/categoriaController')

const { autenticar, exigirProprioUsuario } = require('../middlewares/autenticacao')

// Todas exigem o token da sessao; cada usuario so enxerga e altera as proprias categorias
router.get('/categorias/usuario/:idUsuario', autenticar, exigirProprioUsuario, listarCategoriasPorUsuario)

router.post('/categorias', autenticar, criarCategoria)

router.get('/categorias/id/:id', autenticar, buscarCategoriaPorId)

router.put('/categorias/id/:id', autenticar, atualizarCategoria)

router.delete('/categorias/id/:id', autenticar, deletarCategoria)

module.exports = router
