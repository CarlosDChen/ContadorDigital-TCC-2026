const crypto = require('crypto')

const ALGORITMO = 'aes-256-gcm'
const TAMANHO_IV = 12

function obterChaveAes() {
    return Buffer.from(process.env.AES_SECRET_KEY, 'hex')
}

function encrypt(texto) {
    if (texto === null || texto === undefined) {
        return null
    }

    const iv = crypto.randomBytes(TAMANHO_IV)
    const cipher = crypto.createCipheriv(ALGORITMO, obterChaveAes(), iv)

    const cifrado = Buffer.concat([cipher.update(String(texto), 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()

    return Buffer.concat([iv, tag, cifrado]).toString('base64')
}

function decrypt(textoCifrado) {
    if (textoCifrado === null || textoCifrado === undefined) {
        return null
    }

    const dados = Buffer.from(textoCifrado, 'base64')
    const iv = dados.subarray(0, TAMANHO_IV)
    const tag = dados.subarray(TAMANHO_IV, TAMANHO_IV + 16)
    const cifrado = dados.subarray(TAMANHO_IV + 16)

    const decipher = crypto.createDecipheriv(ALGORITMO, obterChaveAes(), iv)
    decipher.setAuthTag(tag)

    const decifrado = Buffer.concat([decipher.update(cifrado), decipher.final()])
    return decifrado.toString('utf8')
}

function hashCpf(cpf) {
    return crypto
        .createHmac('sha256', process.env.HMAC_SECRET_KEY)
        .update(cpf)
        .digest('hex')
}

module.exports = { encrypt, decrypt, hashCpf }
