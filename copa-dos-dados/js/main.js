// ======================================================
// Projeto: A Copa dos Dados
// Visualizações Gerais + DNA dos Campeões
// ======================================================


// ======================================================
// CARREGAMENTO E PROCESSAMENTO DOS DADOS
// ======================================================

async function carregarDados() {

  const dados = await d3.csv(
    "dados/results.csv",
    d3.autoType
  );


  // ======================================================
  // TRANSFORMAÇÃO DAS PARTIDAS
  // ======================================================

  const selecoes = dados.flatMap(jogo => {

    const casa = {
      date: jogo.date,
      team: jogo.home_team,
      opponent: jogo.away_team,
      goals_for: jogo.home_score,
      goals_against: jogo.away_score,

      result:
        jogo.home_score > jogo.away_score
          ? "W"
          : jogo.home_score < jogo.away_score
          ? "L"
          : "D",

      tournament: jogo.tournament
    };


    const visitante = {
      date: jogo.date,
      team: jogo.away_team,
      opponent: jogo.home_team,
      goals_for: jogo.away_score,
      goals_against: jogo.home_score,

      result:
        jogo.away_score > jogo.home_score
          ? "W"
          : jogo.away_score < jogo.home_score
          ? "L"
          : "D",

      tournament: jogo.tournament
    };


    return [casa, visitante];

  });


  // ======================================================
  // INFORMAÇÕES HISTÓRICAS DAS COPAS
  // ======================================================

  const copas = [

    {
      ano: 1930,
      campeao: "Uruguay",
      vice: "Argentina",
      terceiro: "United States"
    },

    {
      ano: 1934,
      campeao: "Italy",
      vice: "Czechoslovakia",
      terceiro: "Germany"
    },

    {
      ano: 1938,
      campeao: "Italy",
      vice: "Hungary",
      terceiro: "Brazil"
    },

    {
      ano: 1950,
      campeao: "Uruguay",
      vice: "Brazil",
      terceiro: "Sweden"
    },

    {
      ano: 1954,
      campeao: "Germany",
      vice: "Hungary",
      terceiro: "Austria"
    },

    {
      ano: 1958,
      campeao: "Brazil",
      vice: "Sweden",
      terceiro: "France"
    },

    {
      ano: 1962,
      campeao: "Brazil",
      vice: "Czechoslovakia",
      terceiro: "Chile"
    },

    {
      ano: 1966,
      campeao: "England",
      vice: "Germany",
      terceiro: "Portugal"
    },

    {
      ano: 1970,
      campeao: "Brazil",
      vice: "Italy",
      terceiro: "Germany"
    },

    {
      ano: 1974,
      campeao: "Germany",
      vice: "Netherlands",
      terceiro: "Poland"
    },

    {
      ano: 1978,
      campeao: "Argentina",
      vice: "Netherlands",
      terceiro: "Brazil"
    },

    {
      ano: 1982,
      campeao: "Italy",
      vice: "Germany",
      terceiro: "Poland"
    },

    {
      ano: 1986,
      campeao: "Argentina",
      vice: "Germany",
      terceiro: "France"
    },

    {
      ano: 1990,
      campeao: "Germany",
      vice: "Argentina",
      terceiro: "Italy"
    },

    {
      ano: 1994,
      campeao: "Brazil",
      vice: "Italy",
      terceiro: "Sweden"
    },

    {
      ano: 1998,
      campeao: "France",
      vice: "Brazil",
      terceiro: "Croatia"
    },

    {
      ano: 2002,
      campeao: "Brazil",
      vice: "Germany",
      terceiro: "Turkey"
    },

    {
      ano: 2006,
      campeao: "Italy",
      vice: "France",
      terceiro: "Germany"
    },

    {
      ano: 2010,
      campeao: "Spain",
      vice: "Netherlands",
      terceiro: "Germany"
    },

    {
      ano: 2014,
      campeao: "Germany",
      vice: "Argentina",
      terceiro: "Netherlands"
    },

    {
      ano: 2018,
      campeao: "France",
      vice: "Croatia",
      terceiro: "Belgium"
    },

    {
      ano: 2022,
      campeao: "Argentina",
      vice: "France",
      terceiro: "Croatia"
    }

  ];


  // ======================================================
  // PARTIDAS DA COPA DO MUNDO
  // ======================================================

  const jogosCopa = dados
    .filter(d => d.tournament === "FIFA World Cup")
    .sort((a, b) => a.date - b.date);


  const porAno = d3.group(
    jogosCopa,
    d => d.date.getFullYear()
  );


  // ======================================================
  // PERÍODOS DAS COPAS E CICLOS PRÉ-COPA
  // ======================================================

  const copas_periodos = Array.from(

    porAno,

    ([ano, jogos]) => {

      const datas = jogos.map(d => d.date);


      const participantes = Array.from(

        new Set(

          jogos.flatMap(d => [
            d.home_team,
            d.away_team
          ])

        )

      ).sort();


      return {
        ano,
        inicio: d3.min(datas),
        fim: d3.max(datas),
        participantes
      };

    }

  )

    .sort((a, b) => a.ano - b.ano)

    .map((copa, i, arr) => {

      const anterior = arr[i - 1];


      return {

        ano: copa.ano,

        inicio_copa: copa.inicio,

        fim_copa: copa.fim,

        inicio_analise:
          anterior
            ? d3.timeDay.offset(anterior.fim, 1)
            : d3.timeYear.offset(copa.inicio, -4),

        fim_analise:
          d3.timeDay.offset(copa.inicio, -1),

        participantes:
          copa.participantes

      };

    });


  // ======================================================
  // CAMPANHAS PRÉ-COPA
  // ======================================================

  const pre_campanhas = copas_periodos

    .filter(copa => copa.ano <= 2026)

    .flatMap(copa => {

      const jogosPeriodo = selecoes.filter(d =>

        d.date >= copa.inicio_analise &&

        d.date <= copa.fim_analise &&

        copa.participantes.includes(d.team)

      );


      const porSelecao = d3.group(
        jogosPeriodo,
        d => d.team
      );


      return Array.from(

        porSelecao,

        ([team, jogos]) => {

          const total = jogos.length;

          const vitorias =
            jogos.filter(d => d.result === "W").length;

          const empates =
            jogos.filter(d => d.result === "D").length;

          const derrotas =
            jogos.filter(d => d.result === "L").length;

          const gols_feitos =
            d3.sum(jogos, d => d.goals_for);

          const gols_sofridos =
            d3.sum(jogos, d => d.goals_against);


          return {

            copa: copa.ano,

            team,

            jogos: total,

            vitorias,

            empates,

            derrotas,

            perc_vitorias:
              total
                ? (vitorias / total) * 100
                : 0,

            perc_derrotas:
              total
                ? (derrotas / total) * 100
                : 0,

            media_gols_feitos:
              total
                ? gols_feitos / total
                : 0,

            media_gols_sofridos:
              total
                ? gols_sofridos / total
                : 0

          };

        }

      );

    });


  // ======================================================
  // PARTIDAS PARA A REDE DOS CARRASCOS
  // ======================================================

  const jogos_copa = selecoes

    .filter(jogo =>

      jogo.tournament === "FIFA World Cup" &&

      jogo.date.getFullYear() !== 2026

    )

    .sort((a, b) => a.date - b.date);


  // ======================================================
  // CARREGAMENTO DO MAPA-MÚNDI
  // ======================================================

  const mundo = await fetch(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
  ).then(resposta => resposta.json());


  // ======================================================
  // PAÍSES PARTICIPANTES DAS COPAS
  // ======================================================

  const listaOriginalPaises = Array.from(

    new Set(

      copas_periodos.flatMap(
        d => d.participantes
      )

    )

  );


  const listaAjustadaPaises = listaOriginalPaises.flatMap(pais => {

    switch (pais) {

      case "United States":
        return "United States of America";

      case "DR Congo":
        return "Democratic Republic of the Congo";

      case "Republic of Ireland":
        return "Ireland";

      case "Czech Republic":

      case "Czechoslovakia":
        return "Czechia";

      case "German DR":
        return "Germany";

      case "Yugoslavia":

      case "Serbia":
        return "Serbia";

      case "England":

      case "Scotland":

      case "Wales":

      case "Northern Ireland":
        return "United Kingdom";

      default:
        return pais;

    }

  });


  const paises_copa = Array.from(
    new Set(listaAjustadaPaises)
  );


  // ======================================================
  // CHAMADA DAS CINCO VISUALIZAÇÕES
  // ======================================================

  desenharPedro1(
    copas,
    copas_periodos,
    pre_campanhas,
    mundo,
    paises_copa
  );


  desenharPedro2(
    jogos_copa
  );


  desenharCategoria1(
    copas,
    copas_periodos,
    pre_campanhas
  );


  desenharCategoria2(
    copas,
    copas_periodos,
    pre_campanhas,
    selecoes
  );


  desenharCategoria3(
    copas,
    copas_periodos,
    pre_campanhas,
    selecoes
  );

}

