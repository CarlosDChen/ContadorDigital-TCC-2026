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

    inputDataLancamento.addEventListener("input", () => {
        inputDataLancamento.value = aplicarMascaraData(inputDataLancamento.value);
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
            tabelaLancamentos.innerHTML = '<tr><td colspan="4">Faça login para ver seus lançamentos.</td></tr>';
            return;
        }

        const resposta = await fetch("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario);
        const valores = await resposta.json();

        tabelaLancamentos.innerHTML = "";

        valores.forEach((valor) => {
            const positivo = valor.receitaDespesa === 1;
            const valorFormatado = (positivo ? "R$ " : "-R$ ") + Number(valor.valorValor).toFixed(2);
            const linha = document.createElement("tr");

            linha.innerHTML =
                "<td>" + formatarDataExibicao(valor.dataEntrada) + "</td>" +
                "<td>" + valor.nomeValor + "</td>" +
                "<td>" + nomeCategoria(valor.idCategoria) + "</td>" +
                '<td class="' + (positivo ? "valor-positivo" : "valor-negativo") + '">' + valorFormatado + "</td>";

            tabelaLancamentos.appendChild(linha);
        });
    };

    const abrirModalLancamento = (tipo) => {
        tipoLancamentoAtual = tipo;
        tituloModalLancamento.textContent = tipo === 1 ? "Adicionar Renda" : "Adicionar Gasto";
        formLancamento.reset();
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

        try {
            const resposta = await fetch("http://localhost:3000/valores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idUsuario: usuarioLogado.idUsuario,
                    idCategoria: Number(idCategoria),
                    nomeValor: descricao,
                    valorValor: valor,
                    recorValor: 0,
                    receitaDespesa: tipoLancamentoAtual,
                    dataEntrada: dataEntrada,
                    discricao: ""
                })
            });

            const dados = await resposta.json();

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

        try {
            const resposta = await fetch("http://localhost:3000/categorias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idUsuario: usuarioLogado.idUsuario,
                    nomeCategoria: nome,
                    tipoCategoria: Number(tipo)
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

    carregarResumoMensal();
}

const graficoPizzaGastos = document.getElementById("grafico_pizza_gastos");
if (graficoPizzaGastos) {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    const legendaPizza = document.getElementById("legenda_pizza_gastos");
    const tabelaPizzaCorpo = document.querySelector("#tabela_pizza_gastos tbody");
    const tooltipGrafico = document.getElementById("tooltip_grafico");
    const selectMesAno = document.getElementById("select_mesAnoRelatorio");

    const NOMES_MESES = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Ordem fixa da paleta categórica (nunca ciclada arbitrariamente)
    const PALETA_CATEGORICA = [
        "#2a78d6", "#eb6834", "#1baf7a", "#eda100",
        "#e87ba4", "#008300", "#4a3aa7", "#e34948"
    ];

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

    const mostrarTooltipGrafico = (evento, valor, percentual, nome) => {
        tooltipGrafico.innerHTML = "";

        const linhaValor = document.createElement("strong");
        linhaValor.textContent = formatarMoeda(valor);

        const linhaNome = document.createElement("span");
        linhaNome.textContent = nome + " · " + percentual.toFixed(1) + "%";

        tooltipGrafico.appendChild(linhaValor);
        tooltipGrafico.appendChild(linhaNome);
        tooltipGrafico.classList.add("ativo");
        tooltipGrafico.style.left = evento.clientX + 12 + "px";
        tooltipGrafico.style.top = evento.clientY + 12 + "px";
    };

    const esconderTooltipGrafico = () => {
        tooltipGrafico.classList.remove("ativo");
    };

    const renderizarGraficoPizza = (dados) => {
        const svgNS = "http://www.w3.org/2000/svg";
        const total = dados.reduce((soma, item) => soma + item.valor, 0);

        graficoPizzaGastos.innerHTML = "";
        legendaPizza.innerHTML = "";
        tabelaPizzaCorpo.innerHTML = "";

        if (total === 0) {
            const mensagem = document.createElementNS(svgNS, "text");
            mensagem.setAttribute("x", "100");
            mensagem.setAttribute("y", "104");
            mensagem.setAttribute("text-anchor", "middle");
            mensagem.setAttribute("fill", "#898781");
            mensagem.setAttribute("font-size", "11");
            mensagem.textContent = "Sem gastos neste mês";
            graficoPizzaGastos.appendChild(mensagem);
            return;
        }

        let anguloAtual = 0;

        dados.forEach((item, indice) => {
            const cor = PALETA_CATEGORICA[indice % PALETA_CATEGORICA.length];
            const anguloFinal = anguloAtual + (item.valor / total) * 360;
            const percentual = (item.valor / total) * 100;

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", criarFatiaSvg(100, 100, 90, anguloAtual, anguloFinal));
            path.setAttribute("fill", cor);
            path.setAttribute("stroke", "#ffffff");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("stroke-linejoin", "round");
            path.classList.add("fatia-grafico");
            path.tabIndex = 0;

            const aoInteragir = (evento) => mostrarTooltipGrafico(evento, item.valor, percentual, item.nome);
            path.addEventListener("pointermove", aoInteragir);
            path.addEventListener("pointerenter", aoInteragir);
            path.addEventListener("focus", aoInteragir);
            path.addEventListener("pointerleave", esconderTooltipGrafico);
            path.addEventListener("blur", esconderTooltipGrafico);

            graficoPizzaGastos.appendChild(path);

            const itemLegenda = document.createElement("li");
            const marcador = document.createElement("span");
            marcador.className = "marcador-legenda";
            marcador.style.background = cor;

            const textoLegenda = document.createElement("span");
            textoLegenda.textContent = item.nome + " (" + percentual.toFixed(1) + "%)";

            itemLegenda.appendChild(marcador);
            itemLegenda.appendChild(textoLegenda);
            legendaPizza.appendChild(itemLegenda);

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
            tabelaPizzaCorpo.appendChild(linhaTabela);

            anguloAtual = anguloFinal;
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

    const atualizarGraficoPizza = () => {
        const anoMesSelecionado = selectMesAno.value;
        const somaPorCategoria = {};

        valoresCarregados
            .filter((valor) => valor.receitaDespesa === 0 && valor.dataEntrada.slice(0, 6) === anoMesSelecionado)
            .forEach((valor) => {
                const nome = nomeCategoria(valor.idCategoria);
                somaPorCategoria[nome] = (somaPorCategoria[nome] || 0) + Number(valor.valorValor);
            });

        let dados = Object.entries(somaPorCategoria)
            .map(([nome, valor]) => ({ nome, valor }))
            .sort((a, b) => b.valor - a.valor);

        // Mais de 8 fatias vira ruído visual e estoura a paleta segura -> dobra a cauda em "Outros"
        if (dados.length > 8) {
            const principais = dados.slice(0, 7);
            const somaRestante = dados.slice(7).reduce((soma, item) => soma + item.valor, 0);
            dados = principais.concat([{ nome: "Outros", valor: somaRestante }]);
        }

        renderizarGraficoPizza(dados);
    };

    const carregarGraficoPizza = async () => {
        if (!usuarioLogado) {
            renderizarGraficoPizza([]);
            return;
        }

        const [respostaValores, respostaCategorias] = await Promise.all([
            fetch("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario),
            fetch("http://localhost:3000/categorias/usuario/" + usuarioLogado.idUsuario)
        ]);

        valoresCarregados = await respostaValores.json();
        categoriasCarregadas = await respostaCategorias.json();

        popularSelectMesAno();
        atualizarGraficoPizza();
    };

    selectMesAno.addEventListener("change", atualizarGraficoPizza);

    carregarGraficoPizza();
}
