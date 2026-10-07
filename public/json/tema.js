// Carregado no <head> de todas as paginas, antes do CSS ser aplicado: assim a pagina
// ja abre no tema certo, sem piscar o modo claro ao navegar no modo escuro.
// Sem escolha salva, segue o tema do sistema operacional.
// O botao que troca o tema fica no main.js (btn_tema)
(function () {
    let tema = localStorage.getItem("tema");

    if (!tema) {
        tema = window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
    }

    document.documentElement.dataset.tema = tema;
})();
