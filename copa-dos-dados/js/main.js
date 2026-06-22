// =========================
// Projeto: A Copa dos Dados
// =========================

console.log("Sistema iniciado.");

// -------------------------
// Carregar o dataset
// -------------------------

async function carregarDados() {

    const dados = await d3.csv("dados/results.csv", d3.autoType);

    console.log("Dataset carregado.");

    console.log("Número de partidas:", dados.length);

    iniciarAplicacao(dados);

}

// -------------------------
// Aplicação principal
// -------------------------

function iniciarAplicacao(dados){

    categoria1(dados);

}

// -------------------------
// Categoria 1
// -------------------------

function categoria1(dados){

    const painel = document.getElementById("grafico-categoria-1");

    painel.innerHTML = "";

    painel.append("Visualização carregada com sucesso.");

    console.log("Categoria 1 pronta.");

}

// -------------------------

carregarDados();
