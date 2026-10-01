const pool = require('../config/db')

const dataDeHoje = () => {
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const dia = String(hoje.getDate()).padStart(2, '0')
    return `${ano}${mes}${dia}`
}

// Confere todo lançamento marcado como recorrente e cria a cópia deste mês
// quando o dia do mês bater, respeitando a data final (se houver) e evitando duplicar
const processarLancamentosRecorrentes = async () => {
    const hoje = dataDeHoje()
    const diaDeHoje = hoje.slice(6, 8)
    const anoMesDeHoje = hoje.slice(0, 6)

    const templates = await pool.query(
        `select * from valores
         where recorvalor = 1
           and (datafinal is null or datafinal >= $1)`,
        [hoje]
    )

    for (const template of templates.rows) {
        const diaTemplate = template.dataentra.slice(6, 8)
        const anoMesTemplate = template.dataentra.slice(0, 6)

        // Só lança quando o dia do mes bate, e nunca no proprio mes do lançamento original
        if (diaTemplate !== diaDeHoje || anoMesTemplate === anoMesDeHoje) {
            continue
        }

        const jaGerado = await pool.query(
            `select 1 from valores where idorigem = $1 and dataentra like $2`,
            [template.idvalor, anoMesDeHoje + '%']
        )

        if (jaGerado.rows.length > 0) {
            continue
        }

        await pool.query(
            `insert into valores (idusuario, idcatego, nomevalor, valorvalor, recorvalor, rescdespes, dataentra, datafinal, discri, idorigem)
             values ($1, $2, $3, $4, 0, $5, $6, null, $7, $8)`,
            [
                template.idusuario,
                template.idcatego,
                template.nomevalor,
                template.valorvalor,
                template.rescdespes,
                hoje,
                template.discri,
                template.idvalor
            ]
        )

        console.log(`Lançamento recorrente gerado: origem idvalor=${template.idvalor} -> ${hoje}`)
    }
}

module.exports = { processarLancamentosRecorrentes }
