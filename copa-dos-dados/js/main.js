// ======================================================
// Projeto: A Copa dos Dados
// Universidade Federal do Ceará
// ======================================================

async function iniciarProjeto() {

    console.clear();

    console.log("====================================");
    console.log("A COPA DOS DADOS");
    console.log("Inicializando aplicação...");
    console.log("====================================");

    try {

        const dados = await d3.csv("dados/results.csv");

        console.log("Arquivo carregado com sucesso!");

        console.log("Número de partidas:", dados.length);

        console.log("Primeiras partidas:");

        console.table(dados.slice(0,5));

    }

    catch (erro){

        console.error("Erro ao carregar o CSV.");

        console.error(erro);

    }

}

iniciarProjeto();
