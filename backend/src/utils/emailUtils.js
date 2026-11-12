const nodemailer = require('nodemailer')

const transportador = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const enviarPeloBrevo = async ({ para, assunto, texto, html }) => {
    const resposta = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json',
            accept: 'application/json'
        },
        body: JSON.stringify({
            sender: { name: 'Contador Digital', email: process.env.EMAIL_USER },
            to: [{ email: para }],
            subject: assunto,
            textContent: texto,
            htmlContent: html
        })
    })

    if (!resposta.ok) {
        throw new Error(`Erro ao enviar e-mail pelo Brevo (${resposta.status}): ${await resposta.text()}`)
    }
}

const enviarEmail = async (mensagem) => {
    if (process.env.BREVO_API_KEY) {
        await enviarPeloBrevo(mensagem)
        return
    }

    await transportador.sendMail({
        from: `"Contador Digital" <${process.env.EMAIL_USER}>`,
        to: mensagem.para,
        subject: mensagem.assunto,
        text: mensagem.texto,
        html: mensagem.html
    })
}

const enviarCodigo2FA = async (destinatario, codigo) => {
    await enviarEmail({
        para: destinatario,
        assunto: 'Seu codigo de verificacao - Contador Digital',
        texto: `Seu codigo de verificacao e: ${codigo}\n\nEle expira em 5 minutos.`,
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
        return `atrasada desde ${data}`
    }

    if (item.diasParaVencer === 0) {
        return `vence hoje (${data})`
    }

    return item.diasParaVencer === 1 ? `vence amanhã (${data})` : `vence em ${item.diasParaVencer} dias (${data})`
}

const FORMATO_REAIS = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const TEXTO_DO_PEDIDO = {
    novaDataPagamento: ' (a data de pagamento informada já passou: informe uma nova data de pagamento)',
    informarEncargos: ' (informe a multa e os juros)'
}

const enviarAvisoVencimento = async (destinatario, itens) => {
    const linhas = itens.map((item) => ({
        nome: item.nome,
        texto: `${descreverVencimento(item)} - ${FORMATO_REAIS.format(item.valor)}` + (TEXTO_DO_PEDIDO[item.pedido] || '')
    }))

    await enviarEmail({
        para: destinatario,
        assunto: 'Aviso de vencimento de contas - Contador Digital',
        texto: 'Estas contas estão perto do vencimento ou estão atrasadas:\n\n' +
            linhas.map((linha) => `- ${linha.nome}: ${linha.texto}`).join('\n') +
            '\n\nSe alguma não for paga, marque como "Não pago" na Calculadora de Limite para cadastrar o juros.',
        html: `
            <p>Estas contas estão perto do vencimento ou estão atrasadas:</p>
            <ul>
                ${linhas.map((linha) => `<li><strong>${escaparHtml(linha.nome)}</strong>: ${escaparHtml(linha.texto)}</li>`).join('')}
            </ul>
            <p>Se alguma não for paga, marque como "Não pago" na Calculadora de Limite para cadastrar o juros.</p>
        `
    })
}

module.exports = { enviarCodigo2FA, enviarAvisoVencimento }
