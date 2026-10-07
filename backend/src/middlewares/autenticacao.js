const jwt = require('jsonwebtoken')

// Quanto tempo a sessao dura depois do 2FA; depois disso o usuario faz login de novo
const VALIDADE_SESSAO = '8h'

// Gera o token de sessao, entregue ao front so depois do codigo 2FA confirmado
const gerarToken = (idUsuario) =>
    jwt.sign({ idUsuario: Number(idUsuario) }, process.env.JWT_SECRET, { expiresIn: VALIDADE_SESSAO })

// Confere o token enviado no cabeçalho "Authorization: Bearer <token>".
// O id do usuario logado passa a vir SEMPRE daqui (req.idUsuario), nunca da URL
// ou do corpo da requisicao, que qualquer um consegue alterar
const autenticar = (req, res, next) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '')

    try {
        req.idUsuario = jwt.verify(token, process.env.JWT_SECRET).idUsuario
        next()
    } catch (erro) {
        res.status(401).json({
            erro: 'Sessao invalida ou expirada. Faca login novamente.'
        })
    }
}

// Para rotas com o id do usuario na URL (/usuario/:idUsuario): so deixa passar
// se for o proprio usuario logado. Usar sempre depois do autenticar
const exigirProprioUsuario = (req, res, next) => {
    if (Number(req.params.idUsuario) !== req.idUsuario) {
        return res.status(403).json({
            erro: 'Acesso negado'
        })
    }

    next()
}

module.exports = { gerarToken, autenticar, exigirProprioUsuario }
