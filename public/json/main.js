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

const btnLogin = document.getElementById("btn_login");
const overlayLogin = document.getElementById("overlay_login");
if (btnLogin && overlayLogin) {
    const btnFecharLogin = document.getElementById("btn_fecharLogin");
    const formLogin = document.getElementById("form_login");

    btnLogin.addEventListener("click", () => {
        overlayLogin.classList.add("active");
    });

    btnFecharLogin.addEventListener("click", () => {
        overlayLogin.classList.remove("active");
    });

    overlayLogin.addEventListener("click", (event) => {
        if (event.target === overlayLogin) {
            overlayLogin.classList.remove("active");
        }
    });

    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();
        overlayLogin.classList.remove("active");
    });
}

const btnCadastro = document.getElementById("btn_cadastro");
if (btnCadastro) {
    btnCadastro.addEventListener("click", () => {
        window.location.href = "cadastro.html";
    });
}

const lblContador = document.getElementById("lbl_contadorDigital");
if (lblContador) {
    lblContador.addEventListener("click", () => {
        if (window.location.pathname.endsWith("cadastro.html")) {
            window.location.href = "menu.html";
        } else if (!window.location.pathname.endsWith("menu.html")) {
            window.location.href = "index.html";
        }
    });
}

const botoesToggleSenha = document.querySelectorAll(".btn-toggle-senha");
botoesToggleSenha.forEach((botao) => {
    botao.addEventListener("click", () => {
        const input = document.getElementById(botao.dataset.alvo);
        const visivel = input.type === "text";

        input.type = visivel ? "password" : "text";
        botao.textContent = visivel ? "👁" : "--";
        botao.setAttribute("aria-label", visivel ? "Mostrar senha" : "Ocultar senha");
    });
});

function aplicarMascaraCpf(valor) {
    return valor
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function aplicarMascaraTelefone(valor) {
    return valor
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

const inputCpf = document.getElementById("input_cpf");
if (inputCpf) {
    inputCpf.addEventListener("input", () => {
        inputCpf.value = aplicarMascaraCpf(inputCpf.value);
    });
}

const inputNumero = document.getElementById("input_numero");
if (inputNumero) {
    inputNumero.addEventListener("input", () => {
        inputNumero.value = aplicarMascaraTelefone(inputNumero.value);
    });
}

const inputConfirmarNumero = document.getElementById("input_confirmarNumero");
if (inputConfirmarNumero) {
    inputConfirmarNumero.addEventListener("input", () => {
        inputConfirmarNumero.value = aplicarMascaraTelefone(inputConfirmarNumero.value);
    });
}

const formCadastro = document.getElementById("form_cadastro");
if (formCadastro) {
    const msgErroCadastro = document.getElementById("msg_erroCadastro");

    formCadastro.addEventListener("submit", (event) => {
        event.preventDefault();
        msgErroCadastro.textContent = "";

        const cpf = document.getElementById("input_cpf").value.trim();
        const email = document.getElementById("input_email").value.trim();
        const confirmarEmail = document.getElementById("input_confirmarEmail").value.trim();
        const senha = document.getElementById("input_senha").value;
        const confirmarSenha = document.getElementById("input_confirmarSenha").value;
        const numero = document.getElementById("input_numero").value.trim();
        const confirmarNumero = document.getElementById("input_confirmarNumero").value.trim();

        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
            msgErroCadastro.textContent = "O CPF deve estar completo, no formato 000.000.000-00.";
            return;
        }

        if (email !== confirmarEmail) {
            msgErroCadastro.textContent = "Os e-mails informados não coincidem.";
            return;
        }

        if (senha.length !== 9) {
            msgErroCadastro.textContent = "A senha deve ter exatamente 9 caracteres.";
            return;
        }

        if (senha !== confirmarSenha) {
            msgErroCadastro.textContent = "As senhas informadas não coincidem.";
            return;
        }

        if (numero !== confirmarNumero) {
            msgErroCadastro.textContent = "Os números informados não coincidem.";
            return;
        }

        window.location.href = "menu.html";
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
