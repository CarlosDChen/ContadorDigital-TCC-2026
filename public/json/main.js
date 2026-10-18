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

// Chamadas ao backend que exigem login: manda o token da sessao (recebido no 2FA)
// no cabeçalho. Se a sessao expirou ou e invalida (401), limpa o login e volta
// pra tela inicial. Cadastro e login continuam usando o fetch normal
const fetchApi = async (url, opcoes = {}) => {
    const sessao = JSON.parse(localStorage.getItem("usuarioLogado") || "null");

    const resposta = await fetch(url, {
        ...opcoes,
        headers: {
            ...opcoes.headers,
            Authorization: "Bearer " + (sessao && sessao.token ? sessao.token : "")
        }
    });

    if (resposta.status === 401) {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "landingPage.html";
        return new Promise(() => {}); // nao continua o fluxo enquanto a pagina troca
    }

    return resposta;
};

const dataDeHojeTexto = () => {
    const hoje = new Date();
    return hoje.getFullYear() + String(hoje.getMonth() + 1).padStart(2, "0") + String(hoje.getDate()).padStart(2, "0");
};

const formatarDataCurta = (data) => data.slice(6, 8) + "/" + data.slice(4, 6) + "/" + data.slice(2, 4);

const buscarAvisosVencimento = async () => {
    const sessao = JSON.parse(localStorage.getItem("usuarioLogado") || "null");

    if (!sessao) {
        return [];
    }

    try {
        const resposta = await fetchApi("http://localhost:3000/valores/vencimentos/usuario/" + sessao.idUsuario);
        return resposta.ok ? await resposta.json() : [];
    } catch (erro) {
        return [];
    }
};

const textoPrazoVencimento = (aviso) => {
    if (aviso.situacao === "vencido") {
        return "venceu em " + formatarDataCurta(aviso.dataVencimento);
    }

    if (aviso.diasParaVencer === 0) {
        return "vence hoje";
    }

    return aviso.diasParaVencer === 1 ? "vence amanhã" : "vence em " + aviso.diasParaVencer + " dias";
};

const textoSeloVencimento = (aviso) => {
    if (aviso.situacao === "vencido") {
        return "Vencido";
    }

    if (aviso.diasParaVencer === 0) {
        return "Vence hoje";
    }

    return aviso.diasParaVencer === 1 ? "Vence amanhã" : "Vence em " + aviso.diasParaVencer + " dias";
};

const descreverAvisoVencimento = (aviso) =>
    aviso.nomeValor + " " + textoPrazoVencimento(aviso) + " (R$ " + Number(aviso.valorValor).toFixed(2) + ")";

const renderizarAvisosVencimento = (bloco, avisos) => {
    const lista = bloco.querySelector("ul");
    lista.innerHTML = "";
    bloco.hidden = avisos.length === 0;

    avisos.forEach((aviso) => {
        const item = document.createElement("li");
        item.className = aviso.situacao === "vencido" ? "aviso-vencido" : "aviso-a-vencer";
        item.textContent = "⚠ " + descreverAvisoVencimento(aviso);
        lista.appendChild(item);
    });
};

// RNF-05.1: explicacao curta dos termos financeiros, mostrada ao passar o mouse
// (ou focar com o teclado). Pra explicar um termo novo: escreva o texto aqui e
// marque o texto na pagina com <span class="termo" data-termo="chave">Texto</span>
const GLOSSARIO = {
    renda: "Todo o dinheiro que entrou neste mês, como salário, vendas e benefícios.",
    gastos: "Todo o dinheiro que saiu neste mês, como contas, compras e lazer.",
    saldo: "Quanto sobrou no mês: a renda menos os gastos. Se ficar negativo, você gastou mais do que ganhou.",
    valoresEmAberto: "Os valores do mês atual, que ainda não terminou. Eles mudam até o fim do mês, conforme entram novas rendas, gastos e lançamentos recorrentes.",
    tipoLancamento: "Fixo: se repete todo mês, como aluguel ou salário. Variável: acontece uma vez só, como mercado ou uma compra.",
    fixo: "Se repete todo mês, como aluguel ou salário. O sistema lança sozinho, no mesmo dia de cada mês.",
    variavel: "Lançado uma vez só, não se repete todo mês. Ex.: mercado, lazer ou uma compra.",
    importancia: "Em qual parte da regra 50-30-20 esse gasto entra. 1 = necessidade (ex.: aluguel). 2 = desejo (ex.: lazer). 3 = reserva (ex.: investimento).",
    rendaAtiva: "Dinheiro que você ganha trabalhando, como o salário do seu emprego principal.",
    rendaAtivaSecundaria: "Dinheiro de um trabalho extra, além do principal, como um bico ou freela.",
    rendaPassiva: "Dinheiro que entra sem você precisar trabalhar por ele, como um aluguel que você recebe ou o rendimento de um investimento.",
    gastosPorCategoria: "Mostra em que você gastou no mês escolhido. Cada fatia é uma categoria: quanto maior a fatia, mais dinheiro foi pra ela.",
    receitaPorCategoria: "Mostra de onde veio o seu dinheiro no mês escolhido. Receita é tudo o que você recebeu.",
    evolucaoRenda: "Mostra quanto você ganhou em cada mês, pra ver se a sua renda está subindo ou caindo.",
    categoriasGastosMensais: "Compara, mês a mês, as 3 categorias em que você mais gasta. O resto aparece junto em \"Outros\"."
};

// Categorias padrão de receita com nome técnico, pelo número do molde (categoria_padrao).
// Vale mesmo se o usuário renomear a categoria, porque o idTemplate não muda
const TERMO_POR_CATEGORIA_PADRAO = {
    12: "rendaAtiva",
    13: "rendaAtivaSecundaria",
    14: "rendaPassiva"
};

const termoDaCategoria = (categoria) => categoria ? TERMO_POR_CATEGORIA_PADRAO[categoria.idTemplate] : undefined;

const dicaTermo = document.createElement("div");
dicaTermo.id = "dica_termo";
dicaTermo.className = "dica-termo";
dicaTermo.setAttribute("role", "tooltip");
document.body.appendChild(dicaTermo);

// Termos escritos direto no HTML podem receber foco pelo teclado (Tab)
document.querySelectorAll(".termo[data-termo]").forEach((termo) => {
    termo.tabIndex = 0;
});

const mostrarDicaTermo = (elemento) => {
    const texto = GLOSSARIO[elemento.dataset.termo];
    if (!texto) return;

    dicaTermo.textContent = texto;
    elemento.setAttribute("aria-describedby", "dica_termo");

    // Abre embaixo do termo; se não couber na tela, abre em cima
    const caixa = elemento.getBoundingClientRect();
    const margem = 8;
    const esquerda = Math.min(caixa.left, window.innerWidth - dicaTermo.offsetWidth - margem);
    let topo = caixa.bottom + margem;

    if (topo + dicaTermo.offsetHeight > window.innerHeight - margem) {
        topo = caixa.top - dicaTermo.offsetHeight - margem;
    }

    dicaTermo.style.left = Math.max(margem, esquerda) + "px";
    dicaTermo.style.top = topo + "px";
    dicaTermo.classList.add("ativa");
};

const esconderDicaTermo = () => {
    dicaTermo.classList.remove("ativa");
};

// Escuta no documento inteiro, assim funciona também nos termos criados depois pelo JS
// (selos Fixo/Variável da tabela, legendas dos gráficos)
document.addEventListener("mouseover", (evento) => {
    const termo = evento.target.closest("[data-termo]");
    if (termo) mostrarDicaTermo(termo);
});

document.addEventListener("mouseout", (evento) => {
    const termo = evento.target.closest("[data-termo]");
    if (termo && !termo.contains(evento.relatedTarget)) esconderDicaTermo();
});

document.addEventListener("focusin", (evento) => {
    const termo = evento.target.closest("[data-termo]");
    if (termo) mostrarDicaTermo(termo);
});

document.addEventListener("focusout", esconderDicaTermo);

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") esconderDicaTermo();
});

