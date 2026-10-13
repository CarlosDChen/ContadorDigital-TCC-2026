const formatarData = (data) => {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}${mes}${dia}`
}

const textoParaData = (dataTexto) =>
    new Date(Number(dataTexto.slice(0, 4)), Number(dataTexto.slice(4, 6)) - 1, Number(dataTexto.slice(6, 8)))

const dataDeHoje = () => formatarData(new Date())

const dataValida = (dataTexto) =>
    /^\d{8}$/.test(String(dataTexto)) && formatarData(textoParaData(String(dataTexto))) === String(dataTexto)

const somarDias = (dataTexto, dias) => {
    const data = textoParaData(dataTexto)
    data.setDate(data.getDate() + dias)
    return formatarData(data)
}

const diasEntre = (dataInicial, dataFinal) =>
    Math.round((textoParaData(dataFinal) - textoParaData(dataInicial)) / 86400000)

const somarMeses = (anoMes, quantidade) => {
    const totalMeses = Number(anoMes.slice(0, 4)) * 12 + Number(anoMes.slice(4, 6)) - 1 + quantidade
    return `${Math.floor(totalMeses / 12)}${String(totalMeses % 12 + 1).padStart(2, '0')}`
}

const mesSeguinte = (anoMes) => somarMeses(anoMes, 1)

const diferencaEmMeses = (anoMesInicial, anoMesFinal) =>
    (Number(anoMesFinal.slice(0, 4)) - Number(anoMesInicial.slice(0, 4))) * 12 +
    Number(anoMesFinal.slice(4, 6)) - Number(anoMesInicial.slice(4, 6))

const diaNoMes = (anoMes, dia) => {
    const ultimoDia = new Date(Number(anoMes.slice(0, 4)), Number(anoMes.slice(4, 6)), 0).getDate()
    return anoMes + String(Math.min(Number(dia), ultimoDia)).padStart(2, '0')
}

module.exports = {
    dataDeHoje,
    dataValida,
    somarDias,
    diasEntre,
    somarMeses,
    mesSeguinte,
    diferencaEmMeses,
    diaNoMes
}
