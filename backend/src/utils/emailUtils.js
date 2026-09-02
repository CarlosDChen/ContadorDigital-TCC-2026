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

module.exports = { enviarCodigo2FA }