// Se a página rolar ou a janela mudar de tamanho, o termo sai do lugar: fecha a explicação
window.addEventListener("scroll", esconderDicaTermo, true);
window.addEventListener("resize", esconderDicaTermo);

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
                nomeUso: dados.usuario.nomeUso,
                token: dados.token
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
    const campoVencimento = document.getElementById("campo_vencimento");
    const inputVencimentoLancamento = document.getElementById("input_vencimentoLancamento");
    const campoRecorrente = document.getElementById("campo_recorrente");
    const msgInfoLancamento = document.getElementById("msg_infoLancamento");
    const inputDescricaoLancamento = document.getElementById("input_descricaoLancamento");
    const inputValorLancamento = document.getElementById("input_valorLancamento");
    let idLancamentoEditando = null;

    const overlayExcluir = document.getElementById("overlay_excluir");
    const lblExcluirLancamento = document.getElementById("lbl_excluirLancamento");
    const lblAvisoExcluir = document.getElementById("lbl_avisoExcluir");
    const msgErroExcluir = document.getElementById("msg_erroExcluir");
    const btnCancelarExcluir = document.getElementById("btn_cancelarExcluir");
    const btnConfirmarExcluir = document.getElementById("btn_confirmarExcluir");
    let lancamentoParaExcluir = null;
    const blocoAvisosLancamentos = document.getElementById("avisos_vencimento");
    const inputAnoLancamentos = document.getElementById("input_anoLancamentos");
    const listaAnosLancamentos = document.getElementById("lista_anosLancamentos");
    const msgAnoLancamentos = document.getElementById("msg_anoLancamentos");
    const ANO_MINIMO = 1900;
    const ANO_MAXIMO = 2200;
    let anoLancamentos = String(new Date().getFullYear());
    inputAnoLancamentos.value = anoLancamentos;

    const overlayJurosAtraso = document.getElementById("overlay_juros");
    const formJurosAtraso = document.getElementById("form_juros");
    const msgErroJurosAtraso = document.getElementById("msg_erroJuros");
    const lblGastoJurosAtraso = document.getElementById("lbl_gastoJuros");
    const inputValorJurosAtraso = document.getElementById("input_valorJuros");
    const checkJurosRealAtraso = document.getElementById("check_jurosReal");
    const checkJurosPorcentagemAtraso = document.getElementById("check_jurosPorcentagem");
    const checkSemJurosAtraso = document.getElementById("check_semJuros");
    const checksTipoJurosAtraso = [checkJurosRealAtraso, checkJurosPorcentagemAtraso, checkSemJurosAtraso];
    let gastoAtrasado = null;

    inputDataLancamento.addEventListener("input", () => {
        inputDataLancamento.value = aplicarMascaraData(inputDataLancamento.value);
    });

    inputVencimentoLancamento.addEventListener("input", () => {
        inputVencimentoLancamento.value = aplicarMascaraData(inputVencimentoLancamento.value);
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
        const ano = dataEntrada.slice(2, 4);
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

        const resposta = await fetchApi("http://localhost:3000/categorias/usuario/" + usuarioLogado.idUsuario);
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

    let valoresLancamentos = [];
    let avisoPorGastoLancamentos = {};
    let previsaoPorGastoLancamentos = {};

    const anoValido = (texto) =>
        /^\d{4}$/.test(texto) && Number(texto) >= ANO_MINIMO && Number(texto) <= ANO_MAXIMO;

    let anosComLancamento = new Set();
    let indiceAnoAtivo = -1;

    const itensListaAnos = () => Array.from(listaAnosLancamentos.children);

    const destacarAnoAtivo = (centralizar) => {
        const itens = itensListaAnos();
        itens.forEach((item, indice) => item.classList.toggle("ativo", indice === indiceAnoAtivo));

        const ativo = itens[indiceAnoAtivo];

        if (!ativo) {
            inputAnoLancamentos.removeAttribute("aria-activedescendant");
            return;
        }

        inputAnoLancamentos.setAttribute("aria-activedescendant", ativo.id);

        if (centralizar) {
            listaAnosLancamentos.scrollTop = ativo.offsetTop - (listaAnosLancamentos.clientHeight - ativo.offsetHeight) / 2;
        } else if (ativo.offsetTop < listaAnosLancamentos.scrollTop) {
            listaAnosLancamentos.scrollTop = ativo.offsetTop;
        } else if (ativo.offsetTop + ativo.offsetHeight > listaAnosLancamentos.scrollTop + listaAnosLancamentos.clientHeight) {
            listaAnosLancamentos.scrollTop = ativo.offsetTop + ativo.offsetHeight - listaAnosLancamentos.clientHeight;
        }
    };

    const montarListaAnos = () => {
        const texto = inputAnoLancamentos.value.trim();
        const filtro = anoValido(texto) ? "" : texto;

        listaAnosLancamentos.innerHTML = "";

        for (let ano = ANO_MINIMO; ano <= ANO_MAXIMO; ano++) {
            const anoTexto = String(ano);

            if (!anoTexto.startsWith(filtro)) {
                continue;
            }

            const item = document.createElement("li");
            item.id = "opcao_ano_" + anoTexto;
            item.dataset.ano = anoTexto;
            item.setAttribute("role", "option");
            item.setAttribute("aria-selected", anoTexto === anoLancamentos ? "true" : "false");

            const textoAno = document.createElement("span");
            textoAno.textContent = anoTexto;
            item.appendChild(textoAno);

            if (anosComLancamento.has(anoTexto)) {
                const marca = document.createElement("span");
                marca.className = "marca-ano";
                marca.textContent = "com lançamentos";
                item.appendChild(marca);
            }

            item.addEventListener("mousedown", (evento) => {
                evento.preventDefault();
                escolherAno(anoTexto);
            });

            listaAnosLancamentos.appendChild(item);
        }

        const itens = itensListaAnos();
        indiceAnoAtivo = itens.findIndex((item) => item.dataset.ano === (filtro ? "" : anoLancamentos));

        if (indiceAnoAtivo === -1 && itens.length > 0) {
            indiceAnoAtivo = 0;
        }

        destacarAnoAtivo(true);
    };

    const abrirListaAnos = () => {
        if (listaAnosLancamentos.hidden) {
            listaAnosLancamentos.hidden = false;
            inputAnoLancamentos.setAttribute("aria-expanded", "true");
        }

        montarListaAnos();
    };

    const fecharListaAnos = () => {
        listaAnosLancamentos.hidden = true;
        inputAnoLancamentos.setAttribute("aria-expanded", "false");
        inputAnoLancamentos.removeAttribute("aria-activedescendant");
    };

    const escolherAno = (ano) => {
        inputAnoLancamentos.value = ano;
        aplicarAnoDigitado();
        fecharListaAnos();
    };

    const popularListaAnosLancamentos = () => {
        anosComLancamento = new Set(valoresLancamentos.map((valor) => valor.dataEntrada.slice(0, 4)));

        if (!listaAnosLancamentos.hidden) {
            montarListaAnos();
        }
    };

    const aplicarAnoDigitado = () => {
        const texto = inputAnoLancamentos.value.trim();

        if (!anoValido(texto)) {
            if (texto.length === 4) {
                inputAnoLancamentos.setAttribute("aria-invalid", "true");
                msgAnoLancamentos.textContent = "Digite um ano entre " + ANO_MINIMO + " e " + ANO_MAXIMO + ".";
            }
            return;
        }

        inputAnoLancamentos.removeAttribute("aria-invalid");
        msgAnoLancamentos.textContent = "";

        if (texto !== anoLancamentos) {
            anoLancamentos = texto;
            renderizarTabelaLancamentos();
        }
    };

    inputAnoLancamentos.addEventListener("input", () => {
        inputAnoLancamentos.value = inputAnoLancamentos.value.replace(/\D/g, "").slice(0, 4);
        inputAnoLancamentos.removeAttribute("aria-invalid");
        msgAnoLancamentos.textContent = "";
        aplicarAnoDigitado();
        abrirListaAnos();
    });

    inputAnoLancamentos.addEventListener("click", abrirListaAnos);

    inputAnoLancamentos.addEventListener("keydown", (evento) => {
        const itens = itensListaAnos();

        if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
            evento.preventDefault();

            if (listaAnosLancamentos.hidden) {
                abrirListaAnos();
                return;
            }

            const passo = evento.key === "ArrowDown" ? 1 : -1;
            indiceAnoAtivo = Math.max(0, Math.min(itens.length - 1, indiceAnoAtivo + passo));
            destacarAnoAtivo(false);
        } else if (evento.key === "Enter" && !listaAnosLancamentos.hidden && itens[indiceAnoAtivo]) {
            evento.preventDefault();
            escolherAno(itens[indiceAnoAtivo].dataset.ano);
        } else if (evento.key === "Escape" && !listaAnosLancamentos.hidden) {
            evento.preventDefault();
            fecharListaAnos();
        }
    });

    inputAnoLancamentos.addEventListener("blur", () => {
        fecharListaAnos();

        if (!anoValido(inputAnoLancamentos.value.trim())) {
            inputAnoLancamentos.value = anoLancamentos;
            inputAnoLancamentos.removeAttribute("aria-invalid");
            msgAnoLancamentos.textContent = "";
        }
    });

    const btnAbrirAnos = document.getElementById("btn_abrirAnos");

    btnAbrirAnos.addEventListener("mousedown", (evento) => {
        evento.preventDefault();
    });

    btnAbrirAnos.addEventListener("click", () => {
        if (listaAnosLancamentos.hidden) {
            inputAnoLancamentos.focus();
            abrirListaAnos();
        } else {
            fecharListaAnos();
        }
    });

    const carregarLancamentos = async () => {
        if (!usuarioLogado) {
            tabelaLancamentos.innerHTML = '<tr><td colspan="7">Faça login para ver seus lançamentos.</td></tr>';
            return;
        }

        const [resposta, avisos, respostaPrevisoes] = await Promise.all([
            fetchApi("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario),
            buscarAvisosVencimento(),
            fetchApi("http://localhost:3000/previsoes/usuario/" + usuarioLogado.idUsuario)
        ]);
        valoresLancamentos = await resposta.json();

        const previsoes = respostaPrevisoes.ok ? await respostaPrevisoes.json() : [];
        previsaoPorGastoLancamentos = {};
        previsoes.forEach((previsao) => {
            previsaoPorGastoLancamentos[String(previsao.idGasto)] = previsao;
        });

        renderizarAvisosVencimento(blocoAvisosLancamentos, avisos);

        avisoPorGastoLancamentos = {};
        avisos.forEach((aviso) => {
            avisoPorGastoLancamentos[String(aviso.idValor)] = aviso;
        });

        popularListaAnosLancamentos();
        renderizarTabelaLancamentos();
    };

    const renderizarTabelaLancamentos = () => {
        const valores = valoresLancamentos;
        const avisoPorGasto = avisoPorGastoLancamentos;
        const valoresDoAno = valores.filter((valor) => valor.dataEntrada.slice(0, 4) === anoLancamentos);

        tabelaLancamentos.innerHTML = "";

        if (valoresDoAno.length === 0) {
            const linhaVazia = document.createElement("tr");
            const celulaVazia = document.createElement("td");
            celulaVazia.colSpan = 7;
            celulaVazia.textContent = "Nenhum lançamento neste ano.";
            linhaVazia.appendChild(celulaVazia);
            tabelaLancamentos.appendChild(linhaVazia);
            return;
        }

        const grupos = new Map();
        const linhasParaExibir = [];

        valoresDoAno.forEach((valor) => {
            const chaveGrupo = valor.idOrigem !== null
                ? String(valor.idOrigem)
                : (valor.recorValor === 1 ? String(valor.idValor) : null);

            if (chaveGrupo === null) {
                linhasParaExibir.push([valor]);
                return;
            }

            if (!grupos.has(chaveGrupo)) {
                grupos.set(chaveGrupo, []);
                linhasParaExibir.push(grupos.get(chaveGrupo));
            }

            grupos.get(chaveGrupo).push(valor);
        });

        const contemValor = (grupo, idValor) => grupo.some((item) => String(item.idValor) === idValor);

        const linhasFilhas = linhasParaExibir.filter((grupo) =>
            grupo.length === 1 &&
            grupo[0].idPendente &&
            linhasParaExibir.some((outro) => contemValor(outro, String(grupo[0].idPendente)))
        );

        const linhasOrdenadas = linhasParaExibir.filter((grupo) => !linhasFilhas.includes(grupo));

        linhasFilhas
            .sort((a, b) => a[0].dataEntrada.localeCompare(b[0].dataEntrada))
            .forEach((filha) => {
                const idPai = String(filha[0].idPendente);
                let posicao = linhasOrdenadas.findIndex((grupo) => contemValor(grupo, idPai));

                while (
                    posicao + 1 < linhasOrdenadas.length &&
                    linhasOrdenadas[posicao + 1].length === 1 &&
                    String(linhasOrdenadas[posicao + 1][0].idPendente) === idPai
                ) {
                    posicao++;
                }

                linhasOrdenadas.splice(posicao + 1, 0, filha);
            });

        const montarLinhaLancamento = (grupo, indiceSelecionado) => {
            const valor = grupo[indiceSelecionado];
            const positivo = valor.receitaDespesa === 1;
            const valorFormatado = (positivo ? "R$ " : "-R$ ") + Number(valor.valorValor).toFixed(2);
            const ehFilha = linhasFilhas.includes(grupo);
            const linha = document.createElement("tr");

            // Fixo: e o proprio lançamento recorrente OU foi gerado a partir de um (RD-03/RD-09)
            const fixo = valor.recorValor === 1 || valor.idOrigem !== null;
            const seloTipo = document.createElement("span");
            seloTipo.className = "badge-tipo " + (fixo ? "badge-fixo" : "badge-variavel");
            seloTipo.textContent = fixo ? "Fixo" : "Variável";
            seloTipo.dataset.termo = fixo ? "fixo" : "variavel";

            const celulaData = document.createElement("td");

            if (grupo.length > 1) {
                const selectDatas = document.createElement("select");
                selectDatas.className = "select-datas-recorrente";
                selectDatas.setAttribute("aria-label", "Datas de " + valor.nomeValor + " (" + grupo.length + " lançamentos)");

                grupo.forEach((item, indice) => {
                    const opcao = document.createElement("option");
                    opcao.value = String(indice);
                    opcao.textContent = formatarDataExibicao(item.dataEntrada);
                    selectDatas.appendChild(opcao);
                });

                selectDatas.value = String(indiceSelecionado);
                selectDatas.addEventListener("change", () => {
                    const novaLinha = montarLinhaLancamento(grupo, Number(selectDatas.value));
                    linha.replaceWith(novaLinha);
                    novaLinha.querySelector(".select-datas-recorrente").focus();
                });

                celulaData.appendChild(selectDatas);
            } else {
                celulaData.textContent = formatarDataExibicao(valor.dataEntrada);
            }

            linha.appendChild(celulaData);

            // Texto digitado pelo usuario entra sempre via textContent, nunca innerHTML:
            // uma descricao com <img onerror=...> viraria codigo executado na pagina
            const celulaDescricao = document.createElement("td");

            if (ehFilha) {
                linha.classList.add("linha-filha");
                const setaFilha = document.createElement("span");
                setaFilha.className = "seta-filha";
                setaFilha.textContent = "↳";
                setaFilha.setAttribute("aria-hidden", "true");
                celulaDescricao.appendChild(setaFilha);
            }

            celulaDescricao.appendChild(document.createTextNode(valor.nomeValor));
            linha.appendChild(celulaDescricao);

            // Categorias de renda com nome técnico (Ativa, Passiva...) ganham explicação
            const celulaCategoria = document.createElement("td");
            const termoCategoria = termoDaCategoria(categorias.find((item) => item.idCategoria === valor.idCategoria));

            if (termoCategoria) {
                const textoCategoria = document.createElement("span");
                textoCategoria.className = "termo";
                textoCategoria.dataset.termo = termoCategoria;
                textoCategoria.tabIndex = 0;
                textoCategoria.textContent = nomeCategoria(valor.idCategoria);
                celulaCategoria.appendChild(textoCategoria);
            } else {
                celulaCategoria.textContent = nomeCategoria(valor.idCategoria);
            }

            linha.appendChild(celulaCategoria);

            const celulaTipo = document.createElement("td");
            celulaTipo.appendChild(seloTipo);
            linha.appendChild(celulaTipo);

            const celulaValor = document.createElement("td");
            celulaValor.className = positivo ? "valor-positivo" : "valor-negativo";
            celulaValor.textContent = valorFormatado;
            linha.appendChild(celulaValor);

            const celulaVencimento = document.createElement("td");
            celulaVencimento.textContent = valor.dataVencimento ? formatarDataCurta(valor.dataVencimento) : "--";

            const aviso = avisoPorGasto[String(valor.idValor)];
            if (aviso) {
                const seloVencimento = document.createElement("span");
                seloVencimento.className = "badge-tipo selo-vencimento " + (aviso.situacao === "vencido" ? "badge-vencido" : "badge-a-vencer");
                seloVencimento.textContent = textoSeloVencimento(aviso);
                celulaVencimento.appendChild(seloVencimento);
            }

            const previsao = previsaoPorGastoLancamentos[String(valor.idValor)];
            if (previsao && Number(previsao.pago) === 0) {
                const seloNaoPago = document.createElement("span");
                seloNaoPago.className = "badge-tipo selo-vencimento badge-vencido";
                seloNaoPago.textContent = previsao.dataNaoPago
                    ? "Não pago em " + formatarDataCurta(previsao.dataNaoPago)
                    : "Não pago";
                celulaVencimento.appendChild(seloNaoPago);
            }

            linha.appendChild(celulaVencimento);

            const celulaAcoes = document.createElement("td");
            celulaAcoes.className = "celula-acoes";

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.className = "btn-editar";
            btnEditar.textContent = "Editar";
            btnEditar.setAttribute("aria-label", "Editar " + valor.nomeValor);
            btnEditar.addEventListener("click", () => abrirEdicaoLancamento(
                valor,
                Boolean(valor.idPendente) || valores.some((item) => String(item.idPendente) === String(valor.idValor))
            ));
            celulaAcoes.appendChild(btnEditar);

            const btnExcluir = document.createElement("button");
            btnExcluir.type = "button";
            btnExcluir.className = "btn-excluir";
            btnExcluir.textContent = "Excluir";
            btnExcluir.setAttribute("aria-label", "Excluir " + valor.nomeValor);
            btnExcluir.addEventListener("click", () => excluirLancamento(valor, valores));
            celulaAcoes.appendChild(btnExcluir);
            linha.appendChild(celulaAcoes);

            return linha;
        };

        linhasOrdenadas.forEach((grupo) => {
            tabelaLancamentos.appendChild(montarLinhaLancamento(grupo, 0));
        });
    };

    const fecharConfirmacaoExclusao = () => {
        overlayExcluir.classList.remove("active");
        lancamentoParaExcluir = null;
    };

    const excluirLancamento = (valor, valores) => {
        lancamentoParaExcluir = valor;
        msgErroExcluir.textContent = "";
        btnConfirmarExcluir.disabled = false;

        lblExcluirLancamento.textContent = "Excluir \"" + valor.nomeValor + "\" de " + formatarDataCurta(valor.dataEntrada) +
            " (R$ " + Number(valor.valorValor).toFixed(2) + ")? Ele será apagado do banco e não pode ser desfeito.";

        let aviso = "";

        if (valor.idPendente) {
            aviso = "Como é uma pendência, as pendências seguintes dela também serão apagadas e o gasto do mês anterior passa a contar como pago.";
        } else if (valores.some((item) => String(item.idPendente) === String(valor.idValor))) {
            aviso = "As pendências com juros geradas a partir dele também serão apagadas.";
        } else if (valor.recorValor === 1) {
            aviso = "Ele deixa de se repetir nos próximos meses. Os lançamentos já gerados continuam.";
        }

        lblAvisoExcluir.textContent = aviso;
        lblAvisoExcluir.hidden = aviso === "";

        overlayExcluir.classList.add("active");
        btnCancelarExcluir.focus();
    };

    btnConfirmarExcluir.addEventListener("click", async () => {
        if (!lancamentoParaExcluir) {
            return;
        }

        btnConfirmarExcluir.disabled = true;
        msgErroExcluir.textContent = "";

        try {
            const resposta = await fetchApi("http://localhost:3000/valores/id/" + lancamentoParaExcluir.idValor, { method: "DELETE" });

            if (!resposta.ok) {
                const dados = await resposta.json().catch(() => ({}));
                msgErroExcluir.textContent = dados.erro || "Não foi possível excluir o lançamento.";
                btnConfirmarExcluir.disabled = false;
                return;
            }

            fecharConfirmacaoExclusao();
            carregarLancamentos();
        } catch (erro) {
            msgErroExcluir.textContent = "Não foi possível conectar ao servidor.";
            btnConfirmarExcluir.disabled = false;
        }
    });

    btnCancelarExcluir.addEventListener("click", fecharConfirmacaoExclusao);
    document.getElementById("btn_fecharExcluir").addEventListener("click", fecharConfirmacaoExclusao);

    overlayExcluir.addEventListener("click", (event) => {
        if (event.target === overlayExcluir) {
            fecharConfirmacaoExclusao();
        }
    });

    overlayExcluir.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            fecharConfirmacaoExclusao();
        }
    });

    const dataParaCampo = (data) => data ? data.slice(6, 8) + "/" + data.slice(4, 6) + "/" + data.slice(0, 4) : "";

    const definirCamposBloqueados = (bloqueado) => {
        [inputValorLancamento, selectCategoriaLancamento, inputDataLancamento, inputVencimentoLancamento]
            .forEach((campo) => {
                campo.disabled = bloqueado;
            });
    };

    const abrirEdicaoLancamento = (valor, ligadoAPendencia) => {
        idLancamentoEditando = valor.idValor;
        tipoLancamentoAtual = valor.receitaDespesa;
        tituloModalLancamento.textContent = valor.receitaDespesa === 1 ? "Editar Renda" : "Editar Gasto";
        formLancamento.reset();
        msgErroLancamento.textContent = "";
        popularSelectCategorias(valor.receitaDespesa);

        inputDescricaoLancamento.value = valor.nomeValor;
        inputValorLancamento.value = Number(valor.valorValor);
        selectCategoriaLancamento.value = String(valor.idCategoria);
        inputDataLancamento.value = dataParaCampo(valor.dataEntrada);
        inputVencimentoLancamento.value = dataParaCampo(valor.dataVencimento);

        campoRecorrente.hidden = true;
        campoDataFinal.hidden = true;
        campoVencimento.hidden = valor.receitaDespesa === 1;

        definirCamposBloqueados(ligadoAPendencia);
        msgInfoLancamento.textContent = ligadoAPendencia
            ? "Este lançamento faz parte de uma pendência com juros: só a descrição pode ser alterada."
            : "";
        msgInfoLancamento.hidden = !ligadoAPendencia;

        overlayLancamento.classList.add("active");
        inputDescricaoLancamento.focus();
    };

    const atualizarCampoValorJurosAtraso = () => {
        inputValorJurosAtraso.disabled = checkSemJurosAtraso.checked;
        inputValorJurosAtraso.required = !checkSemJurosAtraso.checked;

        if (checkSemJurosAtraso.checked) {
            inputValorJurosAtraso.value = "";
        }
    };

    const abrirPopupJurosAtraso = (gasto) => {
        gastoAtrasado = gasto;
        formJurosAtraso.reset();
        msgErroJurosAtraso.textContent = "";
        lblGastoJurosAtraso.textContent = gasto.nomeValor + " venceu em " + formatarDataCurta(gasto.dataVencimento) +
            " e já está atrasada. Informe o juros do atraso.";
        atualizarCampoValorJurosAtraso();
        overlayJurosAtraso.classList.add("active");
    };

    document.getElementById("btn_fecharJuros").addEventListener("click", () => {
        overlayJurosAtraso.classList.remove("active");
    });

    overlayJurosAtraso.addEventListener("click", (event) => {
        if (event.target === overlayJurosAtraso) {
            overlayJurosAtraso.classList.remove("active");
        }
    });

    checksTipoJurosAtraso.forEach((check) => {
        check.addEventListener("change", () => {
            if (check.checked) {
                checksTipoJurosAtraso
                    .filter((outro) => outro !== check)
                    .forEach((outro) => {
                        outro.checked = false;
                    });
            }

            atualizarCampoValorJurosAtraso();
        });
    });

    formJurosAtraso.addEventListener("submit", async (event) => {
        event.preventDefault();
        msgErroJurosAtraso.textContent = "";

        if (!checksTipoJurosAtraso.some((check) => check.checked)) {
            msgErroJurosAtraso.textContent = "Selecione R$, % ou Sem juros.";
            return;
        }

        try {
            const resposta = await fetchApi("http://localhost:3000/previsoes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idGasto: gastoAtrasado.idValor,
                    taxaJuros: checkSemJurosAtraso.checked ? 0 : Number(inputValorJurosAtraso.value),
                    tipoJuros: checkJurosPorcentagemAtraso.checked ? 1 : 0,
                    pago: 0
                })
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                msgErroJurosAtraso.textContent = dados.erro || "Não foi possível salvar o juros.";
                return;
            }

            overlayJurosAtraso.classList.remove("active");
            carregarLancamentos();
        } catch (erro) {
            msgErroJurosAtraso.textContent = "Não foi possível conectar ao servidor.";
        }
    });

    const abrirModalLancamento = (tipo) => {
        idLancamentoEditando = null;
        tipoLancamentoAtual = tipo;
        tituloModalLancamento.textContent = tipo === 1 ? "Adicionar Renda" : "Adicionar Gasto";
        formLancamento.reset();
        definirCamposBloqueados(false);
        campoRecorrente.hidden = false;
        campoDataFinal.hidden = true;
        campoVencimento.hidden = tipo === 1;
        msgInfoLancamento.hidden = true;
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

        let dataVencimento = null;

        if (tipoLancamentoAtual === 0 && inputVencimentoLancamento.value) {
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(inputVencimentoLancamento.value)) {
                msgErroLancamento.textContent = "O vencimento deve estar completo, no formato dd/mm/aaaa.";
                return;
            }

            const [diaVencimento, mesVencimento, anoVencimento] = inputVencimentoLancamento.value.split("/");
            dataVencimento = anoVencimento + mesVencimento + diaVencimento;
        }

        if (idLancamentoEditando !== null) {
            try {
                const respostaEdicao = await fetchApi("http://localhost:3000/valores/id/" + idLancamentoEditando, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nomeValor: descricao,
                        valorValor: valor,
                        idCategoria: Number(idCategoria),
                        dataEntrada: dataEntrada,
                        dataVencimento: dataVencimento
                    })
                });

                const dadosEdicao = await respostaEdicao.json().catch(() => ({}));

                if (!respostaEdicao.ok) {
                    msgErroLancamento.textContent = dadosEdicao.erro || "Não foi possível salvar a edição.";
                    return;
                }

                overlayLancamento.classList.remove("active");
                idLancamentoEditando = null;
                carregarLancamentos();
            } catch (erro) {
                msgErroLancamento.textContent = "Não foi possível conectar ao servidor.";
            }
            return;
        }

        // O usuario nao vai no corpo: o backend pega do token da sessao
        const dadosLancamento = {
            idCategoria: Number(idCategoria),
            nomeValor: descricao,
            valorValor: valor,
            recorValor: recorrente ? 1 : 0,
            receitaDespesa: tipoLancamentoAtual,
            dataEntrada: dataEntrada,
            dataFinal: dataFinal,
            dataVencimento: dataVencimento,
            discricao: ""
        };

        try {
            let resposta = await fetchApi("http://localhost:3000/valores", {
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

                resposta = await fetchApi("http://localhost:3000/valores", {
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
            await carregarLancamentos();

            if (dados.valor && dados.valor.dataVencimento && dados.valor.dataVencimento < dataDeHojeTexto()) {
                abrirPopupJurosAtraso(dados.valor);
            }
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
            const resposta = await fetchApi("http://localhost:3000/categorias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
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

    const lblMesPainel = document.getElementById("lbl_mesPainel");
    if (lblMesPainel) {
        const hojePainel = new Date();
        const mesPainel = document.createElement("strong");
        mesPainel.textContent = hojePainel.toLocaleDateString("pt-BR", { month: "long" }) + " de " + hojePainel.getFullYear();
        lblMesPainel.textContent = "Esses são os valores do mês de ";
        lblMesPainel.appendChild(mesPainel);
        lblMesPainel.appendChild(document.createTextNode("."));
    }

    const carregarResumoMensal = async () => {
        if (!usuarioLogado) {
            rendaEl.textContent = "R$ 0,00";
            gastosEl.textContent = "R$ 0,00";
            saldoEl.textContent = "R$ 0,00";
            return;
        }

        const resposta = await fetchApi("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario);
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

    const blocoAvisosPainel = document.getElementById("avisos_vencimento");
    if (blocoAvisosPainel && usuarioLogado) {
        buscarAvisosVencimento().then((avisos) => renderizarAvisosVencimento(blocoAvisosPainel, avisos));
    }
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
        if (anguloFinal - anguloInicial >= 359.99) {
            return [
                "M", cx, cy - raio,
                "A", raio, raio, 0, 1, 1, cx, cy + raio,
                "A", raio, raio, 0, 1, 1, cx, cy - raio,
                "Z"
            ].join(" ");
        }

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

            // Categorias de renda com nome técnico (Ativa, Passiva...) ganham explicação
            const categoriaComTermo = categoriasCarregadas.find(
                (categoria) => categoria.nomeCategoria === item.nome && termoDaCategoria(categoria)
            );

            if (categoriaComTermo) {
                textoLegenda.className = "termo";
                textoLegenda.dataset.termo = termoDaCategoria(categoriaComTermo);
                textoLegenda.tabIndex = 0;
            }

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
                fetchApi("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario),
                fetchApi("http://localhost:3000/categorias/usuario/" + usuarioLogado.idUsuario)
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

const tabelaGastosMesCalculadora = document.getElementById("tabela_gastosMesCalculadora");
if (tabelaGastosMesCalculadora) {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    const selectMesAnoCalculadora = document.getElementById("select_mesAnoCalculadora");

    const NOMES_MESES_CALCULADORA = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const overlayJuros = document.getElementById("overlay_juros");
    const formJuros = document.getElementById("form_juros");
    const msgErroJuros = document.getElementById("msg_erroJuros");
    const lblGastoJuros = document.getElementById("lbl_gastoJuros");
    const inputValorJuros = document.getElementById("input_valorJuros");
    const checkJurosReal = document.getElementById("check_jurosReal");
    const checkJurosPorcentagem = document.getElementById("check_jurosPorcentagem");
    const checkSemJuros = document.getElementById("check_semJuros");
    const checksTipoJuros = [checkJurosReal, checkJurosPorcentagem, checkSemJuros];

    const blocoAvisosCalculadora = document.getElementById("avisos_vencimento");
    let avisosPorGasto = {};

    const btnSalvarCalculadora = document.getElementById("btn_salvarCalculadora");
    const msgSalvarCalculadora = document.getElementById("msg_salvarCalculadora");
    const TEXTO_ALTERACOES_PENDENTES = "Há alterações não salvas.";

    const lblReceitaMesCalculadora = document.getElementById("lbl_receitaMesCalculadora");
    const lblGastoMesCalculadora = document.getElementById("lbl_gastoMesCalculadora");
    const lblNaoPagoMesCalculadora = document.getElementById("lbl_naoPagoMesCalculadora");
    const barraLimite = document.getElementById("barra_limite");
    const barraLimitePreenchimento = document.getElementById("barra_limitePreenchimento");
    const lblAvisoLimite = document.getElementById("lbl_avisoLimite");

    const graficoPizza503020 = document.getElementById("grafico_pizza503020");
    const legendaPizza503020 = document.getElementById("legenda_pizza503020");
    const tabelaPizza503020Corpo = document.querySelector("#tabela_pizza503020 tbody");
    const tooltipGraficoCalculadora = document.getElementById("tooltip_grafico");
    const svgNSCalculadora = "http://www.w3.org/2000/svg";

    const PARTES_503020 = [
        { nome: "Necessidades", importancia: 1, ideal: 50, cor: "var(--serie-1)" },
        { nome: "Desejos", importancia: 2, ideal: 30, cor: "var(--serie-2)" },
        { nome: "Reserva", importancia: 3, ideal: 20, cor: "var(--serie-3)" },
        { nome: "Sem classificação", importancia: null, ideal: null, cor: "#9ca3af" }
    ];

    let valoresCalculadora = [];
    let gastosCarregados = [];
    let categoriasCalculadora = [];
    let estadoGastos = {};
    let estadoSalvo = {};
    let previsoesSalvas = {};
    let gastoJurosSelecionado = null;
    let popupAbertoPeloNaoPago = false;

    const ESTADO_PADRAO_GASTO = { naoPago: false, juros: null };

    const estadoDoGasto = (idValor) => estadoGastos[String(idValor)] || ESTADO_PADRAO_GASTO;

    const estadoSalvoDoGasto = (idValor) => estadoSalvo[String(idValor)] || ESTADO_PADRAO_GASTO;

    const estadoMudou = (idValor) =>
        JSON.stringify(estadoDoGasto(idValor)) !== JSON.stringify(estadoSalvoDoGasto(idValor));

    const estadoDaPrevisao = (previsao) => {
        const taxa = Number(previsao.taxaJuros);
        return {
            naoPago: Number(previsao.pago) === 0,
            juros: {
                valor: taxa,
                tipo: taxa === 0 ? "sem" : (Number(previsao.tipoJuros) === 0 ? "real" : "porcentagem")
            }
        };
    };

    const registrarPrevisaoSalva = (previsao) => {
        const id = String(previsao.idGasto);
        previsoesSalvas[id] = previsao;
        estadoSalvo[id] = estadoDaPrevisao(previsao);
        estadoGastos[id] = estadoDaPrevisao(previsao);
    };

    const textoJurosCadastrado = (juros) => {
        if (juros.tipo === "sem") {
            return "Sem juros";
        }

        return juros.valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + (juros.tipo === "real" ? "R$" : "%");
    };

    const valorBaseDoGasto = (gasto) => {
        const origem = gasto.idPendente
            ? valoresCalculadora.find((item) => String(item.idValor) === String(gasto.idPendente))
            : null;
        return Number(origem ? origem.valorValor : gasto.valorValor);
    };

    const calcularValorComJuros = (gasto) => {
        const valorGasto = Number(gasto.valorValor);
        const { naoPago, juros } = estadoDoGasto(gasto.idValor);

        if (!naoPago || !juros || juros.tipo === "sem") {
            return valorGasto;
        }

        const valorJuros = juros.tipo === "real" ? juros.valor : valorBaseDoGasto(gasto) * juros.valor / 100;
        return Math.round((valorGasto + valorJuros) * 100) / 100;
    };

    const jurosDaPendenciaAnterior = (gasto) => {
        if (!gasto.idPendente) {
            return null;
        }

        const anteriores = gastosCarregados
            .filter((item) =>
                (String(item.idValor) === String(gasto.idPendente) || String(item.idPendente) === String(gasto.idPendente)) &&
                item.dataEntrada < gasto.dataEntrada &&
                estadoSalvo[String(item.idValor)] &&
                estadoSalvo[String(item.idValor)].naoPago
            )
            .sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada));

        return anteriores.length > 0 ? estadoSalvo[String(anteriores[0].idValor)].juros : null;
    };

    const mostrarMensagemSalvar = (mensagem, erro) => {
        msgSalvarCalculadora.textContent = mensagem;
        msgSalvarCalculadora.classList.toggle("msg-salvar-erro", erro);
    };

    const atualizarAvisoAlteracoes = () => {
        const haAlteracoes = gastosCarregados.some((gasto) => estadoMudou(gasto.idValor));

        if (haAlteracoes) {
            mostrarMensagemSalvar(TEXTO_ALTERACOES_PENDENTES, false);
        } else if (msgSalvarCalculadora.textContent === TEXTO_ALTERACOES_PENDENTES) {
            mostrarMensagemSalvar("", false);
        }
    };

    const formatarDataExibicaoCalculadora = (dataEntrada) => {
        const ano = dataEntrada.slice(2, 4);
        const mes = dataEntrada.slice(4, 6);
        const dia = dataEntrada.slice(6, 8);
        return dia + "/" + mes + "/" + ano;
    };

    const nomeCategoriaCalculadora = (idCategoria) => {
        const categoria = categoriasCalculadora.find((item) => item.idCategoria === idCategoria);
        return categoria ? categoria.nomeCategoria : "Sem categoria";
    };

    const mostrarMensagemTabelaCalculadora = (mensagem) => {
        tabelaGastosMesCalculadora.innerHTML = "";
        const linha = document.createElement("tr");
        const celula = document.createElement("td");
        celula.colSpan = 7;
        celula.textContent = mensagem;
        linha.appendChild(celula);
        tabelaGastosMesCalculadora.appendChild(linha);
    };

    const importanciaDoGasto = (gasto) => {
        const categoria = categoriasCalculadora.find((item) => item.idCategoria === gasto.idCategoria);
        return categoria ? Number(categoria.importanciaCategoria) : null;
    };

    const resumoDoMesCalculadora = (anoMesSelecionado) => {
        const somarValores = (lista) => lista.reduce((soma, valor) => soma + Number(valor.valorValor), 0);

        const gastosDoMes = gastosCarregados.filter((gasto) => gasto.dataEntrada.slice(0, 6) === anoMesSelecionado);
        const receitaMes = somarValores(valoresCalculadora.filter(
            (valor) => valor.receitaDespesa === 1 && valor.dataEntrada.slice(0, 6) === anoMesSelecionado
        ));
        const gastosNaoPagos = gastosDoMes.filter((gasto) => estadoDoGasto(gasto.idValor).naoPago);
        const naoPagoMes = somarValores(gastosNaoPagos);
        const naoPagoComJurosMes = gastosNaoPagos.reduce((soma, gasto) => soma + calcularValorComJuros(gasto), 0);
        const gastoMes = somarValores(gastosDoMes) - naoPagoMes;
        const estourou = gastoMes > receitaMes;
        const restamDesejosOuReservas = gastosDoMes.some(
            (gasto) => [2, 3].includes(importanciaDoGasto(gasto)) && !estadoDoGasto(gasto.idValor).naoPago
        );

        return {
            receitaMes,
            gastoMes,
            naoPagoMes,
            naoPagoComJurosMes,
            estourou,
            bloquearNecessidades: estourou && restamDesejosOuReservas
        };
    };

    const renderizarBarraLimite = (anoMesSelecionado) => {
        const { receitaMes, gastoMes, naoPagoMes, naoPagoComJurosMes, estourou, bloquearNecessidades } = resumoDoMesCalculadora(anoMesSelecionado);
        const percentual = receitaMes > 0 ? gastoMes / receitaMes * 100 : (gastoMes > 0 ? 100 : 0);

        lblReceitaMesCalculadora.textContent = "Receita do mês: R$ " + receitaMes.toFixed(2);
        lblGastoMesCalculadora.textContent = "Gastos do mês: R$ " + gastoMes.toFixed(2) +
            (receitaMes > 0 ? " (" + percentual.toFixed(0) + "% da receita)" : "");

        lblNaoPagoMesCalculadora.hidden = naoPagoMes === 0;
        lblNaoPagoMesCalculadora.textContent = "Não pagos (fora da conta): R$ " + naoPagoMes.toFixed(2) +
            " (vão para o próximo mês como R$ " + naoPagoComJurosMes.toFixed(2) + ")";

        barraLimitePreenchimento.style.width = Math.min(percentual, 100) + "%";
        barraLimite.classList.toggle("barra-estourada", estourou);
        barraLimite.setAttribute("aria-label",
            "Gastos de R$ " + gastoMes.toFixed(2) + " para uma receita de R$ " + receitaMes.toFixed(2));

        lblAvisoLimite.textContent = estourou
            ? "⚠ Gastos acima da receita em R$ " + (gastoMes - receitaMes).toFixed(2) +
                (bloquearNecessidades ? ". Marque primeiro como não pagos os desejos e reservas; necessidades só depois." : "")
            : "";
    };

    const mostrarTooltipCalculadora = (evento, linhas) => {
        tooltipGraficoCalculadora.innerHTML = "";

        linhas.forEach((linha, indice) => {
            const elemento = document.createElement(indice === 0 ? "strong" : "span");
            elemento.textContent = linha;
            tooltipGraficoCalculadora.appendChild(elemento);
        });

        tooltipGraficoCalculadora.classList.add("ativo");
        tooltipGraficoCalculadora.style.left = evento.clientX + 12 + "px";
        tooltipGraficoCalculadora.style.top = evento.clientY + 12 + "px";
    };

    const esconderTooltipCalculadora = () => {
        tooltipGraficoCalculadora.classList.remove("ativo");
    };

    const pontoNoCirculo = (anguloGraus) => {
        const anguloRad = (anguloGraus - 90) * Math.PI / 180;
        return { x: 100 + 90 * Math.cos(anguloRad), y: 100 + 90 * Math.sin(anguloRad) };
    };

    const criarFatia503020 = (anguloInicial, anguloFinal) => {
        if (anguloFinal - anguloInicial >= 359.99) {
            const circulo = document.createElementNS(svgNSCalculadora, "circle");
            circulo.setAttribute("cx", "100");
            circulo.setAttribute("cy", "100");
            circulo.setAttribute("r", "90");
            return circulo;
        }

        const inicio = pontoNoCirculo(anguloFinal);
        const fim = pontoNoCirculo(anguloInicial);
        const arcoGrande = anguloFinal - anguloInicial <= 180 ? 0 : 1;

        const path = document.createElementNS(svgNSCalculadora, "path");
        path.setAttribute("d", [
            "M", 100, 100,
            "L", inicio.x, inicio.y,
            "A", 90, 90, 0, arcoGrande, 0, fim.x, fim.y,
            "Z"
        ].join(" "));
        return path;
    };

    const renderizarPizza503020 = (anoMesSelecionado) => {
        graficoPizza503020.innerHTML = "";
        legendaPizza503020.innerHTML = "";
        tabelaPizza503020Corpo.innerHTML = "";

        const valoresDoMes = valoresCalculadora.filter((valor) => valor.dataEntrada.slice(0, 6) === anoMesSelecionado);

        const receitaMes = valoresDoMes
            .filter((valor) => valor.receitaDespesa === 1)
            .reduce((soma, valor) => soma + Number(valor.valorValor), 0);

        if (receitaMes === 0) {
            const mensagem = document.createElementNS(svgNSCalculadora, "text");
            mensagem.setAttribute("x", "100");
            mensagem.setAttribute("y", "104");
            mensagem.setAttribute("text-anchor", "middle");
            mensagem.setAttribute("fill", "#898781");
            mensagem.setAttribute("font-size", "11");
            mensagem.textContent = "Sem receita neste mês";
            graficoPizza503020.appendChild(mensagem);
            return;
        }

        const partes = PARTES_503020.map((parte) => ({ ...parte, valor: 0, categorias: new Set() }));
        const parteSemClassificacao = partes[partes.length - 1];

        valoresDoMes
            .filter((valor) => valor.receitaDespesa === 0)
            .forEach((gasto) => {
                const categoria = categoriasCalculadora.find((item) => item.idCategoria === gasto.idCategoria);
                const importancia = categoria ? Number(categoria.importanciaCategoria) : null;
                const parte = partes.find((item) => item.importancia !== null && item.importancia === importancia)
                    || parteSemClassificacao;

                parte.valor += Number(gasto.valorValor);
                parte.categorias.add(categoria ? categoria.nomeCategoria : "Sem categoria");
            });

        const totalGastos = partes.reduce((soma, parte) => soma + parte.valor, 0);
        const sobraReceita = receitaMes - totalGastos;

        if (sobraReceita > 0) {
            partes[2].valor += sobraReceita;
            partes[2].categorias.add("Sobra da receita");
        }

        const totalPizza = partes.reduce((soma, parte) => soma + parte.valor, 0);
        let anguloAtual = 0;

        partes
            .filter((parte) => parte.valor > 0 || parte.ideal !== null)
            .forEach((parte) => {
                const percentualReceita = parte.valor / receitaMes * 100;
                const listaCategorias = Array.from(parte.categorias).join(", ");
                const textoIdeal = parte.ideal !== null ? parte.ideal + "%" : "--";
                const ehReserva = parte.importancia === 3;
                const valorLimite = parte.ideal !== null ? receitaMes * parte.ideal / 100 : null;
                const textoLimite = valorLimite === null
                    ? "--"
                    : (ehReserva ? "pelo menos R$ " : "até R$ ") + valorLimite.toFixed(2);
                const foraDoLimite = valorLimite !== null &&
                    (ehReserva ? parte.valor < valorLimite : parte.valor > valorLimite);

                if (parte.valor > 0) {
                    const anguloFinal = anguloAtual + (parte.valor / totalPizza) * 360;
                    const fatia = criarFatia503020(anguloAtual, anguloFinal);
                    fatia.style.fill = parte.cor;
                    fatia.style.stroke = "var(--fundo-card)";
                    fatia.setAttribute("stroke-width", "2");
                    fatia.setAttribute("stroke-linejoin", "round");
                    fatia.classList.add("fatia-grafico");
                    fatia.tabIndex = 0;

                    const linhasTooltip = [
                        "R$ " + parte.valor.toFixed(2),
                        parte.nome + " · " + percentualReceita.toFixed(1) + "% da receita (ideal " + textoIdeal + ")",
                        valorLimite !== null ? "Limite: " + textoLimite : "",
                        listaCategorias
                    ].filter((linha) => linha !== "");
                    const aoInteragir = (evento) => mostrarTooltipCalculadora(evento, linhasTooltip);
                    fatia.addEventListener("pointermove", aoInteragir);
                    fatia.addEventListener("pointerenter", aoInteragir);
                    fatia.addEventListener("focus", aoInteragir);
                    fatia.addEventListener("pointerleave", esconderTooltipCalculadora);
                    fatia.addEventListener("blur", esconderTooltipCalculadora);

                    graficoPizza503020.appendChild(fatia);
                    anguloAtual = anguloFinal;
                }

                const itemLegenda = document.createElement("li");
                const marcador = document.createElement("span");
                marcador.className = "marcador-legenda";
                marcador.style.background = parte.cor;
                const textoLegenda = document.createElement("span");
                textoLegenda.textContent = parte.nome + ": " + percentualReceita.toFixed(1) + "%" +
                    (parte.ideal !== null ? " (ideal " + parte.ideal + "%)" : "");
                itemLegenda.appendChild(marcador);
                itemLegenda.appendChild(textoLegenda);
                legendaPizza503020.appendChild(itemLegenda);

                const linhaTabela = document.createElement("tr");
                [
                    parte.nome,
                    listaCategorias || "--",
                    "R$ " + parte.valor.toFixed(2),
                    percentualReceita.toFixed(1) + "%",
                    textoIdeal
                ].forEach((texto) => {
                    const celula = document.createElement("td");
                    celula.textContent = texto;
                    linhaTabela.appendChild(celula);
                });

                const celulaLimite = document.createElement("td");
                celulaLimite.className = "celula-limite";
                celulaLimite.textContent = textoLimite;

                if (foraDoLimite) {
                    const aviso = document.createElement("span");
                    aviso.className = "aviso-fora-limite";
                    aviso.textContent = ehReserva ? " ⚠ abaixo" : " ⚠ passou";
                    celulaLimite.appendChild(aviso);
                }

                linhaTabela.appendChild(celulaLimite);
                tabelaPizza503020Corpo.appendChild(linhaTabela);
            });
    };

    const popularSelectMesAnoCalculadora = () => {
        const anosMeses = Array.from(
            new Set(valoresCalculadora.map((valor) => valor.dataEntrada.slice(0, 6)))
        ).sort((a, b) => b.localeCompare(a));
        const mesSelecionadoAntes = selectMesAnoCalculadora.value;

        selectMesAnoCalculadora.innerHTML = "";

        if (anosMeses.length === 0) {
            const opcaoVazia = document.createElement("option");
            opcaoVazia.value = "";
            opcaoVazia.textContent = "Nenhum lançamento cadastrado";
            selectMesAnoCalculadora.appendChild(opcaoVazia);
            return;
        }

        anosMeses.forEach((anoMes) => {
            const ano = anoMes.slice(0, 4);
            const mes = Number(anoMes.slice(4, 6));

            const opcao = document.createElement("option");
            opcao.value = anoMes;
            opcao.textContent = NOMES_MESES_CALCULADORA[mes - 1] + "/" + ano;
            selectMesAnoCalculadora.appendChild(opcao);
        });

        const hoje = new Date();
        const anoMesAtual = hoje.getFullYear() + String(hoje.getMonth() + 1).padStart(2, "0");
        if (anosMeses.includes(mesSelecionadoAntes)) {
            selectMesAnoCalculadora.value = mesSelecionadoAntes;
        } else {
            selectMesAnoCalculadora.value = anosMeses.includes(anoMesAtual) ? anoMesAtual : anosMeses[0];
        }
    };

    const atualizarCampoValorJuros = () => {
        inputValorJuros.disabled = checkSemJuros.checked;
        inputValorJuros.required = !checkSemJuros.checked;

        if (checkSemJuros.checked) {
            inputValorJuros.value = "";
        }
    };

    const abrirPopupJuros = (gasto, peloNaoPago) => {
        formJuros.reset();
        msgErroJuros.textContent = "";
        gastoJurosSelecionado = gasto;
        popupAbertoPeloNaoPago = peloNaoPago;
        lblGastoJuros.textContent = gasto.nomeValor + " - R$ " + Number(gasto.valorValor).toFixed(2);

        const juros = estadoDoGasto(gasto.idValor).juros || jurosDaPendenciaAnterior(gasto);
        if (juros) {
            inputValorJuros.value = juros.tipo === "sem" ? "" : juros.valor;
            checkJurosReal.checked = juros.tipo === "real";
            checkJurosPorcentagem.checked = juros.tipo === "porcentagem";
            checkSemJuros.checked = juros.tipo === "sem";
        }

        atualizarCampoValorJuros();
        overlayJuros.classList.add("active");
    };

    const fecharPopupJuros = () => {
        overlayJuros.classList.remove("active");

        if (popupAbertoPeloNaoPago) {
            const id = String(gastoJurosSelecionado.idValor);
            estadoGastos[id] = { naoPago: false, juros: estadoSalvoDoGasto(id).juros };
            popupAbertoPeloNaoPago = false;
            renderizarGastosMesCalculadora();
        }
    };

    document.getElementById("btn_fecharJuros").addEventListener("click", fecharPopupJuros);

    overlayJuros.addEventListener("click", (event) => {
        if (event.target === overlayJuros) {
            fecharPopupJuros();
        }
    });

    checksTipoJuros.forEach((check) => {
        check.addEventListener("change", () => {
            if (check.checked) {
                checksTipoJuros
                    .filter((outro) => outro !== check)
                    .forEach((outro) => {
                        outro.checked = false;
                    });
            }

            atualizarCampoValorJuros();
        });
    });

    formJuros.addEventListener("submit", (event) => {
        event.preventDefault();
        msgErroJuros.textContent = "";

        if (!checksTipoJuros.some((check) => check.checked)) {
            msgErroJuros.textContent = "Selecione R$, % ou Sem juros.";
            return;
        }

        estadoGastos[String(gastoJurosSelecionado.idValor)] = {
            naoPago: true,
            juros: checkSemJuros.checked
                ? { valor: 0, tipo: "sem" }
                : { valor: Number(inputValorJuros.value), tipo: checkJurosReal.checked ? "real" : "porcentagem" }
        };

        popupAbertoPeloNaoPago = false;
        overlayJuros.classList.remove("active");
        renderizarGastosMesCalculadora();
    });

    const montarItensParaSalvar = () => {
        const hoje = dataDeHojeTexto();
        const anoMesSelecionado = selectMesAnoCalculadora.value;
        const itens = [];

        gastosCarregados.forEach((gasto) => {
            const id = String(gasto.idValor);
            const { naoPago, juros } = estadoDoGasto(id);

            if (estadoMudou(id)) {
                if (!naoPago && !previsoesSalvas[id]) {
                    estadoGastos[id] = ESTADO_PADRAO_GASTO;
                } else {
                    const jurosEnviado = juros || { valor: 0, tipo: "sem" };
                    itens.push({
                        idGasto: gasto.idValor,
                        taxaJuros: jurosEnviado.valor,
                        tipoJuros: jurosEnviado.tipo === "porcentagem" ? 1 : 0,
                        pago: naoPago ? 0 : 1
                    });
                    return;
                }
            }

            const confirmarComoPago = !previsoesSalvas[id] &&
                gasto.dataEntrada.slice(0, 6) === anoMesSelecionado &&
                anoMesSelecionado <= hoje.slice(0, 6) &&
                (!gasto.dataVencimento || gasto.dataVencimento <= hoje);

            if (confirmarComoPago) {
                itens.push({ idGasto: gasto.idValor, taxaJuros: 0, tipoJuros: 0, pago: 1 });
            }
        });

        return itens;
    };

    const salvarAlteracoesCalculadora = async () => {
        const itens = montarItensParaSalvar();

        if (itens.length === 0) {
            renderizarGastosMesCalculadora();
            mostrarMensagemSalvar("Nenhuma alteração para salvar.", false);
            return;
        }

        btnSalvarCalculadora.disabled = true;
        mostrarMensagemSalvar("Salvando...", false);

        try {
            const resposta = await fetchApi("http://localhost:3000/previsoes/lote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itens })
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                const gastoComErro = gastosCarregados.find((gasto) => String(gasto.idValor) === String(dados.idGasto));
                throw new Error((dados.erro || "Não foi possível salvar.") + (gastoComErro ? " (" + gastoComErro.nomeValor + ")" : ""));
            }

            await carregarGastosMesCalculadora();
            mostrarMensagemSalvar("Alterações salvas.", false);
        } catch (erro) {
            renderizarGastosMesCalculadora();
            mostrarMensagemSalvar(erro.message || "Não foi possível conectar ao servidor.", true);
        } finally {
            btnSalvarCalculadora.disabled = false;
        }
    };

    const atualizarAvisosCalculadora = async () => {
        const avisos = await buscarAvisosVencimento();

        avisosPorGasto = {};
        avisos.forEach((aviso) => {
            avisosPorGasto[String(aviso.idValor)] = aviso;
        });

        renderizarAvisosVencimento(blocoAvisosCalculadora, avisos);
    };

    btnSalvarCalculadora.addEventListener("click", salvarAlteracoesCalculadora);

    window.addEventListener("beforeunload", (event) => {
        if (gastosCarregados.some((gasto) => estadoMudou(gasto.idValor))) {
            event.preventDefault();
            event.returnValue = "";
        }
    });

    const renderizarGastosMesCalculadora = () => {
        const anoMesSelecionado = selectMesAnoCalculadora.value;

        renderizarBarraLimite(anoMesSelecionado);
        renderizarPizza503020(anoMesSelecionado);
        atualizarAvisoAlteracoes();

        const { bloquearNecessidades } = resumoDoMesCalculadora(anoMesSelecionado);

        const gastosDoMes = gastosCarregados
            .filter((valor) => valor.dataEntrada.slice(0, 6) === anoMesSelecionado)
            .sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada));

        if (gastosDoMes.length === 0) {
            mostrarMensagemTabelaCalculadora("Nenhum gasto registrado neste mês.");
            return;
        }

        tabelaGastosMesCalculadora.innerHTML = "";

        gastosDoMes.forEach((valor) => {
            const linha = document.createElement("tr");

            [
                formatarDataExibicaoCalculadora(valor.dataEntrada),
                valor.nomeValor,
                nomeCategoriaCalculadora(valor.idCategoria)
            ].forEach((texto) => {
                const celula = document.createElement("td");
                celula.textContent = texto;
                linha.appendChild(celula);
            });

            const celulaValor = document.createElement("td");
            celulaValor.className = "valor-negativo";
            celulaValor.textContent = "-R$ " + Number(valor.valorValor).toFixed(2);
            linha.appendChild(celulaValor);

            const id = String(valor.idValor);
            const estado = estadoDoGasto(id);

            const celulaJuros = document.createElement("td");

            if (estado.naoPago) {
                const textoJuros = document.createElement("button");
                textoJuros.type = "button";
                textoJuros.className = "texto-juros";
                textoJuros.textContent = estado.juros ? textoJurosCadastrado(estado.juros) : "Juros";
                textoJuros.setAttribute("aria-label", "Cadastrar juros de " + valor.nomeValor);
                textoJuros.addEventListener("click", () => abrirPopupJuros(valor, false));
                celulaJuros.appendChild(textoJuros);
            } else {
                const semJuros = document.createElement("span");
                semJuros.className = "texto-juros-desativado";
                semJuros.textContent = "--";
                celulaJuros.appendChild(semJuros);
            }

            linha.appendChild(celulaJuros);

            const celulaNaoPago = document.createElement("td");
            const checkNaoPago = document.createElement("input");
            checkNaoPago.type = "checkbox";
            checkNaoPago.className = "check-nao-pago";
            checkNaoPago.checked = estado.naoPago;
            checkNaoPago.setAttribute("aria-label", "Não pago: " + valor.nomeValor);

            if (bloquearNecessidades && !estado.naoPago && importanciaDoGasto(valor) === 1) {
                checkNaoPago.disabled = true;
                checkNaoPago.title = "Marque primeiro como não pagos os gastos de desejo e reserva";
            }
            checkNaoPago.addEventListener("change", () => {
                if (checkNaoPago.checked) {
                    estadoGastos[id] = { naoPago: true, juros: estadoDoGasto(id).juros };
                    renderizarGastosMesCalculadora();
                    abrirPopupJuros(valor, true);
                } else {
                    estadoGastos[id] = { naoPago: false, juros: estadoSalvoDoGasto(id).juros };
                    renderizarGastosMesCalculadora();
                }
            });

            celulaNaoPago.appendChild(checkNaoPago);

            const avisoDoGasto = avisosPorGasto[id];
            if (avisoDoGasto) {
                const iconeVencimento = document.createElement("span");
                iconeVencimento.className = "icone-vencimento " + (avisoDoGasto.situacao === "vencido" ? "icone-vencido" : "icone-a-vencer");
                iconeVencimento.textContent = "⚠";
                iconeVencimento.title = textoSeloVencimento(avisoDoGasto) + " (" + formatarDataCurta(avisoDoGasto.dataVencimento) + ")";
                iconeVencimento.setAttribute("aria-label", iconeVencimento.title);
                iconeVencimento.setAttribute("role", "img");
                celulaNaoPago.appendChild(iconeVencimento);
            }

            linha.appendChild(celulaNaoPago);

            const celulaValorComJuros = document.createElement("td");
            celulaValorComJuros.className = "valor-negativo";
            celulaValorComJuros.textContent = "-R$ " + calcularValorComJuros(valor).toFixed(2);
            linha.appendChild(celulaValorComJuros);

            tabelaGastosMesCalculadora.appendChild(linha);
        });
    };

    const carregarGastosMesCalculadora = async () => {
        if (!usuarioLogado) {
            popularSelectMesAnoCalculadora();
            renderizarBarraLimite("");
            renderizarPizza503020("");
            mostrarMensagemTabelaCalculadora("Faça login para ver seus gastos.");
            return;
        }

        const [respostaValores, respostaCategorias, respostaPrevisoes] = await Promise.all([
            fetchApi("http://localhost:3000/valores/usuario/" + usuarioLogado.idUsuario),
            fetchApi("http://localhost:3000/categorias/usuario/" + usuarioLogado.idUsuario),
            fetchApi("http://localhost:3000/previsoes/usuario/" + usuarioLogado.idUsuario)
        ]);

        const valores = await respostaValores.json();
        categoriasCalculadora = await respostaCategorias.json();
        const previsoes = respostaPrevisoes.ok ? await respostaPrevisoes.json() : [];

        valoresCalculadora = valores;
        gastosCarregados = valores.filter((valor) => valor.receitaDespesa === 0);

        estadoGastos = {};
        estadoSalvo = {};
        previsoesSalvas = {};
        previsoes.forEach(registrarPrevisaoSalva);

        await atualizarAvisosCalculadora();

        popularSelectMesAnoCalculadora();
        renderizarGastosMesCalculadora();
    };

    selectMesAnoCalculadora.addEventListener("change", renderizarGastosMesCalculadora);

    carregarGastosMesCalculadora();
}
