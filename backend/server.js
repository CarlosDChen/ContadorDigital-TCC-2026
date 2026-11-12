process.env.TZ = 'America/Sao_Paulo'

//imports
require('dotenv').config()

const path = require('path')
const express = require('express')
const cors = require('cors')
const cron = require('node-cron')

const usuarioRoutes = require('./src/routes/usuarioRoutes')
const categoriaRoutes = require('./src/routes/categoriaRoutes')
const valorRoutes = require('./src/routes/valorRoutes')
const previsaoRoutes = require('./src/routes/previsaoRoutes')
const { processarViradaDoMes } = require('./src/jobs/viradaDoMes')
const { enviarAvisosDeVencimento } = require('./src/jobs/avisosVencimento')
const { atualizarJurosDiarios } = require('./src/jobs/jurosDiarios')
const { marcarContasAtrasadas } = require('./src/jobs/situacaoContas')

const PORTA = process.env.PORT || 3000
const PASTA_PUBLICA = path.join(__dirname, '..', 'public')
const FUSO_HORARIO = { timezone: 'America/Sao_Paulo' }

const app = express()

//ativa o middleware
app.use(cors())

//faz o back compreender json do front
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(PASTA_PUBLICA, 'landingPage.html'))
})

app.use(express.static(PASTA_PUBLICA))

app.use(usuarioRoutes)
app.use(categoriaRoutes)
app.use(valorRoutes)
app.use(previsaoRoutes)

const processarRotinasDoDia = async () => {
  await processarViradaDoMes().catch((erro) => console.error('Erro ao processar a virada do mês:', erro))
  await atualizarJurosDiarios().catch((erro) => console.error('Erro ao atualizar os juros pro rata:', erro))
  await marcarContasAtrasadas().catch((erro) => console.error('Erro ao marcar as contas atrasadas:', erro))
}

const enviarAvisos = () => {
  enviarAvisosDeVencimento().catch((erro) => console.error('Erro ao enviar avisos de vencimento:', erro))
}

app.listen(PORTA, async () => {
  console.log(`Servidor rodando na porta ${PORTA}`)

  // Roda uma vez ao subir (cobre o caso do servidor ter ficado desligado no dia certo)
  await processarRotinasDoDia()
  enviarAvisos()
})

cron.schedule('30 0 * * *', () => {
  processarRotinasDoDia()
}, FUSO_HORARIO)

cron.schedule('0 8 * * *', () => {
  enviarAvisos()
}, FUSO_HORARIO)
