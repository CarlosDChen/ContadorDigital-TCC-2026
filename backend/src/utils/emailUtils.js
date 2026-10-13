const nodemailer = require('nodemailer')

const transportador = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const enviarCodigo2FA = async (destinatario, codigo) => {
    await transportador.sendMail({
        from: `"Contador Digital" <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: 'Seu codigo de verificacao - Contador Digital',
        text: `Seu codigo de verificacao e: ${codigo}\n\nEle expira em 5 minutos.`,
        html: `
            <p>Seu codigo de verificacao e:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${codigo}</p>
            <p>Ele expira em 5 minutos.</p>
        `
    })
}

const escaparHtml = (texto) => String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const descreverVencimento = (item) => {
    const data = item.dataVencimento.slice(6, 8) + '/' + item.dataVencimento.slice(4, 6) + '/' + item.dataVencimento.slice(0, 4)

    if (item.situacao === 'vencido') {
        return `venceu em ${data}`
    }

    if (item.diasParaVencer === 0) {
        return `vence hoje (${data})`
    }

    return item.diasParaVencer === 1 ? `vence amanhã (${data})` : `vence em ${item.diasParaVencer} dias (${data})`
}

const enviarAvisoVencimento = async (destinatario, itens) => {
    const linhas = itens.map((item) => ({
        nome: item.nome,
        texto: `${descreverVencimento(item)} - R$ ${item.valor.toFixed(2)}`
    }))

    await transportador.sendMail({
        from: `"Contador Digital" <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: 'Aviso de vencimento de contas - Contador Digital',
        text: 'Estas contas estão perto do vencimento ou já venceram:\n\n' +
            linhas.map((linha) => `- ${linha.nome}: ${linha.texto}`).join('\n') +
            '\n\nSe alguma não for paga, marque como "Não pago" na Calculadora de Limite para cadastrar o juros.',
        html: `
            <p>Estas contas estão perto do vencimento ou já venceram:</p>
            <ul>
                ${linhas.map((linha) => `<li><strong>${escaparHtml(linha.nome)}</strong>: ${escaparHtml(linha.texto)}</li>`).join('')}
            </ul>
            <p>Se alguma não for paga, marque como "Não pago" na Calculadora de Limite para cadastrar o juros.</p>
        `
    })
}

module.exports = { enviarCodigo2FA, enviarAvisoVencimento }
