//imports
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cron = require('node-cron')

const usuarioRoutes = require('./src/routes/usuarioRoutes')
const categoriaRoutes = require('./src/routes/categoriaRoutes')
const valorRoutes = require('./src/routes/valorRoutes')
const previsaoRoutes = require('./src/routes/previsaoRoutes')
const { processarLancamentosRecorrentes } = require('./src/jobs/lancamentosRecorrentes')

const app = express()

//ativa o middleware
app.use(cors())

//faz o back compreender json do front
app.use(express.json())

app.use(usuarioRoutes)
app.use(categoriaRoutes)
app.use(valorRoutes)
app.use(previsaoRoutes)

app.get('/', (req, res) => {
  res.send('Backend funcionando e atualizado')
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')

  // Roda uma vez ao subir (cobre o caso do servidor ter ficado desligado no dia certo)
  processarLancamentosRecorrentes().catch((erro) => console.error('Erro ao processar lançamentos recorrentes:', erro))
})

// Confere todo dia a meia-noite e meia se algum lançamento recorrente precisa ser lançado
cron.schedule('30 0 * * *', () => {
  processarLancamentosRecorrentes().catch((erro) => console.error('Erro ao processar lançamentos recorrentes:', erro))
})