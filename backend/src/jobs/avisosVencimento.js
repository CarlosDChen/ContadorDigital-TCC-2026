const pool = require('../config/db')
const { buscarGastosComAviso } = require('../services/vencimentoService')
const { enviarAvisoVencimento } = require('../utils/emailUtils')

const NIVEL_AVISO = { aVencer: 1, vencido: 2 }

const enviarAvisosDeVencimento = async () => {
    const avisos = await buscarGastosComAviso()

    const avisosNovos = avisos.filter(({ linha, situacao }) => Number(linha.avisovenc) < NIVEL_AVISO[situacao])

    const avisosPorUsuario = {}

    avisosNovos.forEach((aviso) => {
        const idUsuario = String(aviso.linha.idusuario)
        avisosPorUsuario[idUsuario] = avisosPorUsuario[idUsuario] || []
        avisosPorUsuario[idUsuario].push(aviso)
    })

    for (const [idUsuario, avisosDoUsuario] of Object.entries(avisosPorUsuario)) {
        try {
            const resultadoUsuario = await pool.query('select email from usuario where idusuario = $1', [idUsuario])
            const email = resultadoUsuario.rows[0] && resultadoUsuario.rows[0].email

            if (!email) {
                continue
            }

            await enviarAvisoVencimento(email, avisosDoUsuario.map(({ linha, situacao, diasParaVencer }) => ({
                nome: linha.nomevalor,
                valor: Number(linha.valorvalor),
                dataVencimento: linha.datavenc,
                situacao,
                diasParaVencer
            })))

            for (const { linha, situacao } of avisosDoUsuario) {
                await pool.query(
                    'update valores set avisovenc = $1 where idvalor = $2',
                    [NIVEL_AVISO[situacao], linha.idvalor]
                )
            }

            console.log(`Aviso de vencimento enviado: idusuario=${idUsuario}, ${avisosDoUsuario.length} conta(s)`)
        } catch (erro) {
            console.error(`Erro ao enviar aviso de vencimento para idusuario=${idUsuario}:`, erro)
        }
    }
}

module.exports = { enviarAvisosDeVencimento }
