const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const dataUtils = require('../src/utils/dataUtils')
const dataDeHojeReal = dataUtils.dataDeHoje
let dataSimulada = null
dataUtils.dataDeHoje = () => dataSimulada || dataDeHojeReal()

const pool = require('../src/config/db')
const { criarUsuario } = require('../src/controllers/usuarioController')
const { criarPrevisao } = require('../src/controllers/previsaoController')
const { criarPrevisaoEmAberto } = require('../src/services/previsaoService')
const { gerarCopiasDoPrimeiroAno } = require('../src/services/recorrenteService')
const { processarViradaDoMes } = require('../src/jobs/viradaDoMes')
const { marcarContasAtrasadas } = require('../src/jobs/situacaoContas')

const DATA_DA_MASSA = '20261018'
const EMAIL_PADRAO = 'jonatas.aag@gmail.com'
const SENHA = 'Demo@2026'

const gerarCpf = (base) => {
    const digitos = base.split('').map(Number)
    const verificador = (numeros) => {
        const soma = numeros.reduce((total, numero, indice) => total + numero * (numeros.length + 1 - indice), 0)
        const resto = (soma * 10) % 11
        return resto === 10 ? 0 : resto
    }
    const primeiro = verificador(digitos)
    const segundo = verificador([...digitos, primeiro])
    return base + primeiro + segundo
}

const USUARIO_DEMONSTRACAO = {
    nomeUso: 'Ana Souza',
    nomeFanUso: 'anasouza',
    cpfUso: '12345678909',
    telefone: '11987654321',
    senhaUso: SENHA
}

const OUTROS_USUARIOS = [
    { nomeUso: 'Antônio Lima', nomeFanUso: 'tonholi', email: 'antonio.lima@example.com', cpfUso: gerarCpf('529982247'), telefone: '11912345678' },
    { nomeUso: 'Claudio Rei', nomeFanUso: 'claudior', email: 'claudio.rei@example.com', cpfUso: gerarCpf('153509460'), telefone: '11923456789' },
    { nomeUso: 'Manuella Dantas', nomeFanUso: 'manuu', email: 'manuella.dantas@example.com', cpfUso: gerarCpf('741852963'), telefone: '11934567890' },
    { nomeUso: 'Larissa Ribeiro', nomeFanUso: 'laribeiro', email: 'larissa.ribeiro@example.com', cpfUso: gerarCpf('369258147'), telefone: '11945678901' }
].map((usuario) => ({ ...usuario, senhaUso: SENHA }))

const CATEGORIA_INVESTIMENTOS = {
    nome: 'Investimentos',
    descricao: 'Aplicações e reserva de emergência',
    importancia: 3
}

const LANCAMENTOS = [
    { chave: 'salario', nome: 'Salário', categoria: 'Ativa', tipo: 1, valor: '3500.00', data: '20260805', recorrente: true },
    { nome: 'Freela de design', categoria: 'Ativa Secundária', tipo: 1, valor: '600.00', data: '20260820' },
    { chave: 'aluguel', nome: 'Aluguel', categoria: 'Moradia', tipo: 0, valor: '1200.00', data: '20260805', vencimento: '20260810', recorrente: true },
    { chave: 'internet', nome: 'Internet', categoria: 'Assinaturas e Serviços', tipo: 0, valor: '120.00', data: '20260810', vencimento: '20260815', recorrente: true },
    { nome: 'Streaming', categoria: 'Assinaturas e Serviços', tipo: 0, valor: '45.00', data: '20260803', recorrente: true },
    { nome: 'Curso de inglês', categoria: 'Educação', tipo: 0, valor: '250.00', data: '20260801', recorrente: true },
    { nome: 'Conta de luz', categoria: 'Moradia', tipo: 0, valor: '180.00', data: '20260812', vencimento: '20260820' },
    { nome: 'Mercado', categoria: 'Alimentação', tipo: 0, valor: '650.00', data: '20260807' },
    { nome: 'Combustível', categoria: 'Transporte', tipo: 0, valor: '300.00', data: '20260802' },
    { nome: 'Cinema', categoria: 'Entretenimento', tipo: 0, valor: '60.00', data: '20260816' },
    { nome: 'Ração do gato', categoria: 'Pets', tipo: 0, valor: '110.00', data: '20260809' },
    { nome: 'Aporte no Tesouro', categoria: 'Investimentos', tipo: 0, valor: '300.00', data: '20260806' },

    { nome: 'Venda de bicicleta', categoria: 'Vendas', tipo: 1, valor: '450.00', data: '20260912' },
    { nome: 'Conta de luz', categoria: 'Moradia', tipo: 0, valor: '165.00', data: '20260912', vencimento: '20260920' },
    { nome: 'Mercado', categoria: 'Alimentação', tipo: 0, valor: '700.00', data: '20260907' },
    { nome: 'Combustível', categoria: 'Transporte', tipo: 0, valor: '300.00', data: '20260902' },
    { nome: 'Farmácia', categoria: 'Saúde', tipo: 0, valor: '90.00', data: '20260918' },
    { nome: 'Viagem para a praia', categoria: 'Viagem', tipo: 0, valor: '900.00', data: '20260926' },
    { chave: 'fatura', nome: 'Fatura do cartão', categoria: 'Compra Pessoal', tipo: 0, valor: '800.00', data: '20260920', vencimento: '20260925' },

    { nome: 'Freela de design', categoria: 'Ativa Secundária', tipo: 1, valor: '800.00', data: '20261015' },
    { nome: 'Conta de luz', categoria: 'Moradia', tipo: 0, valor: '172.00', data: '20261012', vencimento: '20261020' },
    { nome: 'Mercado', categoria: 'Alimentação', tipo: 0, valor: '620.00', data: '20261007' },
    { nome: 'Combustível', categoria: 'Transporte', tipo: 0, valor: '300.00', data: '20261002' },
    { nome: 'Cinema', categoria: 'Entretenimento', tipo: 0, valor: '80.00', data: '20261011' },
    { nome: 'Ração do gato', categoria: 'Pets', tipo: 0, valor: '110.00', data: '20261009' },
    { nome: 'Roupa nova', categoria: 'Compra Pessoal', tipo: 0, valor: '200.00', data: '20261014' },
    { nome: 'Aporte no Tesouro', categoria: 'Investimentos', tipo: 0, valor: '300.00', data: '20261006' }
]

