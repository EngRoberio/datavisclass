// =========================
// Projeto: A Copa dos Dados
// Seção 2 — DNA dos Campeões
// =========================

async function carregarDados() {
  const dados = await d3.csv("dados/results.csv", d3.autoType);

  const selecoes = dados.flatMap(jogo => {
    const casa = {
      date: jogo.date,
      team: jogo.home_team,
      opponent: jogo.away_team,
      goals_for: jogo.home_score,
      goals_against: jogo.away_score,
      result:
        jogo.home_score > jogo.away_score ? "W" :
        jogo.home_score < jogo.away_score ? "L" : "D"
    };

    const visitante = {
      date: jogo.date,
      team: jogo.away_team,
      opponent: jogo.home_team,
      goals_for: jogo.away_score,
      goals_against: jogo.home_score,
      result:
        jogo.away_score > jogo.home_score ? "W" :
        jogo.away_score < jogo.home_score ? "L" : "D"
    };

    return [casa, visitante];
  });

  const copas = [
    { ano: 1930, campeao: "Uruguay", vice: "Argentina", terceiro: "United States" },
    { ano: 1934, campeao: "Italy", vice: "Czechoslovakia", terceiro: "Germany" },
    { ano: 1938, campeao: "Italy", vice: "Hungary", terceiro: "Brazil" },
    { ano: 1950, campeao: "Uruguay", vice: "Brazil", terceiro: "Sweden" },
    { ano: 1954, campeao: "Germany", vice: "Hungary", terceiro: "Austria" },
    { ano: 1958, campeao: "Brazil", vice: "Sweden", terceiro: "France" },
    { ano: 1962, campeao: "Brazil", vice: "Czechoslovakia", terceiro: "Chile" },
    { ano: 1966, campeao: "England", vice: "Germany", terceiro: "Portugal" },
    { ano: 1970, campeao: "Brazil", vice: "Italy", terceiro: "Germany" },
    { ano: 1974, campeao: "Germany", vice: "Netherlands", terceiro: "Poland" },
    { ano: 1978, campeao: "Argentina", vice: "Netherlands", terceiro: "Brazil" },
    { ano: 1982, campeao: "Italy", vice: "Germany", terceiro: "Poland" },
    { ano: 1986, campeao: "Argentina", vice: "Germany", terceiro: "France" },
    { ano: 1990, campeao: "Germany", vice: "Argentina", terceiro: "Italy" },
    { ano: 1994, campeao: "Brazil", vice: "Italy", terceiro: "Sweden" },
    { ano: 1998, campeao: "France", vice: "Brazil", terceiro: "Croatia" },
    { ano: 2002, campeao: "Brazil", vice: "Germany", terceiro: "Turkey" },
    { ano: 2006, campeao: "Italy", vice: "France", terceiro: "Germany" },
    { ano: 2010, campeao: "Spain", vice: "Netherlands", terceiro: "Germany" },
    { ano: 2014, campeao: "Germany", vice: "Argentina", terceiro: "Netherlands" },
    { ano: 2018, campeao: "France", vice: "Croatia", terceiro: "Belgium" },
    { ano: 2022, campeao: "Argentina", vice: "France", terceiro: "Croatia" }
  ];

  const jogosCopa = dados
    .filter(d => d.tournament === "FIFA World Cup")
    .sort((a, b) => a.date - b.date);

  const porAno = d3.group(jogosCopa, d => d.date.getFullYear());

  const copas_periodos = Array.from(porAno, ([ano, jogos]) => {
    const datas = jogos.map(d => d.date);
    const participantes = Array.from(
      new Set(jogos.flatMap(d => [d.home_team, d.away_team]))
    ).sort();

    return {
      ano,
      inicio: d3.min(datas),
      fim: d3.max(datas),
      participantes
    };
  })
    .sort((a, b) => a.ano - b.ano)
    .map((copa, i, arr) => {
      const anterior = arr[i - 1];

      return {
        ano: copa.ano,
        inicio_copa: copa.inicio,
        fim_copa: copa.fim,
        inicio_analise: anterior
          ? d3.timeDay.offset(anterior.fim, 1)
          : d3.timeYear.offset(copa.inicio, -4),
        fim_analise: d3.timeDay.offset(copa.inicio, -1),
        participantes: copa.participantes
      };
    });

  const pre_campanhas = copas_periodos
    .filter(copa => copa.ano <= 2022)
    .flatMap(copa => {
      const jogosPeriodo = selecoes.filter(d =>
        d.date >= copa.inicio_analise &&
        d.date <= copa.fim_analise &&
        copa.participantes.includes(d.team)
      );

      const porSelecao = d3.group(jogosPeriodo, d => d.team);

      return Array.from(porSelecao, ([team, jogos]) => {
        const total = jogos.length;
        const vitorias = jogos.filter(d => d.result === "W").length;
        const empates = jogos.filter(d => d.result === "D").length;
        const derrotas = jogos.filter(d => d.result === "L").length;
        const gols_feitos = d3.sum(jogos, d => d.goals_for);
        const gols_sofridos = d3.sum(jogos, d => d.goals_against);

        return {
          copa: copa.ano,
          team,
          jogos: total,
          vitorias,
          empates,
          derrotas,
          perc_vitorias: total ? (vitorias / total) * 100 : 0,
          perc_derrotas: total ? (derrotas / total) * 100 : 0,
          media_gols_feitos: total ? gols_feitos / total : 0,
          media_gols_sofridos: total ? gols_sofridos / total : 0
        };
      });
    });

  desenharCategoria1(copas, copas_periodos, pre_campanhas);
  desenharCategoria2(copas, copas_periodos, pre_campanhas, selecoes);
  desenharCategoria3(copas, copas_periodos, pre_campanhas, selecoes);
}

