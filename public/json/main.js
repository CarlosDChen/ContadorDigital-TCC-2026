const btnLancamentos = document.getElementById("btn_lancamentos");
if (btnLancamentos) {
    btnLancamentos.addEventListener("click", () => {
        window.location.href = "lancamentos.html";
    });
}

const btnRelatorios = document.getElementById("btn_relatorios");
if (btnRelatorios) {
    btnRelatorios.addEventListener("click", () => {
        window.location.href = "relatorios.html";
    });
}

const btnLimitesDeGastos = document.getElementById("btn_limitesDeGastos");
if (btnLimitesDeGastos) {
    btnLimitesDeGastos.addEventListener("click", () => {
        window.location.href = "limitesdegastos.html";
    });
}

const btnCalculadoras = document.getElementById("btn_Calculadoras");
if (btnCalculadoras) {
    btnCalculadoras.addEventListener("click", () => {
        window.location.href = "calculadoras.html";
    });
}

const lblContador = document.getElementById("lbl_contadorDigital");
if (lblContador) {
    lblContador.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

const rendaEl = document.getElementById("renda");
if (rendaEl) {
    const renda = 1000.00;
    const gastos = 750.00;
    const saldo = renda - gastos;

    rendaEl.textContent = "R$ " + renda.toFixed(2);
    document.getElementById("gastos").textContent = "R$ " + gastos.toFixed(2);
    document.getElementById("saldo").textContent = "R$ " + saldo.toFixed(2);
}
