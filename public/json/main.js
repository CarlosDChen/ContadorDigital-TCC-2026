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

const btnCalculadoraLimite = document.getElementById("btn_calculadoraLimite");
if (btnCalculadoraLimite) {
    btnCalculadoraLimite.addEventListener("click", () => {
        window.location.href = "calculadoralimite.html";
    });
}

// Modo escuro: o tema inicial ja foi aplicado pelo json/tema.js no <head>,
// aqui so troca e salva a escolha (vale pra todas as paginas)
const btnTema = document.getElementById("btn_tema");
if (btnTema) {
    const atualizarBotaoTema = () => {
        const escuro = document.documentElement.dataset.tema === "escuro";
        const descricao = escuro ? "Ativar modo claro" : "Ativar modo escuro";

        btnTema.textContent = escuro ? "☀️" : "🌙";
        btnTema.setAttribute("aria-label", descricao);
        btnTema.title = descricao;
    };

    btnTema.addEventListener("click", () => {
        const novoTema = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";

        document.documentElement.dataset.tema = novoTema;
        localStorage.setItem("tema", novoTema);
        atualizarBotaoTema();
    });

    atualizarBotaoTema();
}

const btnLogin = document.getElementById("btn_login");
const overlayLogin = document.getElementById("overlay_login");
if (btnLogin && overlayLogin) {
    const btnFecharLogin = document.getElementById("btn_fecharLogin");
    const formLogin = document.getElementById("form_login");
    const msgErroLogin = document.getElementById("msg_erroLogin");

    const overlay2fa = document.getElementById("overlay_2fa");
    const btnFechar2fa = document.getElementById("btn_fechar2fa");
    const form2fa = document.getElementById("form_2fa");
    const msgErro2fa = document.getElementById("msg_erro2fa");
    const inputCodigo2fa = document.getElementById("input_codigo2fa");

    let idUsuarioPendente2fa = null;

    btnLogin.addEventListener("click", () => {
        overlayLogin.classList.add("active");
    });

    btnFecharLogin.addEventListener("click", () => {
        overlayLogin.classList.remove("active");
        formLogin.reset();
    });

    overlayLogin.addEventListener("click", (event) => {
        if (event.target === overlayLogin) {
            overlayLogin.classList.remove("active");
        }
    });

    btnFechar2fa.addEventListener("click", () => {
        overlay2fa.classList.remove("active");
        form2fa.reset();
    });

    overlay2fa.addEventListener("click", (event) => {
        if (event.target === overlay2fa) {
            overlay2fa.classList.remove("active");
        }
    });

    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault();
        msgErroLogin.textContent = "";

        const email = document.getElementById("input_email").value.trim();
        const senha = document.getElementById("input_senha").value;

        try {
            const resposta = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senhaUso: senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                msgErroLogin.textContent = dados.erro || "Não foi possível fazer login.";
                return;
            }

            idUsuarioPendente2fa = dados.idUsuario;
            overlayLogin.classList.remove("active");
            formLogin.reset();
            overlay2fa.classList.add("active");
            inputCodigo2fa.focus();
        } catch (erro) {
            msgErroLogin.textContent = "Não foi possível conectar ao servidor.";
        }
    });

    form2fa.addEventListener("submit", async (event) => {
        event.preventDefault();
        msgErro2fa.textContent = "";

        try {
            const resposta = await fetch("http://localhost:3000/login/verificar-codigo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idUsuario: idUsuarioPendente2fa,
                    codigo: inputCodigo2fa.value.trim()
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                msgErro2fa.textContent = dados.erro || "Não foi possível confirmar o código.";
                return;
            }

            localStorage.setItem("usuarioLogado", JSON.stringify({
                idUsuario: dados.usuario.idUsuario,
                nomeUso: dados.usuario.nomeUso
            }));

            window.location.href = "index.html";
        } catch (erro) {
            msgErro2fa.textContent = "Não foi possível conectar ao servidor.";
        }
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
            window.location.href = "landingPage.html";
        } else if (!window.location.pathname.endsWith("landingPage.html")) {
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

function aplicarMascaraData(valor) {
    return valor
        .replace(/\D/g, "")
        .slice(0, 8)
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d{1,4})$/, "$1/$2");
}

const inputUsuario = document.getElementById("input_usuario");
const contadorUsuario = document.getElementById("contador_usuario");
if (inputUsuario && contadorUsuario) {
    inputUsuario.addEventListener("input", () => {
        const tamanho = inputUsuario.value.length;
        contadorUsuario.textContent = tamanho + "/20 caracteres";
        contadorUsuario.classList.toggle("aviso-limite", tamanho >= 20);
    });
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

const overlaySucessoCadastro = document.getElementById("overlay_sucessoCadastro");
const btnOkSucessoCadastro = document.getElementById("btn_okSucessoCadastro");
if (overlaySucessoCadastro && btnOkSucessoCadastro) {
    btnOkSucessoCadastro.addEventListener("click", () => {
        window.location.href = "landingPage.html";
    });
}

const formCadastro = document.getElementById("form_cadastro");
if (formCadastro) {
    const msgErroCadastro = document.getElementById("msg_erroCadastro");

    formCadastro.addEventListener("submit", async (event) => {
        event.preventDefault();
        msgErroCadastro.textContent = "";

        const nome = document.getElementById("input_nome").value.trim();
        const usuario = document.getElementById("input_usuario").value.trim();
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

        if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(numero)) {
            msgErroCadastro.textContent = "O número deve estar completo, no formato (00) 00000-0000.";
            return;
        }

        if (numero !== confirmarNumero) {
            msgErroCadastro.textContent = "Os números informados não coincidem.";
            return;
        }

        try {
            const resposta = await fetch("http://localhost:3000/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nomeUso: nome,
                    nomeFanUso: usuario,
                    cpfUso: cpf.replace(/\D/g, ""),
                    email: email,
                    telefone: numero.replace(/\D/g, ""),
                    senhaUso: senha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                msgErroCadastro.textContent = dados.erro || "Não foi possível concluir o cadastro.";
                return;
            }

            overlaySucessoCadastro.classList.add("active");
        } catch (erro) {
            msgErroCadastro.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
        }
    });
}