const SEM_ENCARGOS = { tipoJuros: 0, tipoJurosSC: 0, taxaJuros: 0, contagemJuros: 0, formaMulta: null, taxaMulta: 0, dataPrevPagamento: null }

const chamarController = async (controller, req) => {
    let status = 200
    let corpo = null
    const res = {
        status (codigo) { status = codigo; return this },
        json (dados) { corpo = dados; return this }
    }
    await controller(req, res)
    return { status, corpo }
}

const cadastrar = async (dados) => {
    const existente = await pool.query('select 1 from usuario where email = $1', [dados.email])

    if (existente.rows.length > 0) {
        throw new Error('Já existe um usuário com o e-mail ' + dados.email + '. Apague os usuários da massa antes de rodar de novo.')
    }

    const cadastro = await chamarController(criarUsuario, { body: dados })

    if (cadastro.status !== 201) {
        throw new Error('Não foi possível criar o usuário ' + dados.nomeUso + ': ' + cadastro.corpo.erro)
    }

    return Number(cadastro.corpo.usuario.idUsuario)
}

const salvarSituacao = async (idUsuario, idGasto, dataDaAcao, dados) => {
    dataSimulada = dataDaAcao
    const resultado = await chamarController(criarPrevisao, { idUsuario, body: { idGasto, ...SEM_ENCARGOS, ...dados } })

    if (resultado.status !== 201) {
        throw new Error('Não foi possível salvar a situação do gasto ' + idGasto + ': ' + resultado.corpo.erro)
    }
}

