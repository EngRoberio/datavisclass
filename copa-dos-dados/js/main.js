// =========================
// Projeto: A Copa dos Dados
// Categoria 1 — Pré-campanhas das Copas
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
}

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
  titulo.textContent = "Categoria 1 — Pré-campanhas das Copas";
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

carregarDados();
