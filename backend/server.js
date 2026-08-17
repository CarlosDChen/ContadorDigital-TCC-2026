//imports
require('dotenv').config()

const express = require('express')
const cors = require('cors')

const usuarioRoutes = require('./src/routes/usuarioRoutes')
const categoriaRoutes = require('./src/routes/categoriaRoutes')
const valorRoutes = require('./src/routes/valorRoutes')

const app = express()

//ativa o middleware
app.use(cors())

//faz o back compreender json do front
app.use(express.json())

app.use(usuarioRoutes)
app.use(categoriaRoutes)
app.use(valorRoutes)

app.get('/', (req, res) => {
  res.send('Backend funcionando e atualizado')
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})