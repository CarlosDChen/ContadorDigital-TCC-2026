const pool = require('../config/db')
const { dataDeHoje, mesSeguinte, somarMeses, diferencaEmMeses, diaNoMes } = require('../utils/dataUtils')

const processarLancamentosRecorrentes = async () => {
    const hoje = dataDeHoje()
    const anoMesDeHoje = hoje.slice(0, 6)

    const templates = await pool.query('select * from valores where recorvalor = 1')

    for (const template of templates.rows) {
        const anoMesTemplate = template.dataentra.slice(0, 6)
        const diaTemplate = template.dataentra.slice(6, 8)
        let anoMes = mesSeguinte(template.mesrecor || anoMesTemplate)
        let ultimoMesProcessado = null

        while (anoMes <= anoMesDeHoje) {
            const dataDaCopia = diaNoMes(anoMes, diaTemplate)

            if (dataDaCopia > hoje || (template.datafinal && dataDaCopia > template.datafinal)) {
                break
            }

            const jaGerado = await pool.query(
                'select 1 from valores where idorigem = $1 and dataentra like $2',
                [template.idvalor, anoMes + '%']
            )

            if (jaGerado.rows.length === 0) {
                const dataVencimentoDaCopia = template.datavenc
                    ? diaNoMes(
                        somarMeses(template.datavenc.slice(0, 6), diferencaEmMeses(anoMesTemplate, anoMes)),
                        template.datavenc.slice(6, 8)
                    )
                    : null

                await pool.query(
                    `insert into valores (idusuario, idcatego, nomevalor, valorvalor, recorvalor, rescdespes, dataentra, datafinal, discri, idorigem, datavenc)
                     values ($1, $2, $3, $4, 0, $5, $6, null, $7, $8, $9)`,
                    [
                        template.idusuario,
                        template.idcatego,
                        template.nomevalor,
                        template.valorvalor,
                        template.rescdespes,
                        dataDaCopia,
                        template.discri,
                        template.idvalor,
                        dataVencimentoDaCopia
                    ]
                )

                console.log(`Lançamento recorrente gerado: origem idvalor=${template.idvalor} -> ${dataDaCopia}`)
            }

            ultimoMesProcessado = anoMes
            anoMes = mesSeguinte(anoMes)
        }

        if (ultimoMesProcessado) {
            await pool.query(
                'update valores set mesrecor = $1 where idvalor = $2',
                [ultimoMesProcessado, template.idvalor]
            )
        }
    }
}

module.exports = { processarLancamentosRecorrentes }