const criarMassaDeDados = async (email) => {
    dataSimulada = DATA_DA_MASSA

    const idUsuario = await cadastrar({ ...USUARIO_DEMONSTRACAO, email })

    for (const usuario of OUTROS_USUARIOS) {
        await cadastrar(usuario)
    }

    await pool.query(
        'insert into categoria (idusuario, nomecatego, tipocatego, desccatego, imporcatego) values ($1, $2, 0, $3, $4)',
        [idUsuario, CATEGORIA_INVESTIMENTOS.nome, CATEGORIA_INVESTIMENTOS.descricao, CATEGORIA_INVESTIMENTOS.importancia]
    )

    const categorias = await pool.query('select idcatego, nomecatego, tipocatego from categoria where idusuario = $1', [idUsuario])
    const idCategoria = (nome, tipo) => {
        const categoria = categorias.rows.find((linha) => linha.nomecatego === nome && linha.tipocatego === tipo)

        if (!categoria) {
            throw new Error('Categoria não encontrada: ' + nome)
        }

        return categoria.idcatego
    }

    const idsPorChave = {}

    for (const lancamento of LANCAMENTOS) {
        const resultado = await pool.query(
            `insert into valores (idusuario, idcatego, nomevalor, valorvalor, recorvalor, rescdespes, dataentra, datafinal, discri, datavenc)
             values ($1, $2, $3, $4, $5, $6, $7, null, '', $8)
             returning idvalor`,
            [
                idUsuario,
                idCategoria(lancamento.categoria, lancamento.tipo),
                lancamento.nome,
                lancamento.valor,
                lancamento.recorrente ? 1 : 0,
                lancamento.tipo,
                lancamento.data,
                lancamento.vencimento || null
            ]
        )

        await criarPrevisaoEmAberto(pool, resultado.rows[0].idvalor)

        if (lancamento.chave) {
            idsPorChave[lancamento.chave] = resultado.rows[0].idvalor
        }
    }

    const recorrentes = await pool.query(
        'select * from valores where idusuario = $1 and recorvalor = 1 order by idvalor',
        [idUsuario]
    )

    for (const template of recorrentes.rows) {
        await gerarCopiasDoPrimeiroAno(pool, template)
    }

    const gastosPagos = await pool.query(
        `select idvalor, coalesce(datavenc, dataentra) as datapagamento
         from valores
         where idusuario = $1
           and rescdespes = 0
           and substring(dataentra, 1, 6) in ('202608', '202609')
           and idvalor <> $2
         order by dataentra, idvalor`,
        [idUsuario, idsPorChave.fatura]
    )

    for (const gasto of gastosPagos.rows) {
        await salvarSituacao(idUsuario, gasto.idvalor, gasto.datapagamento, { pago: 1 })
    }

    await salvarSituacao(idUsuario, idsPorChave.fatura, '20260930', {
        pago: 0, tipoJuros: 1, tipoJurosSC: 1, taxaJuros: 2, formaMulta: 2
    })

    const copiaDeOutubro = async (chave) => (await pool.query(
        "select idvalor from valores where idorigem = $1 and dataentra like '202610%'",
        [idsPorChave[chave]]
    )).rows[0].idvalor

    await salvarSituacao(idUsuario, await copiaDeOutubro('aluguel'), DATA_DA_MASSA, { pago: 1 })
    await salvarSituacao(idUsuario, await copiaDeOutubro('internet'), DATA_DA_MASSA, {
        pago: 0, tipoJuros: 1, tipoJurosSC: 0, taxaJuros: 1, formaMulta: 2
    })

    dataSimulada = DATA_DA_MASSA
    await processarViradaDoMes()
    await marcarContasAtrasadas()
    dataSimulada = null

    const totais = await pool.query(
        `select substring(v.dataentra, 1, 6) as mes,
                sum(case when v.rescdespes = 1 then v.valorvalor::numeric else 0 end) as receita,
                sum(case when v.rescdespes = 0 then v.valorvalor::numeric else 0 end) as gastos,
                count(*)::int as lancamentos,
                count(*) filter (where p.pago = 1)::int as pagas,
                count(*) filter (where p.pago = 0 and p.datanaopago is not null)::int as naopagas,
                count(*) filter (where p.pago = 0 and p.datanaopago is null)::int as emaberto
         from valores v
         left join previsao p on p.idgasto = v.idvalor
         where v.idusuario = $1
         group by 1
         order by 1`,
        [idUsuario]
    )

    return { idUsuario, totais: totais.rows }
}

const executar = async () => {
    const email = process.argv[2] || EMAIL_PADRAO

    if (!email.includes('@')) {
        console.error('Uso: node scripts/massaDeDados.js [e-mail da usuária de demonstração]')
        process.exitCode = 1
        return
    }

    try {
        const { idUsuario, totais } = await criarMassaDeDados(email)

        console.log('Massa de dados criada (situação em ' + DATA_DA_MASSA.slice(6, 8) + '/' + DATA_DA_MASSA.slice(4, 6) + '/' + DATA_DA_MASSA.slice(0, 4) + ')')
        console.log('Usuária Ana Souza: idusuario ' + idUsuario + ', e mais ' + OUTROS_USUARIOS.length + ' usuários sem lançamentos')
        totais.forEach((mes) => {
            console.log(`  ${mes.mes.slice(4, 6)}/${mes.mes.slice(0, 4)}: ${mes.lancamentos} lançamentos, receita R$ ${Number(mes.receita).toFixed(2)}, ` +
                `gastos R$ ${Number(mes.gastos).toFixed(2)} (pagos ${mes.pagas}, não pagos ${mes.naopagas}, em aberto ${mes.emaberto})`)
        })
        console.log('Login: ' + email + ' / senha ' + SENHA + ' (o código do 2FA chega neste e-mail)')
    } catch (erro) {
        console.error('Erro: ' + erro.message)
        process.exitCode = 1
    } finally {
        await pool.end()
    }
}

if (require.main === module) {
    executar()
}

module.exports = { criarMassaDeDados, USUARIO_DEMONSTRACAO, OUTROS_USUARIOS, LANCAMENTOS }