const tabelaLancamentos = document.getElementById("tabela_lancamentos");
if (tabelaLancamentos) {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");

    const overlayLancamento = document.getElementById("overlay_lancamento");
    const formLancamento = document.getElementById("form_lancamento");
    const btnFecharLancamento = document.getElementById("btn_fecharLancamento");
    const tituloModalLancamento = document.getElementById("tituloModalLancamento");
    const selectCategoriaLancamento = document.getElementById("input_categoriaLancamento");
    const msgErroLancamento = document.getElementById("msg_erroLancamento");
    const inputDataLancamento = document.getElementById("input_dataLancamento");
    const inputRecorrente = document.getElementById("input_recorrente");
    const campoDataFinal = document.getElementById("campo_dataFinal");
    const inputDataFinalLancamento = document.getElementById("input_dataFinalLancamento");
    const campoJuros = document.getElementById("campo_juros");
    const inputJurosLancamento = document.getElementById("input_jurosLancamento");

    inputDataLancamento.addEventListener("input", () => {
        inputDataLancamento.value = aplicarMascaraData(inputDataLancamento.value);
    });

    inputDataFinalLancamento.addEventListener("input", () => {
        inputDataFinalLancamento.value = aplicarMascaraData(inputDataFinalLancamento.value);
    });

    inputRecorrente.addEventListener("change", () => {
        campoDataFinal.hidden = !inputRecorrente.checked;
        if (!inputRecorrente.checked) {
            inputDataFinalLancamento.value = "";
        }
    });

    let categorias = [];
    let tipoLancamentoAtual = 0; // 0 = despesa, 1 = receita

    const formatarDataExibicao = (dataEntrada) => {
        const ano = dataEntrada.slice(0, 4);
        const mes = dataEntrada.slice(4, 6);
        const dia = dataEntrada.slice(6, 8);
        return dia + "/" + mes + "/" + ano;
    };

    const nomeCategoria = (idCategoria) => {
        const categoria = categorias.find((item) => item.idCategoria === idCategoria);
        return categoria ? categoria.nomeCategoria : "Sem categoria";
    };

    const carregarCategorias = async () => {
        if (!usuarioLogado) return;

        const resposta = await fetch("http://localhost:3000/categorias/usuario/" + usuarioLogado.idUsuario);
        categorias = await resposta.json();
    };

    const popularSelectCategorias = (tipo) => {
        selectCategoriaLancamento.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
        categorias
            .filter((categoria) => categoria.tipoCategoria === tipo)
            .sort((a, b) => (a.nomeCategoria === "Outro") - (b.nomeCategoria === "Outro"))
            .forEach((categoria) => {
                const opcao = document.createElement("option");
                opcao.value = categoria.idCategoria;
                opcao.textContent = categoria.nomeCategoria;
                selectCategoriaLancamento.appendChild(opcao);
            });
    };

    const carregarLancamentos = async () => {
        if (!usuarioLogado) {
            tabelaLancamentos.innerHTML = '<tr><td colspan="5">Faça login para ver seus lançamentos.</td></tr>';
            return;
        }

        const resposta = await fetch("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario);
        const valores = await resposta.json();

        tabelaLancamentos.innerHTML = "";

        valores.forEach((valor) => {
            const positivo = valor.receitaDespesa === 1;
            const valorFormatado = (positivo ? "R$ " : "-R$ ") + Number(valor.valorValor).toFixed(2);
            const linha = document.createElement("tr");

            // Fixo: e o proprio lançamento recorrente OU foi gerado a partir de um (RD-03/RD-09)
            const fixo = valor.recorValor === 1 || valor.idOrigem !== null;
            const seloTipo = fixo
                ? '<span class="badge-tipo badge-fixo">Fixo</span>'
                : '<span class="badge-tipo badge-variavel">Variável</span>';

            linha.innerHTML =
                "<td>" + formatarDataExibicao(valor.dataEntrada) + "</td>" +
                "<td>" + valor.nomeValor + "</td>" +
                "<td>" + nomeCategoria(valor.idCategoria) + "</td>" +
                "<td>" + seloTipo + "</td>" +
                '<td class="' + (positivo ? "valor-positivo" : "valor-negativo") + '">' + valorFormatado + "</td>";

            tabelaLancamentos.appendChild(linha);
        });
    };

    const abrirModalLancamento = (tipo) => {
        tipoLancamentoAtual = tipo;
        tituloModalLancamento.textContent = tipo === 1 ? "Adicionar Renda" : "Adicionar Gasto";
        formLancamento.reset();
        campoDataFinal.hidden = true;
        campoJuros.hidden = tipo !== 0; // juros por atraso so existe em gasto (fatura/parcelamento)
        msgErroLancamento.textContent = "";
        popularSelectCategorias(tipo);
        overlayLancamento.classList.add("active");
    };

    document.getElementById("btn_adicionarGasto").addEventListener("click", () => abrirModalLancamento(0));
    document.getElementById("btn_adicionarRenda").addEventListener("click", () => abrirModalLancamento(1));

    btnFecharLancamento.addEventListener("click", () => {
        overlayLancamento.classList.remove("active");
    });

    overlayLancamento.addEventListener("click", (event) => {
        if (event.target === overlayLancamento) {
            overlayLancamento.classList.remove("active");
        }
    });

    formLancamento.addEventListener("submit", async (event) => {
        event.preventDefault();
        msgErroLancamento.textContent = "";

        const descricao = document.getElementById("input_descricaoLancamento").value.trim();
        const valor = document.getElementById("input_valorLancamento").value;
        const idCategoria = selectCategoriaLancamento.value;
        const data = inputDataLancamento.value;

        if (!idCategoria) {
            msgErroLancamento.textContent = "Selecione uma categoria.";
            return;
        }

        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
            msgErroLancamento.textContent = "A data deve estar completa, no formato dd/mm/aaaa.";
            return;
        }

        const [dia, mes, ano] = data.split("/");
        const dataEntrada = ano + mes + dia;

        const recorrente = inputRecorrente.checked;
        let dataFinal = null;

        if (recorrente && inputDataFinalLancamento.value) {
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(inputDataFinalLancamento.value)) {
                msgErroLancamento.textContent = "A data final deve estar completa, no formato dd/mm/aaaa.";
                return;
            }

            const [diaFinal, mesFinal, anoFinal] = inputDataFinalLancamento.value.split("/");
            dataFinal = anoFinal + mesFinal + diaFinal;

            if (dataFinal < dataEntrada) {
                msgErroLancamento.textContent = "A data final não pode ser antes da data do lançamento.";
                return;
            }
        }

        const dadosLancamento = {
            idUsuario: usuarioLogado.idUsuario,
            idCategoria: Number(idCategoria),
            nomeValor: descricao,
            valorValor: valor,
            recorValor: recorrente ? 1 : 0,
            receitaDespesa: tipoLancamentoAtual,
            dataEntrada: dataEntrada,
            dataFinal: dataFinal,
            discricao: "",
            jurosValor: tipoLancamentoAtual === 0 && inputJurosLancamento.value !== ""
                ? Number(inputJurosLancamento.value)
                : null
        };

        try {
            let resposta = await fetch("http://localhost:3000/valores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosLancamento)
            });

            let dados = await resposta.json();

            if (!resposta.ok && dados.possivelDuplicado) {
                const confirmou = window.confirm(dados.erro);

                if (!confirmou) {
                    return;
                }

                resposta = await fetch("http://localhost:3000/valores", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...dadosLancamento, confirmarDuplicado: true })
                });

                dados = await resposta.json();
            }

            if (!resposta.ok) {
                msgErroLancamento.textContent = dados.erro || "Não foi possível salvar o lançamento.";
                return;
            }

            overlayLancamento.classList.remove("active");
            carregarLancamentos();
        } catch (erro) {
            msgErroLancamento.textContent = "Não foi possível conectar ao servidor.";
        }
    });

    const overlayCategoria = document.getElementById("overlay_categoria");
    const formCategoria = document.getElementById("form_categoria");
    const btnFecharCategoria = document.getElementById("btn_fecharCategoria");
    const msgErroCategoria = document.getElementById("msg_erroCategoria");

    document.getElementById("btn_adicionarCategoria").addEventListener("click", () => {
        formCategoria.reset();
        msgErroCategoria.textContent = "";
        overlayCategoria.classList.add("active");
    });

    btnFecharCategoria.addEventListener("click", () => {
        overlayCategoria.classList.remove("active");
    });

    overlayCategoria.addEventListener("click", (event) => {
        if (event.target === overlayCategoria) {
            overlayCategoria.classList.remove("active");
        }
    });

    formCategoria.addEventListener("submit", async (event) => {
        event.preventDefault();
        msgErroCategoria.textContent = "";

        const nome = document.getElementById("input_nomeCategoria").value.trim();
        const tipo = document.getElementById("input_tipoCategoria").value;
        const importancia = document.getElementById("input_importanciaCategoria").value;

        try {
            const resposta = await fetch("http://localhost:3000/categorias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idUsuario: usuarioLogado.idUsuario,
                    nomeCategoria: nome,
                    tipoCategoria: Number(tipo),
                    importanciaCategoria: Number(importancia)
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                msgErroCategoria.textContent = dados.erro || "Não foi possível salvar a categoria.";
                return;
            }

            overlayCategoria.classList.remove("active");
            await carregarCategorias();
        } catch (erro) {
            msgErroCategoria.textContent = "Não foi possível conectar ao servidor.";
        }
    });

    (async () => {
        await carregarCategorias();
        await carregarLancamentos();
    })();
}

