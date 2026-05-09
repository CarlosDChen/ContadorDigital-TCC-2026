//imports
const express = require('express')
const cors = require('cors')

const app = express()

//ativa o middleware
app.use(cors())

//faz o back compreender json do front
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Backend funcionando e atualizado')
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})