// ======================================================
// PARTE 2 DE 5
// PEDRO 1
// MAPA-MÚNDI + LINHA DOS CICLOS + SCATTER PLOT
// ======================================================

function desenharPedro1(
  copas,
  copas_periodos,
  pre_campanhas,
  mundo,
  paises_copa
) {
  const painel = document.getElementById("grafico-pedro-1");

  painel.classList.remove("grafico-placeholder");
  painel.innerHTML = "";

  const campeoes = [
    "Argentina", "Brazil", "France", "Germany",
    "Italy", "Spain", "United Kingdom", "Uruguay"
  ];

  const campeoesFiltro = [
    "Argentina", "Brazil", "England", "France",
    "Germany", "Italy", "Spain", "Uruguay"
  ];

  const titulosPorPais = {
    Argentina: [1978, 1986, 2022],
    Brazil: [1958, 1962, 1970, 1994, 2002],
    England: [1966],
    France: [1998, 2018],
    Germany: [1954, 1974, 1990, 2014],
    Italy: [1934, 1938, 1982, 2006],
    Spain: [2010],
    Uruguay: [1930, 1950]
  };

  const container = document.createElement("div");
  container.className = "pedro-painel-container";

  const titulo = document.createElement("h2");
  titulo.className = "pedro-titulo-grafico";
  titulo.textContent = "Mapa-múndi dos países participantes da Copa do Mundo";

  const seletorBox = document.createElement("div");
  seletorBox.className = "filtro-horizontal pedro-filtro";

  const tituloFiltro = document.createElement("p");
  tituloFiltro.textContent = "Seleção campeã:";
  tituloFiltro.style.fontWeight = "700";
  tituloFiltro.style.margin = "0 10px 0 0";

  seletorBox.appendChild(tituloFiltro);

  const areaMapa = document.createElement("div");
  areaMapa.className = "pedro-mapa";

  const areaGraficosInferiores = document.createElement("div");
  areaGraficosInferiores.className = "pedro-graficos-inferiores";

  const areaLinha = document.createElement("div");
  const areaScatter = document.createElement("div");

  areaGraficosInferiores.appendChild(areaLinha);
  areaGraficosInferiores.appendChild(areaScatter);

  container.appendChild(titulo);
  container.appendChild(seletorBox);
  container.appendChild(areaMapa);
  container.appendChild(areaGraficosInferiores);

  painel.appendChild(container);

  let selecaoSelecionada = "Brazil";

  campeoesFiltro.forEach(selecao => {
    const label = document.createElement("label");
    const input = document.createElement("input");

    input.type = "radio";
    input.name = "selecao-pedro-1";
    input.value = selecao;
    input.checked = selecao === selecaoSelecionada;

    input.addEventListener("change", () => {
      selecaoSelecionada = selecao;
      atualizar();
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(selecao));
    seletorBox.appendChild(label);
  });

  function ajustarNomeMapa(selecao) {
    return selecao === "England" ? "United Kingdom" : selecao;
  }

  function obterHistoricoPais(nomePais) {
    const historicos = {
      Brazil:
        "Campeã na Suécia (1958), Chile (1962), México (1970), Estados Unidos (1994) e Japão/Coreia do Sul (2002). É a única seleção campeã em quatro continentes diferentes.",
      Germany:
        "Campeã na Suíça (1954), Alemanha (1974), Itália (1990) e Brasil (2014). É a única seleção europeia campeã em território sul-americano.",
      Italy:
        "Campeã na Itália (1934), França (1938), Espanha (1982) e Alemanha (2006). Foi a primeira seleção campeã fora de seus próprios domínios.",
      Argentina:
        "Campeã na Argentina (1978), México (1986) e Catar (2022).",
      France:
        "Campeã na França (1998) e Rússia (2018).",
      Uruguay:
        "Campeã no Uruguai (1930) e Brasil (1950). Todas as suas conquistas ocorreram em território sul-americano.",
      Spain:
        "Campeã na África do Sul (2010). É a única seleção campeã mundial em território africano.",
      "United Kingdom":
        "A Inglaterra foi campeã mundial em 1966, jogando em seus próprios domínios."
    };

    if (historicos[nomePais]) return historicos[nomePais];

    if (paises_copa.includes(nomePais)) {
      return "Participante da Copa do Mundo sem títulos mundiais.";
    }

    return "País sem participação na Copa do Mundo.";
  }

  function desenharMapa() {
    const selecaoMapa = ajustarNomeMapa(selecaoSelecionada);

    const largura = 1000;
    const altura = 370;

    const paises = topojson.feature(mundo, mundo.objects.countries);

    const projecao = d3.geoNaturalEarth1()
      .fitSize([largura, altura], paises);

    const caminho = d3.geoPath(projecao);

    const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${largura} ${altura}`)
      .attr("style", "width:100%; height:auto;");

    svg.append("g")
      .selectAll("path")
      .data(paises.features)
      .join("path")
      .attr("d", caminho)
      .attr("fill", d => {
        const nome = d.properties.name;

        if (nome === selecaoMapa) return "#e63946";
        if (campeoes.includes(nome)) return "#7FFFD4";
        if (paises_copa.includes(nome)) return "#1d3557";

        return "#dddddd";
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.5)
      .append("title")
      .text(d => `${d.properties.name}\n${obterHistoricoPais(d.properties.name)}`);

    areaMapa.replaceChildren(svg.node());
  }

  function prepararDadosCiclos() {
    const anosCampeao = titulosPorPais[selecaoSelecionada] || [];

    return pre_campanhas
      .filter(d => d.team === selecaoSelecionada)
      .map(d => {
        const saldo = d.media_gols_feitos - d.media_gols_sofridos;

        return {
          ...d,
          saldo_gols: saldo,
          campeao: anosCampeao.includes(d.copa),
          icone: anosCampeao.includes(d.copa) ? "🏆" : "⚽",
          tooltipLinha:
            `Copa: ${d.copa}\n` +
            `Jogos: ${d.jogos}\n` +
            `Vitórias: ${d.vitorias}\n` +
            `% de vitórias: ${d.perc_vitorias.toFixed(0)}%`,
          tooltipScatter:
            `Copa: ${d.copa}\n` +
            `% de vitórias: ${d.perc_vitorias.toFixed(0)}%\n` +
            `Saldo médio de gols: ${saldo.toFixed(2)}`
        };
      });
  }

  function desenharLinha(dadosCiclos) {
    const grafico = Plot.plot({
      width: 500,
      height: 310,

      marginTop: 35,
      marginRight: 25,
      marginBottom: 60,
      marginLeft: 65,

      style: {
        fontSize: 11,
        background: "#fafafa"
      },

      x: {
        label: "Ano da Copa",
        domain: [1930, 2026],
        ticks: d3.range(1930, 2027, 8),
        tickFormat: d => String(Math.round(d)),
        tickRotate: -45
      },

      y: {
        label: "% de vitórias por ciclo",
        domain: [0, 100],
        grid: true
      },

      marks: [
        Plot.line(dadosCiclos, {
          x: "copa",
          y: "perc_vitorias",
          stroke: "#1d3557",
          strokeWidth: 3
        }),

        Plot.text(dadosCiclos, {
          x: "copa",
          y: "perc_vitorias",
          text: "icone",
          fontSize: 16,
          title: "tooltipLinha"
        })
      ]
    });

    areaLinha.replaceChildren(grafico);
  }

  function desenharScatter(dadosCiclos) {
    const largura = 500;
    const altura = 310;

    const margem = {
      top: 35,
      right: 30,
      bottom: 60,
      left: 65
    };

    const xExtent = d3.extent(dadosCiclos, d => d.saldo_gols);
    const folgaX = Math.max(0.25, (xExtent[1] - xExtent[0]) * 0.12);

    const x = d3.scaleLinear()
      .domain([xExtent[0] - folgaX, xExtent[1] + folgaX])
      .range([margem.left, largura - margem.right]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([altura - margem.bottom, margem.top]);

    const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${largura} ${altura}`)
      .attr("style", "width:100%; height:auto; background:#fafafa;");

    svg.append("g")
      .attr("transform", `translate(0,${altura - margem.bottom})`)
      .call(d3.axisBottom(x).ticks(5));

    svg.append("g")
      .attr("transform", `translate(${margem.left},0)`)
      .call(d3.axisLeft(y).ticks(5));

    svg.append("text")
      .attr("x", largura / 2)
      .attr("y", altura - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "#333")
      .text("Saldo médio de gols por ciclo");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -altura / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "#333")
      .text("% de vitórias por ciclo");

    const grupoPontos = svg.append("g");

    const ponto = grupoPontos.selectAll("g")
      .data(dadosCiclos)
      .join("g")
      .attr("transform", d => `translate(${x(d.saldo_gols)},${y(d.perc_vitorias)})`)
      .style("cursor", "pointer");

    ponto.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", 17)
      .text(d => d.icone);

    ponto.append("text")
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .attr("font-size", 9)
      .attr("font-weight", 700)
      .attr("fill", "#333")
      .text(d => d.copa);

    ponto.append("title")
      .text(d => d.tooltipScatter);

    ponto
      .on("mouseover", function () {
        ponto.attr("opacity", 0.25);
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseout", function () {
        ponto.attr("opacity", 1);
      });

    areaScatter.replaceChildren(svg.node());
  }

  function atualizar() {
    const dadosCiclos = prepararDadosCiclos();

    desenharMapa();
    desenharLinha(dadosCiclos);
    desenharScatter(dadosCiclos);
  }

  atualizar();
}