// ======================================================
// SUBSEÇÃO 2.1
// ======================================================

function desenharCategoria1(copas, copas_periodos, pre_campanhas) {
  const painel = document.getElementById("grafico-categoria-1");

  painel.classList.remove("grafico-placeholder");
  painel.innerHTML = "";

  const anos = copas_periodos
    .filter(d => d.ano <= 2022)
    .map(d => d.ano);

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.alignItems = "flex-start";
  container.style.gap = "32px";
  container.style.padding = "20px";
  container.style.border = "1px solid #ddd";
  container.style.borderRadius = "12px";
  container.style.background = "#fafafa";

  const seletorBox = document.createElement("div");
  seletorBox.style.minWidth = "150px";
  seletorBox.style.padding = "12px";
  seletorBox.style.background = "white";
  seletorBox.style.borderRadius = "10px";
  seletorBox.style.border = "1px solid #ddd";

  const tituloFiltro = document.createElement("p");
  tituloFiltro.textContent = "Selecione a Copa:";
  tituloFiltro.style.fontWeight = "700";
  tituloFiltro.style.marginBottom = "10px";

  seletorBox.appendChild(tituloFiltro);

  const areaGraficos = document.createElement("div");
  areaGraficos.style.display = "grid";
  areaGraficos.style.gridTemplateColumns = "1fr 1fr";
  areaGraficos.style.gap = "28px";

  const blocoGraficos = document.createElement("div");

  const titulo = document.createElement("h2");
  titulo.textContent = "Subseção 2.1 — Pré-campanhas das Copas";
  titulo.style.marginTop = "0";

  const subtitulo = document.createElement("p");
  subtitulo.textContent = "Rankings das seleções participantes no ciclo anterior à Copa selecionada.";
  subtitulo.style.marginTop = "-8px";
  subtitulo.style.color = "#555";

  blocoGraficos.appendChild(titulo);
  blocoGraficos.appendChild(subtitulo);
  blocoGraficos.appendChild(areaGraficos);

  container.appendChild(seletorBox);
  container.appendChild(blocoGraficos);
  painel.appendChild(container);

  let anoSelecionado = 2022;

  anos.forEach(ano => {
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.marginBottom = "8px";
    label.style.cursor = "pointer";

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
    label.appendChild(document.createTextNode(` Copa ${ano}`));
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
        } else if (d.team === info.vice) {
          status = "vice";
          medalha = "🥈 ";
        } else if (d.team === info.terceiro) {
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

  function graficoBarras(titulo, dados, campo, formato, ordem = "desc") {
    const ordenados = [...dados]
      .sort((a, b) =>
        ordem === "desc" ? b[campo] - a[campo] : a[campo] - b[campo]
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
        domain: ["campeao", "vice", "terceiro", "demais"],
        range: ["#D4AF37", "#BFC1C2", "#CD7F32", "#8A8A8A"]
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
          sort: { y: "x", reverse: ordem === "desc" }
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

    areaGraficos.replaceChildren(g1, g2, g3, g4);
  }

  atualizar();
}

// ======================================================
// SUBSEÇÃO 2.2
// ======================================================

function desenharCategoria2(copas, copas_periodos, pre_campanhas, selecoes) {
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
  titulo.textContent = "Subseção 2.2 — Posição dos Campeões nos Rankings Pré-Copa";
  titulo.style.marginTop = "0";

  const subtitulo = document.createElement("p");
  subtitulo.textContent = "Histograma das posições históricas dos campeões e comparação com favoritos atuais para 2026.";
  subtitulo.style.color = "#555";
  subtitulo.style.marginTop = "-8px";

  const seletorBox = document.createElement("div");
  seletorBox.style.width = "260px";
  seletorBox.style.padding = "12px";
  seletorBox.style.marginBottom = "18px";
  seletorBox.style.background = "white";
  seletorBox.style.borderRadius = "10px";
  seletorBox.style.border = "1px solid #ddd";

  const areaGrafico = document.createElement("div");

  container.appendChild(titulo);
  container.appendChild(subtitulo);
  container.appendChild(seletorBox);
  container.appendChild(areaGrafico);
  painel.appendChild(container);

  let indicadorSelecionado = "% de vitórias";

  indicadores.forEach(ind => {
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.marginBottom = "8px";
    label.style.cursor = "pointer";

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
    label.appendChild(document.createTextNode(" " + ind.nome));
    seletorBox.appendChild(label);
  });

  function rankingPorIndicador(base, campo, ordem) {
    return [...base]
      .filter(d => d.jogos >= 5)
      .sort((a, b) =>
        ordem === "desc" ? b[campo] - a[campo] : a[campo] - b[campo]
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
        const ranking = rankingPorIndicador(base, indicador.campo, indicador.ordem);
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
      const campeoesNaPosicao = posicoesCampeoes.filter(d => d.posicao === pos);

      return {
        posicao: pos,
        frequencia: campeoesNaPosicao.length,
        tooltip:
          campeoesNaPosicao.length > 0
            ? campeoesNaPosicao.map(d => `${d.campeao} (${d.copa})`).join("\n")
            : "Nenhum campeão histórico nesta posição"
      };
    });

    const yMax = d3.max(frequencias, d => d.frequencia);
    const yFavoritos = yMax + 1.15;

    const faixaFavoritos = [{
      x1: 1,
      x2: maxPosicaoGeral,
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
        tooltip: `${d.team}\nPosição: ${d.posicao}º\n${indicador.nome}: ${valorIndicador}`
      };
    });

    const grafico = Plot.plot({
      width: 1050,
      height: 450,
      marginTop: 105,
      marginRight: 35,
      marginBottom: 75,
      marginLeft: 55,

      style: {
        fontSize: 10
      },

      x: {
        label: "Posição no ranking pré-Copa",
        domain: d3.range(1, maxPosicaoGeral + 1),
        ticks: d3.range(1, maxPosicaoGeral + 1),
        tickFormat: d => d,
        tickRotate: -60
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

        Plot.text([{x: 1, y: yFavoritos + 0.35, texto: "Favoritos"}], {
          x: "x",
          y: "y",
          text: "texto",
          dx: -10,
          textAnchor: "end",
          fontSize: 11,
          fontWeight: 700,
          fill: "#444"
        }),

        Plot.text([{x: 1, y: yFavoritos + 0.05, texto: "2026"}], {
          x: "x",
          y: "y",
          text: "texto",
          dx: -10,
          textAnchor: "end",
          fontSize: 11,
          fontWeight: 700,
          fill: "#444"
        }),

        Plot.barY(frequencias, {
          x: "posicao",
          y: "frequencia",
          fill: "#8A8A8A",
          title: "tooltip"
        }),

        Plot.text(frequencias.filter(d => d.frequencia > 0), {
          x: "posicao",
          y: "frequencia",
          text: d => d.frequencia,
          dy: -7,
          fontSize: 13,
          fontWeight: 700,
          fill: "#222"
        }),

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
// SUBSEÇÃO 2.3
// ======================================================

function desenharCategoria3(copas, copas_periodos, pre_campanhas, selecoes) {
  const painel = document.getElementById("grafico-categoria-3");

  painel.classList.remove("grafico-placeholder");
  painel.innerHTML = "";

  const indicadores = [
    { nome: "% de vitórias", campo: "perc_vitorias", sentido: "maior", formato: d => d.toFixed(1) + "%" },
    { nome: "% de derrotas", campo: "perc_derrotas", sentido: "menor", formato: d => d.toFixed(1) + "%" },
    { nome: "Média de gols feitos", campo: "media_gols_feitos", sentido: "maior", formato: d => d.toFixed(2) },
    { nome: "Média de gols sofridos", campo: "media_gols_sofridos", sentido: "menor", formato: d => d.toFixed(2) }
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
  titulo.textContent = "Subseção 2.3 — Campeões históricos versus seleções de 2026";
  titulo.style.marginTop = "0";

  const subtitulo = document.createElement("p");
  subtitulo.textContent = "Diagrama de dispersão comparando o desempenho pré-Copa dos campeões históricos com as seleções participantes da Copa de 2026.";
  subtitulo.style.color = "#555";
  subtitulo.style.marginTop = "-8px";

  const seletorBox = document.createElement("div");
  seletorBox.style.width = "370px";
  seletorBox.style.padding = "12px";
  seletorBox.style.marginBottom = "18px";
  seletorBox.style.background = "white";
  seletorBox.style.borderRadius = "10px";
  seletorBox.style.border = "1px solid #ddd";

  const areaGrafico = document.createElement("div");

  container.appendChild(titulo);
  container.appendChild(subtitulo);
  container.appendChild(seletorBox);
  container.appendChild(areaGrafico);
  painel.appendChild(container);

  let combinacaoSelecionada = "% de vitórias × Média de gols sofridos";

  combinacoes.forEach(comb => {
    const texto = `${comb[0]} × ${comb[1]}`;

    const label = document.createElement("label");
    label.style.display = "block";
    label.style.marginBottom = "8px";
    label.style.cursor = "pointer";

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
    label.appendChild(document.createTextNode(" " + texto));
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
          d.copa === copa.ano && d.team === copa.campeao
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

  function classificarQuadrante(x, y, mediaX, mediaY, indicadorX, indicadorY) {
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
    const [nomeX, nomeY] = combinacaoSelecionada.split(" × ");

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
        `${d.label}
${indicadorX.nome}: ${indicadorX.formato(d[indicadorX.campo])}
${indicadorY.nome}: ${indicadorY.formato(d[indicadorY.campo])}`
    }));

    const dadosRotulos = dadosGrafico.filter(d =>
      d.grupo === "Brasil" || d.grupo === "Favoritos 2026"
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

    const yInicio = Math.max(0, Math.floor(yMin / 0.4) * 0.4);
    const yFim = Math.ceil(yMax / 0.4) * 0.4;
    const yTicks = d3.range(yInicio, yFim + 0.4, 0.4);

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
        domain: ["Seleções 2026", "Favoritos 2026", "Campeões históricos", "Brasil"],
        range: ["#B8B8B8", "#D4AF37", "#E53935", "#006400"],
        legend: true
      },

      marks: [
        Plot.rect(quadrantes, {
          x1: "x1",
          x2: "x2",
          y1: "y1",
          y2: "y2",
          fill: d => d.classe === "melhor" ? "#2E7D32" : "#C62828",
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
          fillOpacity: d => d.grupo === "Seleções 2026" ? 0.5 : 0.95,
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

carregarDados();