const rendaEl = document.getElementById("renda");
if (rendaEl) {
    const gastosEl = document.getElementById("gastos");
    const saldoEl = document.getElementById("saldo");
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");

    const carregarResumoMensal = async () => {
        if (!usuarioLogado) {
            rendaEl.textContent = "R$ 0,00";
            gastosEl.textContent = "R$ 0,00";
            saldoEl.textContent = "R$ 0,00";
            return;
        }

        const resposta = await fetch("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario);
        const valores = await resposta.json();

        const hoje = new Date();
        const anoMesAtual = hoje.getFullYear() + String(hoje.getMonth() + 1).padStart(2, "0");
        const valoresDoMes = valores.filter((valor) => valor.dataEntrada.slice(0, 6) === anoMesAtual);

        const renda = valoresDoMes
            .filter((valor) => valor.receitaDespesa === 1)
            .reduce((soma, valor) => soma + Number(valor.valorValor), 0);

        const gastos = valoresDoMes
            .filter((valor) => valor.receitaDespesa === 0)
            .reduce((soma, valor) => soma + Number(valor.valorValor), 0);

        const saldo = renda - gastos;

        rendaEl.textContent = "R$ " + renda.toFixed(2);
        gastosEl.textContent = "R$ " + gastos.toFixed(2);
        saldoEl.textContent = (saldo < 0 ? "-R$ " : "R$ ") + Math.abs(saldo).toFixed(2);

        saldoEl.classList.remove("saldo-positivo", "saldo-negativo");
        saldoEl.classList.add(saldo > 0 ? "saldo-positivo" : "saldo-negativo");
    };

    const avisoFechamento = document.getElementById("aviso_fechamento");

    // Nos ultimos dias do mes, se o saldo estiver negativo, recomenda quais faturas
    // deixar para o proximo mes (as de juros mais baixo primeiro, calculado no backend)
    const carregarAvisoFechamento = async () => {
        if (!usuarioLogado) return;

        const resposta = await fetch("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario + "/fechamento");
        const fechamento = await resposta.json();

        if (!fechamento.emFechamento || !fechamento.noVermelho) return;

        const textoFechamento = document.getElementById("texto_fechamento");
        const tabelaFechamento = document.getElementById("tabela_fechamento");
        const corpoTabelaFechamento = tabelaFechamento.querySelector("tbody");
        const resumoFechamento = document.getElementById("resumo_fechamento");
        const recomendacoes = fechamento.recomendacoes;
        const plural = recomendacoes.length > 1;

        const prazo = fechamento.diasParaFechar === 0
            ? "Hoje é o último dia do mês"
            : "Faltam " + fechamento.diasParaFechar + (fechamento.diasParaFechar === 1 ? " dia" : " dias") + " para o mês fechar";

        textoFechamento.textContent = prazo + " e seus gastos passam a renda em R$ " + Math.abs(fechamento.saldo).toFixed(2) + ". ";

        if (recomendacoes.length === 0) {
            textoFechamento.textContent += "Nenhum gasto deste mês tem juros por atraso cadastrado. Informe a taxa ao lançar faturas e parcelamentos para receber uma recomendação do que deixar para o próximo mês.";
        } else {
            textoFechamento.textContent += "Para não fechar no vermelho, a recomendação é deixar para o próximo mês " +
                (plural ? "as faturas" : "a fatura") + " com os juros mais baixos:";
        }

        corpoTabelaFechamento.innerHTML = "";

        recomendacoes.forEach((fatura) => {
            const linha = document.createElement("tr");

            [
                fatura.nomeValor,
                "R$ " + fatura.valorValor.toFixed(2),
                fatura.jurosValor.toFixed(2) + "%",
                "R$ " + fatura.jurosEstimado.toFixed(2)
            ].forEach((texto) => {
                const celula = document.createElement("td");
                celula.textContent = texto;
                linha.appendChild(celula);
            });

            corpoTabelaFechamento.appendChild(linha);
        });

        tabelaFechamento.hidden = recomendacoes.length === 0;

        if (recomendacoes.length === 0) {
            resumoFechamento.textContent = "";
        } else if (fechamento.saldoAposAdiar >= 0) {
            resumoFechamento.textContent = "Adiando " + (plural ? "essas faturas" : "essa fatura") +
                ", você paga cerca de R$ " + fechamento.jurosEstimados.toFixed(2) +
                " de juros no próximo mês e fecha este mês com saldo de R$ " + fechamento.saldoAposAdiar.toFixed(2) + ".";
        } else {
            resumoFechamento.textContent = "Mesmo adiando todas as faturas com juros cadastrados, o mês ainda fecha negativo em R$ " +
                Math.abs(fechamento.saldoAposAdiar).toFixed(2) + ". Adiá-las custaria cerca de R$ " +
                fechamento.jurosEstimados.toFixed(2) + " de juros no próximo mês.";
        }

        avisoFechamento.hidden = false;
    };

    carregarResumoMensal();
    carregarAvisoFechamento();
}

const graficoPizzaGastos = document.getElementById("grafico_pizza_gastos");
if (graficoPizzaGastos) {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    const tooltipGrafico = document.getElementById("tooltip_grafico");
    const selectMesAno = document.getElementById("select_mesAnoRelatorio");

    const legendaPizzaGastos = document.getElementById("legenda_pizza_gastos");
    const tabelaPizzaGastosCorpo = document.querySelector("#tabela_pizza_gastos tbody");

    const graficoPizzaReceita = document.getElementById("grafico_pizza_receita");
    const legendaPizzaReceita = document.getElementById("legenda_pizza_receita");
    const tabelaPizzaReceitaCorpo = document.querySelector("#tabela_pizza_receita tbody");

    const graficoLinhaRenda = document.getElementById("grafico_linha_renda");
    const tabelaLinhaRendaCorpo = document.querySelector("#tabela_linha_renda tbody");

    const graficoBarrasCategorias = document.getElementById("grafico_barras_categorias");
    const legendaBarrasCategorias = document.getElementById("legenda_barras_categorias");
    const tabelaBarrasCorpo = document.querySelector("#tabela_barras_categorias tbody");

    const NOMES_MESES = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const NOMES_MESES_ABREV = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    // Ordem fixa da paleta categórica (nunca ciclada arbitrariamente).
    // Os valores ficam no style.css (--serie-1 a --serie-8), com versão clara e escura,
    // então os gráficos trocam de cor junto com o tema sem precisar redesenhar
    const PALETA_CATEGORICA = [
        "var(--serie-1)", "var(--serie-2)", "var(--serie-3)", "var(--serie-4)",
        "var(--serie-5)", "var(--serie-6)", "var(--serie-7)", "var(--serie-8)"
    ];

    // Contorno que separa fatias/pontos: a cor do próprio card, em qualquer tema
    const COR_SUPERFICIE = "var(--fundo-card)";

    const COR_RENDA = "#22c55e";
    const COR_OUTROS = "#9ca3af";
    const svgNS = "http://www.w3.org/2000/svg";

    const polarParaCartesiano = (cx, cy, raio, anguloGraus) => {
        const anguloRad = (anguloGraus - 90) * Math.PI / 180;
        return {
            x: cx + raio * Math.cos(anguloRad),
            y: cy + raio * Math.sin(anguloRad)
        };
    };

    const criarFatiaSvg = (cx, cy, raio, anguloInicial, anguloFinal) => {
        const inicio = polarParaCartesiano(cx, cy, raio, anguloFinal);
        const fim = polarParaCartesiano(cx, cy, raio, anguloInicial);
        const arcoGrande = anguloFinal - anguloInicial <= 180 ? 0 : 1;

        return [
            "M", cx, cy,
            "L", inicio.x, inicio.y,
            "A", raio, raio, 0, arcoGrande, 0, fim.x, fim.y,
            "Z"
        ].join(" ");
    };

    const formatarMoeda = (valor) => "R$ " + valor.toFixed(2);

    const mostrarTooltip = (evento, linhas) => {
        tooltipGrafico.innerHTML = "";

        linhas.forEach((linha, indice) => {
            const elemento = document.createElement(indice === 0 ? "strong" : "span");
            elemento.textContent = linha;
            tooltipGrafico.appendChild(elemento);
        });

        tooltipGrafico.classList.add("ativo");
        tooltipGrafico.style.left = evento.clientX + 12 + "px";
        tooltipGrafico.style.top = evento.clientY + 12 + "px";
    };

    const esconderTooltip = () => {
        tooltipGrafico.classList.remove("ativo");
    };

    const agruparComOutros = (somaPorCategoria) => {
        let dados = Object.entries(somaPorCategoria)
            .map(([nome, valor]) => ({ nome, valor }))
            .sort((a, b) => b.valor - a.valor);

        // Mais de 8 fatias vira ruído visual e estoura a paleta segura -> dobra a cauda em "Outros"
        if (dados.length > 8) {
            const principais = dados.slice(0, 7);
            const somaRestante = dados.slice(7).reduce((soma, item) => soma + item.valor, 0);
            dados = principais.concat([{ nome: "Outros", valor: somaRestante }]);
        }

        return dados;
    };

    const renderizarGraficoPizza = (dados, elementos, mensagemVazia) => {
        const { svg, legenda, tabelaCorpo } = elementos;
        const total = dados.reduce((soma, item) => soma + item.valor, 0);

        svg.innerHTML = "";
        legenda.innerHTML = "";
        tabelaCorpo.innerHTML = "";

        if (total === 0) {
            const mensagem = document.createElementNS(svgNS, "text");
            mensagem.setAttribute("x", "100");
            mensagem.setAttribute("y", "104");
            mensagem.setAttribute("text-anchor", "middle");
            mensagem.setAttribute("fill", "#898781");
            mensagem.setAttribute("font-size", "11");
            mensagem.textContent = mensagemVazia;
            svg.appendChild(mensagem);
            return;
        }

        let anguloAtual = 0;

        dados.forEach((item, indice) => {
            const cor = PALETA_CATEGORICA[indice % PALETA_CATEGORICA.length];
            const anguloFinal = anguloAtual + (item.valor / total) * 360;
            const percentual = (item.valor / total) * 100;

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", criarFatiaSvg(100, 100, 90, anguloAtual, anguloFinal));
            path.style.fill = cor;
            path.style.stroke = COR_SUPERFICIE;
            path.setAttribute("stroke-width", "2");
            path.setAttribute("stroke-linejoin", "round");
            path.classList.add("fatia-grafico");
            path.tabIndex = 0;

            const aoInteragir = (evento) => mostrarTooltip(evento, [
                formatarMoeda(item.valor),
                item.nome + " · " + percentual.toFixed(1) + "%"
            ]);
            path.addEventListener("pointermove", aoInteragir);
            path.addEventListener("pointerenter", aoInteragir);
            path.addEventListener("focus", aoInteragir);
            path.addEventListener("pointerleave", esconderTooltip);
            path.addEventListener("blur", esconderTooltip);

            svg.appendChild(path);

            const itemLegenda = document.createElement("li");
            const marcador = document.createElement("span");
            marcador.className = "marcador-legenda";
            marcador.style.background = cor;

            const textoLegenda = document.createElement("span");
            textoLegenda.textContent = item.nome + " (" + percentual.toFixed(1) + "%)";

            itemLegenda.appendChild(marcador);
            itemLegenda.appendChild(textoLegenda);
            legenda.appendChild(itemLegenda);

            const linhaTabela = document.createElement("tr");
            const celulaNome = document.createElement("td");
            celulaNome.textContent = item.nome;
            const celulaValor = document.createElement("td");
            celulaValor.textContent = formatarMoeda(item.valor);
            const celulaPercentual = document.createElement("td");
            celulaPercentual.textContent = percentual.toFixed(1) + "%";

            linhaTabela.appendChild(celulaNome);
            linhaTabela.appendChild(celulaValor);
            linhaTabela.appendChild(celulaPercentual);
            tabelaCorpo.appendChild(linhaTabela);

            anguloAtual = anguloFinal;
        });
    };

    const renderizarGraficoLinha = (pontos) => {
        const svgLargura = 400;
        const svgAltura = 220;
        const padEsq = 46;
        const padDir = 16;
        const padTopo = 16;
        const padBase = 30;
        const larguraUtil = svgLargura - padEsq - padDir;
        const alturaUtil = svgAltura - padTopo - padBase;

        graficoLinhaRenda.innerHTML = "";
        tabelaLinhaRendaCorpo.innerHTML = "";

        if (pontos.length === 0) {
            const mensagem = document.createElementNS(svgNS, "text");
            mensagem.setAttribute("x", String(svgLargura / 2));
            mensagem.setAttribute("y", String(svgAltura / 2));
            mensagem.setAttribute("text-anchor", "middle");
            mensagem.setAttribute("fill", "#898781");
            mensagem.setAttribute("font-size", "11");
            mensagem.textContent = "Sem lançamentos de renda registrados";
            graficoLinhaRenda.appendChild(mensagem);
            return;
        }

        const valorMaximo = Math.max(...pontos.map((ponto) => ponto.valor), 1) * 1.15;

        const coordenadaX = (indice) => pontos.length === 1
            ? padEsq + larguraUtil / 2
            : padEsq + (indice / (pontos.length - 1)) * larguraUtil;

        const coordenadaY = (valor) => padTopo + (1 - valor / valorMaximo) * alturaUtil;

        for (let i = 0; i <= 4; i++) {
            const valorGrade = (valorMaximo / 4) * i;
            const y = coordenadaY(valorGrade);

            const linhaGrade = document.createElementNS(svgNS, "line");
            linhaGrade.setAttribute("x1", String(padEsq));
            linhaGrade.setAttribute("x2", String(svgLargura - padDir));
            linhaGrade.setAttribute("y1", String(y));
            linhaGrade.setAttribute("y2", String(y));
            linhaGrade.classList.add("eixo-grafico");
            graficoLinhaRenda.appendChild(linhaGrade);

            const rotuloY = document.createElementNS(svgNS, "text");
            rotuloY.setAttribute("x", String(padEsq - 6));
            rotuloY.setAttribute("y", String(y + 3));
            rotuloY.setAttribute("text-anchor", "end");
            rotuloY.classList.add("rotulo-eixo");
            rotuloY.textContent = "R$ " + Math.round(valorGrade);
            graficoLinhaRenda.appendChild(rotuloY);
        }

        const caminho = pontos
            .map((ponto, indice) => (indice === 0 ? "M" : "L") + " " + coordenadaX(indice) + " " + coordenadaY(ponto.valor))
            .join(" ");

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", caminho);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", COR_RENDA);
        path.setAttribute("stroke-width", "2");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        graficoLinhaRenda.appendChild(path);

        pontos.forEach((ponto, indice) => {
            const x = coordenadaX(indice);
            const y = coordenadaY(ponto.valor);
            const ano = ponto.anoMes.slice(0, 4);
            const mesNumero = Number(ponto.anoMes.slice(4, 6));
            const rotuloMesCompleto = NOMES_MESES[mesNumero - 1] + "/" + ano;

            const rotuloX = document.createElementNS(svgNS, "text");
            rotuloX.setAttribute("x", String(x));
            rotuloX.setAttribute("y", String(svgAltura - padBase + 16));
            rotuloX.setAttribute("text-anchor", "middle");
            rotuloX.classList.add("rotulo-eixo");
            rotuloX.textContent = NOMES_MESES_ABREV[mesNumero - 1] + "/" + ano.slice(2);
            graficoLinhaRenda.appendChild(rotuloX);

            const areaClique = document.createElementNS(svgNS, "circle");
            areaClique.setAttribute("cx", String(x));
            areaClique.setAttribute("cy", String(y));
            areaClique.setAttribute("r", "12");
            areaClique.setAttribute("fill", "transparent");
            areaClique.classList.add("ponto-linha-grafico");
            areaClique.tabIndex = 0;

            const pontoVisivel = document.createElementNS(svgNS, "circle");
            pontoVisivel.setAttribute("cx", String(x));
            pontoVisivel.setAttribute("cy", String(y));
            pontoVisivel.setAttribute("r", "4");
            pontoVisivel.setAttribute("fill", COR_RENDA);
            pontoVisivel.style.stroke = COR_SUPERFICIE;
            pontoVisivel.setAttribute("stroke-width", "2");

            const aoInteragir = (evento) => mostrarTooltip(evento, [formatarMoeda(ponto.valor), rotuloMesCompleto]);
            areaClique.addEventListener("pointermove", aoInteragir);
            areaClique.addEventListener("pointerenter", aoInteragir);
            areaClique.addEventListener("focus", aoInteragir);
            areaClique.addEventListener("pointerleave", esconderTooltip);
            areaClique.addEventListener("blur", esconderTooltip);

            graficoLinhaRenda.appendChild(pontoVisivel);
            graficoLinhaRenda.appendChild(areaClique);

            const linhaTabela = document.createElement("tr");
            const celulaMes = document.createElement("td");
            celulaMes.textContent = rotuloMesCompleto;
            const celulaValor = document.createElement("td");
            celulaValor.textContent = formatarMoeda(ponto.valor);
            linhaTabela.appendChild(celulaMes);
            linhaTabela.appendChild(celulaValor);
            tabelaLinhaRendaCorpo.appendChild(linhaTabela);
        });
    };

    const renderizarGraficoBarras = (top3, dadosPorMes) => {
        const svgLargura = 400;
        const svgAltura = 220;
        const padEsq = 46;
        const padDir = 16;
        const padTopo = 16;
        const padBase = 30;
        const larguraUtil = svgLargura - padEsq - padDir;
        const alturaUtil = svgAltura - padTopo - padBase;

        graficoBarrasCategorias.innerHTML = "";
        legendaBarrasCategorias.innerHTML = "";
        tabelaBarrasCorpo.innerHTML = "";

        document.getElementById("cabecalho_barra_1").textContent = top3[0] || "-";
        document.getElementById("cabecalho_barra_2").textContent = top3[1] || "-";
        document.getElementById("cabecalho_barra_3").textContent = top3[2] || "-";

        if (dadosPorMes.length === 0) {
            const mensagem = document.createElementNS(svgNS, "text");
            mensagem.setAttribute("x", String(svgLargura / 2));
            mensagem.setAttribute("y", String(svgAltura / 2));
            mensagem.setAttribute("text-anchor", "middle");
            mensagem.setAttribute("fill", "#898781");
            mensagem.setAttribute("font-size", "11");
            mensagem.textContent = "Sem gastos registrados";
            graficoBarrasCategorias.appendChild(mensagem);
            return;
        }

        const cores = [PALETA_CATEGORICA[0], PALETA_CATEGORICA[1], PALETA_CATEGORICA[2], COR_OUTROS];
        const chavesSerie = [...top3, "Outros"];

        // Barras agrupadas (lado a lado), não empilhadas -> escala pelo maior valor individual
        const totalMaximo = Math.max(
            ...dadosPorMes.flatMap((mes) => chavesSerie.map((chave) => mes.valores[chave] || 0)),
            1
        ) * 1.15;

        const larguraGrupo = larguraUtil / dadosPorMes.length;
        const larguraGrupoUtil = larguraGrupo * 0.8;
        const larguraBarra = larguraGrupoUtil / chavesSerie.length;
        const coordenadaY = (valor) => padTopo + (1 - valor / totalMaximo) * alturaUtil;

        for (let i = 0; i <= 4; i++) {
            const valorGrade = (totalMaximo / 4) * i;
            const y = coordenadaY(valorGrade);

            const linhaGrade = document.createElementNS(svgNS, "line");
            linhaGrade.setAttribute("x1", String(padEsq));
            linhaGrade.setAttribute("x2", String(svgLargura - padDir));
            linhaGrade.setAttribute("y1", String(y));
            linhaGrade.setAttribute("y2", String(y));
            linhaGrade.classList.add("eixo-grafico");
            graficoBarrasCategorias.appendChild(linhaGrade);

            const rotuloY = document.createElementNS(svgNS, "text");
            rotuloY.setAttribute("x", String(padEsq - 6));
            rotuloY.setAttribute("y", String(y + 3));
            rotuloY.setAttribute("text-anchor", "end");
            rotuloY.classList.add("rotulo-eixo");
            rotuloY.textContent = "R$ " + Math.round(valorGrade);
            graficoBarrasCategorias.appendChild(rotuloY);
        }

        chavesSerie.forEach((nome, indice) => {
            const itemLegenda = document.createElement("li");
            const marcador = document.createElement("span");
            marcador.className = "marcador-legenda";
            marcador.style.background = cores[indice];

            const textoLegenda = document.createElement("span");
            textoLegenda.textContent = nome;

            itemLegenda.appendChild(marcador);
            itemLegenda.appendChild(textoLegenda);
            legendaBarrasCategorias.appendChild(itemLegenda);
        });

        dadosPorMes.forEach((mes, indiceMes) => {
            const inicioGrupo = padEsq + indiceMes * larguraGrupo + (larguraGrupo - larguraGrupoUtil) / 2;
            const centroGrupo = padEsq + (indiceMes + 0.5) * larguraGrupo;

            const ano = mes.anoMes.slice(0, 4);
            const mesNumero = Number(mes.anoMes.slice(4, 6));
            const rotuloMesCompleto = NOMES_MESES[mesNumero - 1] + "/" + ano;

            const rotuloX = document.createElementNS(svgNS, "text");
            rotuloX.setAttribute("x", String(centroGrupo));
            rotuloX.setAttribute("y", String(svgAltura - padBase + 16));
            rotuloX.setAttribute("text-anchor", "middle");
            rotuloX.classList.add("rotulo-eixo");
            rotuloX.textContent = NOMES_MESES_ABREV[mesNumero - 1] + "/" + ano.slice(2);
            graficoBarrasCategorias.appendChild(rotuloX);

            const valoresLinhaTabela = [rotuloMesCompleto];

            chavesSerie.forEach((chave, indiceSerie) => {
                const valor = mes.valores[chave] || 0;
                const x = inicioGrupo + indiceSerie * larguraBarra;
                const y = coordenadaY(valor);
                const altura = (padTopo + alturaUtil) - y;

                if (valor > 0) {
                    const barra = document.createElementNS(svgNS, "rect");
                    barra.setAttribute("x", String(x));
                    barra.setAttribute("y", String(y));
                    barra.setAttribute("width", String(larguraBarra * 0.85));
                    barra.setAttribute("height", String(altura));
                    barra.style.fill = cores[indiceSerie];
                    barra.classList.add("barra-grafico");
                    barra.tabIndex = 0;

                    const aoInteragir = (evento) => mostrarTooltip(evento, [
                        formatarMoeda(valor),
                        chave + " · " + rotuloMesCompleto
                    ]);
                    barra.addEventListener("pointermove", aoInteragir);
                    barra.addEventListener("pointerenter", aoInteragir);
                    barra.addEventListener("focus", aoInteragir);
                    barra.addEventListener("pointerleave", esconderTooltip);
                    barra.addEventListener("blur", esconderTooltip);

                    graficoBarrasCategorias.appendChild(barra);
                }

                valoresLinhaTabela.push(formatarMoeda(valor));
            });

            const linhaTabela = document.createElement("tr");
            valoresLinhaTabela.forEach((texto) => {
                const celula = document.createElement("td");
                celula.textContent = texto;
                linhaTabela.appendChild(celula);
            });
            tabelaBarrasCorpo.appendChild(linhaTabela);
        });
    };

    let valoresCarregados = [];
    let categoriasCarregadas = [];

    const nomeCategoria = (idCategoria) => {
        const categoria = categoriasCarregadas.find((item) => item.idCategoria === idCategoria);
        return categoria ? categoria.nomeCategoria : "Sem categoria";
    };

    // Só lista meses/anos que realmente têm lançamento cadastrado no banco
    const popularSelectMesAno = () => {
        const anosMeses = Array.from(
            new Set(valoresCarregados.map((valor) => valor.dataEntrada.slice(0, 6)))
        ).sort((a, b) => b.localeCompare(a));

        selectMesAno.innerHTML = "";

        if (anosMeses.length === 0) {
            const opcaoVazia = document.createElement("option");
            opcaoVazia.value = "";
            opcaoVazia.textContent = "Nenhum lançamento cadastrado";
            selectMesAno.appendChild(opcaoVazia);
            return;
        }

        anosMeses.forEach((anoMes) => {
            const ano = anoMes.slice(0, 4);
            const mes = Number(anoMes.slice(4, 6));

            const opcao = document.createElement("option");
            opcao.value = anoMes;
            opcao.textContent = NOMES_MESES[mes - 1] + "/" + ano;
            selectMesAno.appendChild(opcao);
        });

        const hoje = new Date();
        const anoMesAtual = hoje.getFullYear() + String(hoje.getMonth() + 1).padStart(2, "0");
        selectMesAno.value = anosMeses.includes(anoMesAtual) ? anoMesAtual : anosMeses[0];
    };

    const somaPorCategoriaNoMes = (tipo, anoMesSelecionado) => {
        const somaPorCategoria = {};

        valoresCarregados
            .filter((valor) => valor.receitaDespesa === tipo && valor.dataEntrada.slice(0, 6) === anoMesSelecionado)
            .forEach((valor) => {
                const nome = nomeCategoria(valor.idCategoria);
                somaPorCategoria[nome] = (somaPorCategoria[nome] || 0) + Number(valor.valorValor);
            });

        return somaPorCategoria;
    };

    const atualizarGraficosPizza = () => {
        const anoMesSelecionado = selectMesAno.value;

        renderizarGraficoPizza(
            agruparComOutros(somaPorCategoriaNoMes(0, anoMesSelecionado)),
            { svg: graficoPizzaGastos, legenda: legendaPizzaGastos, tabelaCorpo: tabelaPizzaGastosCorpo },
            "Sem gastos neste mês"
        );

        renderizarGraficoPizza(
            agruparComOutros(somaPorCategoriaNoMes(1, anoMesSelecionado)),
            { svg: graficoPizzaReceita, legenda: legendaPizzaReceita, tabelaCorpo: tabelaPizzaReceitaCorpo },
            "Sem receitas neste mês"
        );
    };

    const atualizarGraficoLinha = () => {
        const somaPorMes = {};

        valoresCarregados
            .filter((valor) => valor.receitaDespesa === 1)
            .forEach((valor) => {
                const anoMes = valor.dataEntrada.slice(0, 6);
                somaPorMes[anoMes] = (somaPorMes[anoMes] || 0) + Number(valor.valorValor);
            });

        const pontos = Object.entries(somaPorMes)
            .map(([anoMes, valor]) => ({ anoMes, valor }))
            .sort((a, b) => a.anoMes.localeCompare(b.anoMes));

        renderizarGraficoLinha(pontos);
    };

    const atualizarGraficoBarras = () => {
        const despesas = valoresCarregados.filter((valor) => valor.receitaDespesa === 0);

        const totalPorCategoria = {};
        despesas.forEach((valor) => {
            const nome = nomeCategoria(valor.idCategoria);
            totalPorCategoria[nome] = (totalPorCategoria[nome] || 0) + Number(valor.valorValor);
        });

        const top3 = Object.entries(totalPorCategoria)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([nome]) => nome);

        const mesesUnicos = Array.from(new Set(despesas.map((valor) => valor.dataEntrada.slice(0, 6)))).sort();

        const dadosPorMes = mesesUnicos.map((anoMes) => {
            const despesasDoMes = despesas.filter((valor) => valor.dataEntrada.slice(0, 6) === anoMes);
            const valores = { Outros: 0 };

            despesasDoMes.forEach((valor) => {
                const nome = nomeCategoria(valor.idCategoria);
                if (top3.includes(nome)) {
                    valores[nome] = (valores[nome] || 0) + Number(valor.valorValor);
                } else {
                    valores.Outros += Number(valor.valorValor);
                }
            });

            return { anoMes, valores };
        });

        renderizarGraficoBarras(top3, dadosPorMes);
    };

    const carregarGraficos = async () => {
        if (usuarioLogado) {
            const [respostaValores, respostaCategorias] = await Promise.all([
                fetch("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario),
                fetch("http://localhost:3000/categorias/usuario/" + usuarioLogado.idUsuario)
            ]);

            valoresCarregados = await respostaValores.json();
            categoriasCarregadas = await respostaCategorias.json();
        }

        popularSelectMesAno();
        atualizarGraficosPizza();
        atualizarGraficoLinha();
        atualizarGraficoBarras();
    };

    selectMesAno.addEventListener("change", atualizarGraficosPizza);

    carregarGraficos();
}