function desenharPedro2(jogos_copa) {
  const painel = document.getElementById("grafico-pedro-2");

  painel.classList.remove("grafico-placeholder");
  painel.innerHTML = "";

  const container = document.createElement("div");
  container.className = "rede-container";

  const titulo = document.createElement("h2");
  titulo.className = "pedro-titulo-grafico";
  titulo.textContent = "Gráfico de rede dos países carrascos das seleções campeãs";

  const legenda = document.createElement("div");

  legenda.style.display = "flex";
  legenda.style.flexWrap = "wrap";
  legenda.style.gap = "18px";
  legenda.style.alignItems = "center";
  legenda.style.marginBottom = "15px";
  legenda.style.fontSize = "14px";
  legenda.style.color = "#444";

  legenda.innerHTML = `
    <span><strong style="color:#1BA652;">●</strong> Seleções campeãs</span>
    <span><strong style="color:#F7A72F;">●</strong> Carrascos</span>
    <span>As setas indicam o carrasco em direção à seleção campeã derrotada.</span>
  `;

  const areaRede = document.createElement("div");
  areaRede.style.width = "100%";

  container.appendChild(titulo);
  container.appendChild(legenda);
  container.appendChild(areaRede);

  painel.appendChild(container);

  const campeoes = [
    "Brazil",
    "Argentina",
    "Germany",
    "Italy",
    "France",
    "Spain",
    "England",
    "Uruguay"
  ];

  const partidasUnicasMap = new Map();

  jogos_copa.forEach(jogo => {
    const times = [jogo.team, jogo.opponent].sort().join(" x ");

    const gols = [jogo.goals_for, jogo.goals_against].sort((a, b) => a - b).join("-");

    const chave = `${jogo.date.toISOString()} | ${times} | ${gols}`;

    if (!partidasUnicasMap.has(chave)) {
      partidasUnicasMap.set(chave, jogo);
    }
  });

  const partidasUnicas = Array.from(partidasUnicasMap.values());

  const contagem = {};

  campeoes.forEach(campeao => {
    contagem[campeao] = {
      vitorias: {},
      derrotas: {}
    };
  });

  partidasUnicas.forEach(({ team, opponent, result }) => {
    if (campeoes.includes(team)) {
      if (result === "W") {
        contagem[team].vitorias[opponent] =
          (contagem[team].vitorias[opponent] || 0) + 1;
      }

      if (result === "L") {
        contagem[team].derrotas[opponent] =
          (contagem[team].derrotas[opponent] || 0) + 1;
      }
    }

    if (campeoes.includes(opponent)) {
      if (result === "L") {
        contagem[opponent].vitorias[team] =
          (contagem[opponent].vitorias[team] || 0) + 1;
      }

      if (result === "W") {
        contagem[opponent].derrotas[team] =
          (contagem[opponent].derrotas[team] || 0) + 1;
      }
    }
  });

  function buscarMaximo(objeto) {
    let rivais = [];
    let max = 0;

    Object.entries(objeto).forEach(([rival, quantidade]) => {
      if (quantidade > max) {
        max = quantidade;
        rivais = [rival];
      }

      else if (quantidade === max && max > 0) {
        rivais.push(rival);
      }
    });

    return { rivais, max };
  }

  const freguesesCarrascos = campeoes
    .map(campeao => {
      const carrasco = buscarMaximo(contagem[campeao].derrotas);

      return {
        selecao: campeao,
        carrascos: carrasco.rivais,
        derrotas: carrasco.max
      };
    })
    .sort((a, b) => a.selecao.localeCompare(b.selecao));

  const nodesMap = new Set();
  const links = [];
  const derrotasPorCampeao = {};

  freguesesCarrascos.forEach(row => {
    const selecao = row.selecao;

    nodesMap.add(selecao);

    derrotasPorCampeao[selecao] = row.derrotas || 0;

    row.carrascos.forEach(carrasco => {
      if (carrasco && carrasco !== "Nenhum") {
        nodesMap.add(carrasco);

        links.push({
          source: carrasco,
          target: selecao
        });
      }
    });
  });

  const nodes = Array.from(nodesMap).map(id => {
    const ehCampeao = campeoes.includes(id);

    return {
      id,
      group: ehCampeao ? "Campeão" : "Carrasco",
      weight: ehCampeao ? derrotasPorCampeao[id] || 0 : 1
    };
  });

  const width = 900;
  const height = 520;

  const nodeStroke = "#1a1a1a";
  const linkOpacity = 0.35;
  const nodeDeselectOpacity = 0.25;
  const linkDeselectOpacity = 0.1;
  const nodeHighlightStroke = "#000000";
  const nodeHighlightStrokeWidth = 2.5;

  function radiusNode(d) {
    if (d.group === "Campeão") {
      return Math.max(10, d.weight * 4.5);
    }

    return 6;
  }

  const simulation = d3.forceSimulation(nodes)
  .force(
    "link",
    d3.forceLink(links)
      .id(d => d.id)
      .distance(95)
  )
  .force(
    "charge",
    d3.forceManyBody().strength(-260)
  )
  .force(
    "center",
    d3.forceCenter(0, 0)
  )
  .force(
    "x",
    d3.forceX(0).strength(0.08)
  )
  .force(
    "y",
    d3.forceY(0).strength(0.08)
  )
  .force(
    "collision",
    d3.forceCollide().radius(d => radiusNode(d) + 10)
  );

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width:100%; height:auto; background:#fafafa; border-radius:12px;");

  svg.on("click", deselectNode);

  svg.append("defs")
    .selectAll("marker")
    .data(["Carrasco"])
    .join("marker")
    .attr("id", d => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 7)
    .attr("refY", 0)
    .attr("markerWidth", 5.5)
    .attr("markerHeight", 5.5)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", "#1a1a1a")
    .attr("d", "M0,-4L8,0L0,4");

  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#1a1a1a")
    .attr("opacity", linkOpacity)
    .attr("stroke-width", 2.4)
    .attr("marker-end", "url(#arrow-Carrasco)");

  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", d => radiusNode(d))
    .attr("fill", d => d.group === "Campeão" ? "#1BA652" : "#F7A72F")
    .attr("stroke", nodeStroke)
    .attr("stroke-width", d => d.group === "Campeão" ? 1.5 : 1.0)
    .on("click", clicked);

  node.append("title")
    .text(d =>
      d.group === "Campeão"
        ? `${d.id}\n${d.weight} derrota(s) contra seus maiores carrascos`
        : `${d.id}\nCarrasco`
    );

  const text = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("dx", d => radiusNode(d) + 6)
    .attr("dy", "0.31em")
    .text(d => d.id)
    .style("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", d => d.group === "Campeão" ? "12px" : "10.5px")
    .style("fill", d => d.group === "Campeão" ? "#1a1a1a" : "#333333")
    .style("font-weight", d => d.group === "Campeão" ? "700" : "400")
    .style("user-select", "none")
    .style("pointer-events", "none");

  node.call(
    d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  );

  simulation.on("tick", () => {
    link
      .attr("x1", d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        return d.source.x + (dx / dist) * (radiusNode(d.source) + 2);
      })
      .attr("y1", d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        return d.source.y + (dy / dist) * (radiusNode(d.source) + 2);
      })
      .attr("x2", d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        return d.target.x - (dx / dist) * (radiusNode(d.target) + 7);
      })
      .attr("y2", d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        return d.target.y - (dy / dist) * (radiusNode(d.target) + 7);
      });

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    text
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();

    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);

    event.subject.fx = null;
    event.subject.fy = null;
  }

  function clicked(event, d) {
    event.stopPropagation();

    svg.selectAll("circle")
      .attr("stroke", nodeStroke)
      .attr("stroke-width", n => n.group === "Campeão" ? 1.5 : 1.0)
      .attr("stroke-opacity", nodeDeselectOpacity)
      .attr("fill-opacity", nodeDeselectOpacity);

    svg.selectAll("line")
      .attr("opacity", linkDeselectOpacity);

    svg.selectAll("text")
      .attr("fill-opacity", nodeDeselectOpacity);

    d3.select(event.currentTarget)
      .attr("stroke", nodeHighlightStroke)
      .attr("stroke-width", nodeHighlightStrokeWidth)
      .attr("stroke-opacity", 1)
      .attr("fill-opacity", 1);

    svg.selectAll("text")
      .filter(t => t.id === d.id)
      .attr("fill-opacity", 1);

    const vizinhos = new Set();

    links.forEach(l => {
      if (l.source.id === d.id) {
        vizinhos.add(l.target.id);

        svg.selectAll("line")
          .filter(line => line.source.id === d.id && line.target.id === l.target.id)
          .attr("opacity", 0.9);
      }

      if (l.target.id === d.id) {
        vizinhos.add(l.source.id);

        svg.selectAll("line")
          .filter(line => line.source.id === l.source.id && line.target.id === d.id)
          .attr("opacity", 0.9);
      }
    });

    svg.selectAll("circle")
      .filter(n => vizinhos.has(n.id))
      .attr("stroke-opacity", 1)
      .attr("fill-opacity", 1);

    svg.selectAll("text")
      .filter(t => vizinhos.has(t.id))
      .attr("fill-opacity", 1);
  }

  function deselectNode() {
    svg.selectAll("circle")
      .attr("stroke", nodeStroke)
      .attr("stroke-width", d => d.group === "Campeão" ? 1.5 : 1.0)
      .attr("stroke-opacity", 1)
      .attr("fill-opacity", 1);

    svg.selectAll("line")
      .attr("opacity", linkOpacity);

    svg.selectAll("text")
      .attr("fill-opacity", 1);
  }

  areaRede.appendChild(svg.node());
}
// ======================================================
// PARTE 4 DE 5
// DNA 1
// RANKINGS PRÉ-COPA
// ======================================================

function desenharCategoria1(
  copas,
  copas_periodos,
  pre_campanhas
) {

  const painel = document.getElementById("grafico-categoria-1");

  painel.classList.remove("grafico-placeholder");
  painel.innerHTML = "";

  const anos = copas_periodos
    .filter(d => d.ano <= 2022)
    .map(d => d.ano);

  const container = document.createElement("div");

  container.style.padding = "20px";
  container.style.border = "1px solid #ddd";
  container.style.borderRadius = "12px";
  container.style.background = "#fafafa";

  const titulo = document.createElement("h2");

  titulo.textContent =
    "Top 10 ranking de desempenho pré-Copa";

  titulo.style.marginTop = "0";
  titulo.style.marginBottom = "18px";
  titulo.style.color = "#222";

  const seletorBox = document.createElement("div");

  seletorBox.className = "filtro-horizontal";
  seletorBox.style.display = "grid";
  seletorBox.style.gridTemplateColumns =
    "repeat(11, minmax(55px, 1fr))";
  seletorBox.style.gap = "10px 14px";

  const tituloFiltro = document.createElement("p");

  tituloFiltro.textContent = "Selecione a Copa:";
  tituloFiltro.style.fontWeight = "700";
  tituloFiltro.style.margin = "0";
  tituloFiltro.style.gridColumn = "1 / -1";

  seletorBox.appendChild(tituloFiltro);

  const areaGraficos = document.createElement("div");

  areaGraficos.style.display = "grid";
  areaGraficos.style.gridTemplateColumns = "1fr 1fr";
  areaGraficos.style.gap = "28px";

  container.appendChild(titulo);
  container.appendChild(seletorBox);
  container.appendChild(areaGraficos);

  painel.appendChild(container);

  let anoSelecionado = 2022;

  anos.forEach(ano => {

    const label = document.createElement("label");

    label.style.display = "inline-flex";
    label.style.alignItems = "center";
    label.style.gap = "5px";
    label.style.cursor = "pointer";
    label.style.whiteSpace = "nowrap";

    const input = document.createElement("input");

    input.type = "radio";
    input.name = "seletor-copa";
    input.value = ano;
    input.checked = ano === anoSelecionado;

    input.addEventListener("change", () => {
      anoSelecionado = ano;
      atualizar();
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(`${ano}`));

    seletorBox.appendChild(label);

  });


  function prepararBase(ano) {

    const info = copas.find(d => d.ano === ano);

    return pre_campanhas
      .filter(d => d.copa === ano)
      .map(d => {

        let status = "demais";
        let medalha = "";

        if (d.team === info.campeao) {
          status = "campeao";
          medalha = "🥇 ";
        }

        else if (d.team === info.vice) {
          status = "vice";
          medalha = "🥈 ";
        }

        else if (d.team === info.terceiro) {
          status = "terceiro";
          medalha = "🥉 ";
        }

        return {
          ...d,
          status,
          selecao: medalha + d.team
        };

      });

  }


  function graficoBarras(
    titulo,
    dados,
    campo,
    formato,
    ordem = "desc"
  ) {

    const ordenados = [...dados]
      .sort((a, b) =>
        ordem === "desc"
          ? b[campo] - a[campo]
          : a[campo] - b[campo]
      )
      .slice(0, 10);

    return Plot.plot({

      width: 500,
      height: 350,

      marginTop: 42,
      marginLeft: 195,
      marginRight: 65,
      marginBottom: 18,

      style: {
        fontSize: 15,
        fontWeight: 500
      },

      x: {
        label: null,
        ticks: 0,
        axis: null
      },

      y: {
        label: null,
        tickSize: 0
      },

      color: {
        domain: [
          "campeao",
          "vice",
          "terceiro",
          "demais"
        ],
        range: [
          "#D4AF37",
          "#BFC1C2",
          "#CD7F32",
          "#8A8A8A"
        ]
      },

      marks: [

        Plot.text([titulo], {
          frameAnchor: "top-left",
          dy: -28,
          text: d => d,
          fontSize: 14,
          fontWeight: 900,
          fill: "#222"
        }),

        Plot.barX(ordenados, {
          y: "selecao",
          x: campo,
          fill: "status",
          sort: {
            y: "x",
            reverse: ordem === "desc"
          }
        }),

        Plot.text(ordenados, {
          y: "selecao",
          x: campo,
          text: d => formato(d[campo]),
          dx: 30,
          fill: "#222",
          fontSize: 16,
          fontWeight: 600
        })

      ]

    });

  }


  function atualizar() {

    const base = prepararBase(anoSelecionado);

    const g1 = graficoBarras(
      `Top 10 — Maior % de vitórias (${anoSelecionado})`,
      base,
      "perc_vitorias",
      d => d.toFixed(1) + "%",
      "desc"
    );

    const g2 = graficoBarras(
      `Top 10 — Menor % de derrotas (${anoSelecionado})`,
      base,
      "perc_derrotas",
      d => d.toFixed(1) + "%",
      "asc"
    );

    const g3 = graficoBarras(
      `Top 10 — Maior média de gols feitos (${anoSelecionado})`,
      base,
      "media_gols_feitos",
      d => d.toFixed(2),
      "desc"
    );

    const g4 = graficoBarras(
      `Top 10 — Menor média de gols sofridos (${anoSelecionado})`,
      base,
      "media_gols_sofridos",
      d => d.toFixed(2),
      "asc"
    );

    areaGraficos.replaceChildren(
      g1,
      g2,
      g3,
      g4
    );

  }

  atualizar();

}

// ======================================================
// PARTE 5 DE 5
// DNA 2 + DNA 3
// HISTOGRAMA + SCATTER FINAL
// ======================================================


// ======================================================
// DNA 2
// POSIÇÃO DOS CAMPEÕES NOS RANKINGS
// ======================================================

function desenharCategoria2(
  copas,
  copas_periodos,
  pre_campanhas,
  selecoes
) {

  const painel = document.getElementById("grafico-categoria-2");

  painel.classList.remove("grafico-placeholder");
  painel.innerHTML = "";

  const indicadores = [
    { nome: "% de vitórias", campo: "perc_vitorias", ordem: "desc" },
    { nome: "% de derrotas", campo: "perc_derrotas", ordem: "asc" },
    { nome: "Média de gols feitos", campo: "media_gols_feitos", ordem: "desc" },
    { nome: "Média de gols sofridos", campo: "media_gols_sofridos", ordem: "asc" }
  ];

  const favoritos2026 = [
    { team: "Brazil", sigla: "BRA" },
    { team: "Argentina", sigla: "ARG" },
    { team: "Uruguay", sigla: "URU" },
    { team: "Germany", sigla: "ALE" },
    { team: "France", sigla: "FRA" },
    { team: "Spain", sigla: "ESP" },
    { team: "England", sigla: "ING" },
    { team: "Netherlands", sigla: "HOL" },
    { team: "Portugal", sigla: "POR" }
  ];

  const container = document.createElement("div");

  container.style.padding = "20px";
  container.style.border = "1px solid #ddd";
  container.style.borderRadius = "12px";
  container.style.background = "#fafafa";

  const titulo = document.createElement("h2");

  titulo.textContent =
    "Frequência das posições dos campeões nos rankings pré-Copa";

  titulo.style.marginTop = "0";
  titulo.style.marginBottom = "18px";
  titulo.style.color = "#222";

  const seletorBox = document.createElement("div");
  seletorBox.className = "filtro-horizontal";

  const areaGrafico = document.createElement("div");

  container.appendChild(titulo);
  container.appendChild(seletorBox);
  container.appendChild(areaGrafico);

  painel.appendChild(container);

  let indicadorSelecionado = "% de vitórias";

  indicadores.forEach(ind => {

    const label = document.createElement("label");

    const input = document.createElement("input");

    input.type = "radio";
    input.name = "indicador-categoria-2";
    input.value = ind.nome;
    input.checked = ind.nome === indicadorSelecionado;

    input.addEventListener("change", () => {
      indicadorSelecionado = ind.nome;
      atualizar();
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(ind.nome));

    seletorBox.appendChild(label);

  });


  function rankingPorIndicador(base, campo, ordem) {

    return [...base]
      .filter(d => d.jogos >= 5)
      .sort((a, b) =>
        ordem === "desc"
          ? b[campo] - a[campo]
          : a[campo] - b[campo]
      )
      .map((d, i) => ({
        ...d,
        posicao: i + 1
      }));

  }


  function base2026() {

    const periodo2026 = copas_periodos.find(d => d.ano === 2026);

    const jogosPeriodo = selecoes.filter(d =>
      d.date >= periodo2026.inicio_analise &&
      d.date <= periodo2026.fim_analise
    );

    const porSelecao = d3.group(jogosPeriodo, d => d.team);

    return Array.from(porSelecao, ([team, jogos]) => {

      const total = jogos.length;
      const vitorias = jogos.filter(d => d.result === "W").length;
      const derrotas = jogos.filter(d => d.result === "L").length;
      const gols_feitos = d3.sum(jogos, d => d.goals_for);
      const gols_sofridos = d3.sum(jogos, d => d.goals_against);

      return {
        team,
        jogos: total,
        perc_vitorias: total ? (vitorias / total) * 100 : 0,
        perc_derrotas: total ? (derrotas / total) * 100 : 0,
        media_gols_feitos: total ? gols_feitos / total : 0,
        media_gols_sofridos: total ? gols_sofridos / total : 0
      };

    });

  }


  function atualizar() {

    const indicador = indicadores.find(d => d.nome === indicadorSelecionado);

    const posicoesCampeoes = copas
      .filter(copa => copa.ano <= 2022)
      .map(copa => {

        const base = pre_campanhas.filter(d => d.copa === copa.ano);

        const ranking = rankingPorIndicador(
          base,
          indicador.campo,
          indicador.ordem
        );

        const campeao = ranking.find(d => d.team === copa.campeao);

        return campeao
          ? {
              copa: copa.ano,
              campeao: copa.campeao,
              posicao: campeao.posicao
            }
          : null;

      })
      .filter(d => d !== null);

    const rankingCompleto2026 = rankingPorIndicador(
      base2026(),
      indicador.campo,
      indicador.ordem
    );

    const rankingFavoritos2026 = favoritos2026
      .map(fav => {

        const encontrado = rankingCompleto2026.find(d => d.team === fav.team);

        return encontrado
          ? {
              ...encontrado,
              sigla: fav.sigla
            }
          : null;

      })
      .filter(d => d !== null);

    const maxPosicaoGeral = Math.max(
      d3.max(posicoesCampeoes, d => d.posicao),
      d3.max(rankingFavoritos2026, d => d.posicao)
    );

    const frequencias = d3.range(1, maxPosicaoGeral + 1).map(pos => {

      const campeoesNaPosicao = posicoesCampeoes.filter(
        d => d.posicao === pos
      );

      return {
        posicao: pos,
        frequencia: campeoesNaPosicao.length,
        tooltip:
          campeoesNaPosicao.length > 0
            ? campeoesNaPosicao
                .map(d => `${d.campeao} (${d.copa})`)
                .join("\n")
            : "Nenhum campeão histórico nesta posição"
      };

    });

    const yMax = d3.max(frequencias, d => d.frequencia);
    const yFavoritos = yMax + 1.15;

    const faixaFavoritos = [{
      x1: 0.5,
      x2: maxPosicaoGeral + 0.5,
      y1: yFavoritos - 0.60,
      y2: yFavoritos + 1.70
    }];

    const favoritosPlot = rankingFavoritos2026.map(d => {

      const valorIndicador =
        indicador.campo === "perc_vitorias"
          ? d.perc_vitorias.toFixed(1) + "%"
          : indicador.campo === "perc_derrotas"
          ? d.perc_derrotas.toFixed(1) + "%"
          : indicador.campo === "media_gols_feitos"
          ? d.media_gols_feitos.toFixed(2)
          : d.media_gols_sofridos.toFixed(2);

      return {
        ...d,
        y: yFavoritos,
        tooltip:
          `${d.team}\n` +
          `Posição: ${d.posicao}º\n` +
          `${indicador.nome}: ${valorIndicador}`
      };

    });

    const grafico = Plot.plot({

      width: 1050,
      height: 390,

      marginTop: 45,
      marginRight: 35,
      marginBottom: 60,
      marginLeft: 55,

      style: {
        fontSize: 10
      },

      x: {
        label: "Posição no ranking pré-Copa",
        domain: [0.5, maxPosicaoGeral + 0.5],
        ticks: d3.range(5, maxPosicaoGeral + 1, 5),
        tickFormat: d => d,
        tickRotate: 0
      },

      y: {
        label: null,
        axis: null,
        grid: true,
        domain: [0, yFavoritos + 1.6],
        ticks: d3.range(0, yFavoritos + 1.6, 0.5)
      },

      marks: [

        Plot.rect(faixaFavoritos, {
          x1: "x1",
          x2: "x2",
          y1: "y1",
          y2: "y2",
          fill: "#000",
          fillOpacity: 0.045
        }),

        Plot.text([{ x: 1, y: yFavoritos + 0.35, texto: "Favoritos" }], {
          x: "x",
          y: "y",
          text: "texto",
          dx: -10,
          textAnchor: "end",
          fontSize: 11,
          fontWeight: 700,
          fill: "#444"
        }),

        Plot.text([{ x: 1, y: yFavoritos + 0.05, texto: "2026" }], {
          x: "x",
          y: "y",
          text: "texto",
          dx: -10,
          textAnchor: "end",
          fontSize: 11,
          fontWeight: 700,
          fill: "#444"
        }),

        Plot.rectY(frequencias, {
          x1: d => d.posicao - 0.45,
          x2: d => d.posicao + 0.45,
          y: "frequencia",
          fill: "#8A8A8A",
          title: "tooltip"
        }),

        Plot.text(
          frequencias.filter(d => d.frequencia > 0),
          {
            x: "posicao",
            y: "frequencia",
            text: d => d.frequencia,
            dy: -7,
            fontSize: 13,
            fontWeight: 700,
            fill: "#222"
          }
        ),

        Plot.dot(favoritosPlot, {
          x: "posicao",
          y: "y",
          r: 4,
          fill: "#D4AF37",
          stroke: "#222",
          title: "tooltip"
        }),

        Plot.text(favoritosPlot, {
          x: "posicao",
          y: "y",
          text: "team",
          dx: 2,
          dy: -11,
          rotate: -45,
          textAnchor: "start",
          fontSize: 12,
          fontWeight: 700,
          fill: "#222"
        })

      ]

    });

    areaGrafico.replaceChildren(grafico);

  }

  atualizar();

}


// ======================================================
// DNA 3
// CAMPEÕES HISTÓRICOS × SELEÇÕES DE 2026
// ======================================================

function desenharCategoria3(
  copas,
  copas_periodos,
  pre_campanhas,
  selecoes
) {

  const painel = document.getElementById("grafico-categoria-3");

  painel.classList.remove("grafico-placeholder");
  painel.innerHTML = "";

  const indicadores = [
    {
      nome: "% de vitórias",
      campo: "perc_vitorias",
      sentido: "maior",
      formato: d => d.toFixed(1) + "%"
    },
    {
      nome: "% de derrotas",
      campo: "perc_derrotas",
      sentido: "menor",
      formato: d => d.toFixed(1) + "%"
    },
    {
      nome: "Média de gols feitos",
      campo: "media_gols_feitos",
      sentido: "maior",
      formato: d => d.toFixed(2)
    },
    {
      nome: "Média de gols sofridos",
      campo: "media_gols_sofridos",
      sentido: "menor",
      formato: d => d.toFixed(2)
    }
  ];

  const combinacoes = [
    ["% de vitórias", "% de derrotas"],
    ["% de vitórias", "Média de gols feitos"],
    ["% de vitórias", "Média de gols sofridos"],
    ["% de derrotas", "Média de gols feitos"],
    ["% de derrotas", "Média de gols sofridos"],
    ["Média de gols feitos", "Média de gols sofridos"]
  ];

  const favoritos2026 = [
    { team: "Brazil", sigla: "BRA" },
    { team: "Argentina", sigla: "ARG" },
    { team: "Uruguay", sigla: "URU" },
    { team: "Germany", sigla: "ALE" },
    { team: "France", sigla: "FRA" },
    { team: "Spain", sigla: "ESP" },
    { team: "England", sigla: "ING" },
    { team: "Netherlands", sigla: "HOL" },
    { team: "Portugal", sigla: "POR" }
  ];

  const container = document.createElement("div");

  container.style.padding = "20px";
  container.style.border = "1px solid #ddd";
  container.style.borderRadius = "12px";
  container.style.background = "#fafafa";

  const titulo = document.createElement("h2");

  titulo.textContent =
    "Dispersão do desempenho pré-Copa: campeões históricos e seleções de 2026";

  titulo.style.marginTop = "0";
  titulo.style.marginBottom = "18px";
  titulo.style.color = "#222";

  const seletorBox = document.createElement("div");
  seletorBox.className = "filtro-horizontal";

  const areaGrafico = document.createElement("div");

  container.appendChild(titulo);
  container.appendChild(seletorBox);
  container.appendChild(areaGrafico);

  painel.appendChild(container);

  let combinacaoSelecionada =
    "% de vitórias × Média de gols sofridos";

  combinacoes.forEach(comb => {

    const texto = `${comb[0]} × ${comb[1]}`;

    const label = document.createElement("label");

    const input = document.createElement("input");

    input.type = "radio";
    input.name = "combinacao-categoria-3";
    input.value = texto;
    input.checked = texto === combinacaoSelecionada;

    input.addEventListener("change", () => {
      combinacaoSelecionada = texto;
      atualizar();
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(texto));

    seletorBox.appendChild(label);

  });


  function base2026Participantes() {

    const periodo2026 = copas_periodos.find(d => d.ano === 2026);

    const participantes2026 = periodo2026.participantes;

    const jogosPeriodo = selecoes.filter(d =>
      d.date >= periodo2026.inicio_analise &&
      d.date <= periodo2026.fim_analise &&
      participantes2026.includes(d.team)
    );

    const porSelecao = d3.group(jogosPeriodo, d => d.team);

    return Array.from(porSelecao, ([team, jogos]) => {

      const total = jogos.length;
      const vitorias = jogos.filter(d => d.result === "W").length;
      const derrotas = jogos.filter(d => d.result === "L").length;
      const gols_feitos = d3.sum(jogos, d => d.goals_for);
      const gols_sofridos = d3.sum(jogos, d => d.goals_against);

      const favorito = favoritos2026.find(f => f.team === team);

      return {
        grupo:
          team === "Brazil"
            ? "Brasil"
            : favorito
            ? "Favoritos 2026"
            : "Seleções 2026",

        team,
        sigla: favorito ? favorito.sigla : "",
        label: team,
        jogos: total,
        perc_vitorias: total ? (vitorias / total) * 100 : 0,
        perc_derrotas: total ? (derrotas / total) * 100 : 0,
        media_gols_feitos: total ? gols_feitos / total : 0,
        media_gols_sofridos: total ? gols_sofridos / total : 0
      };

    });

  }


  function baseCampeoesHistoricos() {

    return copas
      .filter(copa => copa.ano <= 2022)
      .map(copa => {

        const campeao = pre_campanhas.find(d =>
          d.copa === copa.ano &&
          d.team === copa.campeao
        );

        return campeao
          ? {
              grupo: "Campeões históricos",
              team: copa.campeao,
              sigla: "",
              label: `${copa.campeao} (${copa.ano})`,
              copa: copa.ano,
              jogos: campeao.jogos,
              perc_vitorias: campeao.perc_vitorias,
              perc_derrotas: campeao.perc_derrotas,
              media_gols_feitos: campeao.media_gols_feitos,
              media_gols_sofridos: campeao.media_gols_sofridos
            }
          : null;

      })
      .filter(d => d !== null);

  }


  function classificarQuadrante(
    x,
    y,
    mediaX,
    mediaY,
    indicadorX,
    indicadorY
  ) {

    const xBom =
      indicadorX.sentido === "maior"
        ? x >= mediaX
        : x <= mediaX;

    const yBom =
      indicadorY.sentido === "maior"
        ? y >= mediaY
        : y <= mediaY;

    if (xBom && yBom) return "melhor";
    if (!xBom && !yBom) return "pior";
    return "neutro";

  }


  function atualizar() {

    const [nomeX, nomeY] =
      combinacaoSelecionada.split(" × ");

    const indicadorX = indicadores.find(d => d.nome === nomeX);
    const indicadorY = indicadores.find(d => d.nome === nomeY);

    const dadosGrafico = [
      ...base2026Participantes(),
      ...baseCampeoesHistoricos()
    ].map(d => ({
      ...d,
      x: d[indicadorX.campo],
      y: d[indicadorY.campo],
      tooltip:
        `${d.label}\n` +
        `${indicadorX.nome}: ${indicadorX.formato(d[indicadorX.campo])}\n` +
        `${indicadorY.nome}: ${indicadorY.formato(d[indicadorY.campo])}`
    }));

    const dadosRotulos = dadosGrafico.filter(d =>
      d.grupo === "Brasil" ||
      d.grupo === "Favoritos 2026"
    );

    const xMin = d3.min(dadosGrafico, d => d.x);
    const xMax = d3.max(dadosGrafico, d => d.x);
    const yMin = d3.min(dadosGrafico, d => d.y);
    const yMax = d3.max(dadosGrafico, d => d.y);

    const mediaX = d3.mean(dadosGrafico, d => d.x);
    const mediaY = d3.mean(dadosGrafico, d => d.y);

    const xFolga = (xMax - xMin) * 0.06;
    const xInicio = Math.max(0, xMin - xFolga);
    const xFim = xMax + xFolga;

    const yInicio =
      Math.max(
        0,
        Math.floor(yMin / 0.4) * 0.4
      );

    const yFim =
      Math.ceil(yMax / 0.4) * 0.4;

    let yTicks = d3.range(
      yInicio,
      yFim + 0.4,
      0.4
    );

    if (indicadorY.campo === "perc_derrotas") {

      const inicioTick =
        Math.ceil(yInicio / 5) * 5;

      yTicks = d3.range(
        inicioTick,
        yFim + 5,
        5
      );

    }

    const quadrantes = [
      {
        x1: xInicio,
        x2: mediaX,
        y1: mediaY,
        y2: yFim,
        classe: classificarQuadrante(
          (xInicio + mediaX) / 2,
          (mediaY + yFim) / 2,
          mediaX,
          mediaY,
          indicadorX,
          indicadorY
        )
      },
      {
        x1: mediaX,
        x2: xFim,
        y1: mediaY,
        y2: yFim,
        classe: classificarQuadrante(
          (mediaX + xFim) / 2,
          (mediaY + yFim) / 2,
          mediaX,
          mediaY,
          indicadorX,
          indicadorY
        )
      },
      {
        x1: xInicio,
        x2: mediaX,
        y1: yInicio,
        y2: mediaY,
        classe: classificarQuadrante(
          (xInicio + mediaX) / 2,
          (yInicio + mediaY) / 2,
          mediaX,
          mediaY,
          indicadorX,
          indicadorY
        )
      },
      {
        x1: mediaX,
        x2: xFim,
        y1: yInicio,
        y2: mediaY,
        classe: classificarQuadrante(
          (mediaX + xFim) / 2,
          (yInicio + mediaY) / 2,
          mediaX,
          mediaY,
          indicadorX,
          indicadorY
        )
      }
    ].filter(d => d.classe !== "neutro");

    const grafico = Plot.plot({

      width: 950,
      height: 560,

      marginTop: 30,
      marginRight: 35,
      marginBottom: 55,
      marginLeft: 70,

      style: {
        fontSize: 13,
        background: "#fafafa",
        color: "#555"
      },

      x: {
        label: indicadorX.nome,
        grid: false,
        domain: [xInicio, xFim]
      },

      y: {
        label: indicadorY.nome,
        grid: false,
        domain: [yInicio, yFim],
        ticks: yTicks
      },

      color: {
        domain: [
          "Seleções 2026",
          "Favoritos 2026",
          "Campeões históricos",
          "Brasil"
        ],
        range: [
          "#B8B8B8",
          "#D4AF37",
          "#E53935",
          "#006400"
        ],
        legend: true
      },

      marks: [

        Plot.rect(quadrantes, {
          x1: "x1",
          x2: "x2",
          y1: "y1",
          y2: "y2",
          fill: d =>
            d.classe === "melhor"
              ? "#2E7D32"
              : "#C62828",
          fillOpacity: 0.11
        }),

        Plot.frame({
          stroke: "#dddddd"
        }),

        Plot.ruleX([mediaX], {
          stroke: "#008FB3",
          strokeWidth: 2,
          strokeDasharray: "6,5"
        }),

        Plot.ruleY([mediaY], {
          stroke: "#008FB3",
          strokeWidth: 2,
          strokeDasharray: "6,5"
        }),

        Plot.dot(dadosGrafico, {
          x: "x",
          y: "y",
          fill: "grupo",
          stroke: "#333",
          strokeWidth: d =>
            d.grupo === "Campeões históricos" ||
            d.grupo === "Brasil" ||
            d.grupo === "Favoritos 2026"
              ? 1.2
              : 0.5,
          r: d =>
            d.grupo === "Campeões históricos" ||
            d.grupo === "Brasil" ||
            d.grupo === "Favoritos 2026"
              ? 6.5
              : 4,
          fillOpacity: d =>
            d.grupo === "Seleções 2026"
              ? 0.5
              : 0.95,
          title: "tooltip"
        }),

        Plot.text(dadosRotulos, {
          x: "x",
          y: "y",
          text: "sigla",
          dx: 7,
          dy: -7,
          fontSize: 9,
          fontWeight: 700,
          fill: "#222"
        })

      ]

    });

    areaGrafico.replaceChildren(grafico);

  }

  atualizar();

}


// ======================================================
// CHAMADA FINAL
// ======================================================

carregarDados();
