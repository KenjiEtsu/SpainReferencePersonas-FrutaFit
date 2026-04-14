const state = {
  personas: [],
  filters: {
    income: "all",
    decision: "all",
    sensitivityMin: 0,
  },
  simulator: {
    priceIndex: 110,
    valueProof: 55,
  },
};

const refs = {
  heroBrief: document.getElementById("heroBrief"),
  heroPersonaCount: document.getElementById("heroPersonaCount"),
  metricsGrid: document.getElementById("metricsGrid"),
  territoryBoard: document.getElementById("territoryBoard"),
  insightGrid: document.getElementById("insightGrid"),
  fitCard: document.getElementById("fitCard"),
  simulatorSegments: document.getElementById("simulatorSegments"),
  scatterPlot: document.getElementById("scatterPlot"),
  decisionStyles: document.getElementById("decisionStyles"),
  personasGrid: document.getElementById("personasGrid"),
  incomeFilter: document.getElementById("incomeFilter"),
  decisionFilter: document.getElementById("decisionFilter"),
  sensitivityFilter: document.getElementById("sensitivityFilter"),
  sensitivityFilterValue: document.getElementById("sensitivityFilterValue"),
  priceIndex: document.getElementById("priceIndex"),
  priceIndexValue: document.getElementById("priceIndexValue"),
  valueProof: document.getElementById("valueProof"),
  valueProofValue: document.getElementById("valueProofValue"),
  appStatus: document.getElementById("appStatus"),
};

const decisionLabels = {
  price_first: "Precio primero",
  brand_sensitive: "Marca y aspiracion",
  convenience_first: "Compra rapida y comoda",
  sustainability_first: "Sostenibilidad",
  local_loyalty: "Producto local",
  quality_balanced: "Calidad equilibrada",
};

const decisionMessages = {
  price_first: "Precio visible, promociones claras y sin sorpresas al pagar.",
  brand_sensitive: "Imagen cuidada, surtido aspiracional y experiencia pulida.",
  convenience_first: "Rapidez, cercania y compra resuelta en pocos minutos.",
  sustainability_first: "Origen, frescura y credenciales sostenibles muy claras.",
  local_loyalty: "Proximidad, trato cercano y producto del entorno.",
  quality_balanced: "Senales de calidad claras sin parecer excesivamente premium.",
};

const incomeLabels = {
  Low: "Bajo",
  "Middle-Low": "Medio-bajo",
  Middle: "Medio",
  "Middle-High": "Medio-alto",
  High: "Alto",
};

const digitalLabels = {
  heavy: "Digital alto",
  regular: "Digital medio",
  light: "Digital bajo",
};

const environmentLabels = {
  Urban: "Urbano",
  Rural: "Rural",
  Suburban: "Suburbano",
};

const styleColors = {
  price_first: "#d86f31",
  brand_sensitive: "#6f8f6b",
  convenience_first: "#ec9e39",
  sustainability_first: "#2f7f69",
  local_loyalty: "#8f6c42",
  quality_balanced: "#495e97",
};

async function init() {
  bindEvents();

  try {
    const response = await fetch("./persons.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.personas = (payload.personas || []).map(normalizePersona);
    populateFilters();
    renderAll();
    setStatus(`Dataset cargado: ${state.personas.length} personas listas para explorar.`, true);
  } catch (error) {
    console.error(error);
    setStatus(
      "No se pudo cargar persons.json. Sirve la carpeta con un servidor estatico o publicala en GitHub Pages.",
      false
    );
  }
}

function bindEvents() {
  refs.incomeFilter.addEventListener("change", (event) => {
    state.filters.income = event.target.value;
    renderPersonas();
  });

  refs.decisionFilter.addEventListener("change", (event) => {
    state.filters.decision = event.target.value;
    renderPersonas();
  });

  refs.sensitivityFilter.addEventListener("input", (event) => {
    state.filters.sensitivityMin = Number(event.target.value) / 100;
    refs.sensitivityFilterValue.textContent = formatPercent(state.filters.sensitivityMin);
    renderPersonas();
  });

  refs.priceIndex.addEventListener("input", (event) => {
    state.simulator.priceIndex = Number(event.target.value);
    refs.priceIndexValue.textContent = `${state.simulator.priceIndex}%`;
    renderSimulator();
  });

  refs.valueProof.addEventListener("input", (event) => {
    state.simulator.valueProof = Number(event.target.value);
    refs.valueProofValue.textContent = `${state.simulator.valueProof}/100`;
    renderSimulator();
  });
}

function normalizePersona(persona) {
  return {
    ...persona,
    environment: persona.environment === "Uban" ? "Urban" : persona.environment,
    shortLabel: persona.label.split(" ").slice(0, 2).join(" "),
  };
}

function populateFilters() {
  setSelectOptions(refs.incomeFilter, ["all", ...uniqueValues(state.personas, "incomeLevel")], (value) =>
    value === "all" ? "Todos los ingresos" : incomeLabels[value] || value
  );

  setSelectOptions(refs.decisionFilter, ["all", ...uniqueValues(state.personas, "decisionStyle")], (value) =>
    value === "all" ? "Todos los criterios" : decisionLabels[value] || value
  );
}

function setSelectOptions(select, values, labelResolver) {
  select.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labelResolver(value);
    select.append(option);
  });
}

function renderAll() {
  renderHero();
  renderMetrics();
  renderTerritories();
  renderInsights();
  renderSimulator();
  renderScatter();
  renderDecisionStyles();
  renderPersonas();
}

function renderHero() {
  const total = state.personas.length;
  const highSensitivity = state.personas.filter((persona) => persona.priceSensitivity >= 0.7).length;
  const urban = state.personas.filter((persona) => persona.environment === "Urban").length;
  const premium = state.personas.filter((persona) => persona.priceSensitivity < 0.45).length;

  refs.heroPersonaCount.textContent = total;
  refs.heroBrief.innerHTML = [
    {
      term: "Friccion clara",
      detail: `${highSensitivity} perfiles ya llegan con una tension fuerte respecto al precio.`,
    },
    {
      term: "Peso urbano",
      detail: `${urban} perfiles viven en entornos urbanos, donde la comparacion es constante.`,
    },
    {
      term: "Margen premium",
      detail: `Solo ${premium} perfiles parecen admitir una prima clara sin demasiada resistencia.`,
    },
  ]
    .map(
      (item) => `
        <div class="brief-item">
          <dt>${item.term}</dt>
          <dd>${item.detail}</dd>
        </div>
      `
    )
    .join("");
}

function renderMetrics() {
  const personas = state.personas;
  const metrics = [
    {
      label: "Sensibilidad media",
      value: formatPercent(mean(personas, "priceSensitivity")),
      note: "Si subes el precio medio, la justificacion tiene que verse rapido.",
    },
    {
      label: "Confianza inicial baja",
      value: formatPercent(personas.filter((persona) => persona.trustLevel < 0.5).length / personas.length),
      note: "Conviene enseñar calidad, origen y logica de precio desde la primera visita.",
    },
    {
      label: "Entrada prudente",
      value: `${personas.filter((persona) => persona.priceSensitivity >= 0.7).length}/${personas.length}`,
      note: "Buena señal para empezar con una oferta clara y un precio medio controlado.",
    },
    {
      label: "Criterio dominante",
      value: decisionLabels[topKey(personas, "decisionStyle")] || topKey(personas, "decisionStyle"),
      note: "Es la forma de decidir que mas se repite al comprar.",
    },
  ];

  refs.metricsGrid.innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric">
          <span>${metric.label}</span>
          <strong>${metric.value}</strong>
          <p>${metric.note}</p>
        </article>
      `
    )
    .join("");
}

function renderTerritories() {
  const environments = ["Urban", "Suburban", "Rural"]
    .map((environment) => buildEnvironmentReading(environment))
    .sort((a, b) => b.openingScore - a.openingScore);

  refs.territoryBoard.innerHTML = environments
    .map(
      (entry, index) => `
        <article class="territory ${index === 0 ? "territory-featured" : ""}">
          <div class="territory-rank">0${index + 1}</div>
          <div class="territory-body">
            <div class="territory-head">
              <p>${entry.title}</p>
              <strong>${entry.recommendation}</strong>
            </div>
            <p class="territory-copy">${entry.copy}</p>
            <div class="territory-meta">
              <span>${entry.personaCount} perfiles</span>
              <span>Sensibilidad media ${formatPercent(entry.avgSensitivity)}</span>
              <span>${entry.message}</span>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function buildEnvironmentReading(environment) {
  const personas = state.personas.filter((persona) => persona.environment === environment);
  const avgSensitivity = mean(personas, "priceSensitivity");
  const avgSecurity = mean(personas, "economicSecurity");
  const openingScore = clamp(0.62 - avgSensitivity * 0.52 + avgSecurity * 0.38, 0, 1);

  let recommendation = "Entrada prudente";
  let copy = "Buena zona para probar un surtido claro, precios visibles y una propuesta sencilla.";
  let message = "Prioriza claridad de precio y compra recurrente.";

  if (openingScore > 0.58) {
    recommendation = "Zona mas defendible";
    copy = "Aqui parece mas realista abrir primero si tu propuesta mezcla frescura, conveniencia y una prima moderada.";
    message = "Puedes empujar algo mas la calidad sin parecer fuera de mercado.";
  } else if (openingScore < 0.47) {
    recommendation = "Abrir con cautela";
    copy = "La sensibilidad al precio pesa demasiado. Si entras aqui, necesitaras una propuesta muy nitida y poco aspiracional al principio.";
    message = "Evita sobredisenar el concepto si el precio no acompana.";
  }

  return {
    title: `${environmentLabels[environment] || environment}`,
    recommendation,
    copy,
    message,
    avgSensitivity,
    openingScore,
    personaCount: personas.length,
  };
}

function renderInsights() {
  const priceFirst = state.personas.filter((persona) => persona.decisionStyle === "price_first");
  const values = state.personas.filter((persona) =>
    ["sustainability_first", "local_loyalty"].includes(persona.decisionStyle)
  );
  const premium = state.personas.filter((persona) => persona.priceSensitivity < 0.45);

  const insights = [
    {
      index: "01",
      title: "Abrir en premium desde el principio seria arriesgado",
      copy: `Los perfiles mas sensibles al precio siguen pesando mucho. El grupo "precio primero" se mueve en ${formatPercent(
        mean(priceFirst, "priceSensitivity")
      )} de sensibilidad media.`,
    },
    {
      index: "02",
      title: "Lo local y lo sostenible ayudan, pero no sustituyen el precio",
      copy: `Los perfiles guiados por valores siguen mostrando ${formatPercent(
        mean(values, "priceSensitivity")
      )} de sensibilidad. Tu relato necesita apoyo economico, no solo emocional.`,
    },
    {
      index: "03",
      title: "Hay margen para una tienda mas aspiracional, pero es pequeno",
      copy: `${premium.length} perfiles admiten una prima mas clara. Conviene verlo como una capa extra de margen, no como la estrategia base.`,
    },
  ];

  refs.insightGrid.innerHTML = insights
    .map(
      (item) => `
        <article class="insight-line">
          <span>${item.index}</span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.copy}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderSimulator() {
  const scored = state.personas.map((persona) => ({
    ...persona,
    fitScore: simulateFit(persona, state.simulator.priceIndex, state.simulator.valueProof),
  }));

  const averageFit = mean(scored, "fitScore");
  const highRisk = scored.filter((persona) => persona.fitScore < 0.45);
  const strongFit = scored.filter((persona) => persona.fitScore >= 0.65);
  const hardest = [...scored].sort((a, b) => a.fitScore - b.fitScore)[0];
  const tone = getFitTone(averageFit);

  refs.fitCard.innerHTML = `
    <div class="fit-header">
      <p class="eyebrow">Lectura del escenario</p>
      <strong class="fit-score" data-tone="${tone.tone}">${formatPercent(averageFit)}</strong>
    </div>
    <h3>${tone.title}</h3>
    <p class="fit-copy">${tone.copy}</p>
    <div class="fit-detail-grid">
      <div>
        <span>Perfiles en riesgo</span>
        <strong>${highRisk.length}/${scored.length}</strong>
      </div>
      <div>
        <span>Buen encaje</span>
        <strong>${strongFit.length}/${scored.length}</strong>
      </div>
      <div>
        <span>Mayor resistencia</span>
        <strong>${hardest ? hardest.shortLabel : "--"}</strong>
      </div>
    </div>
  `;

  const segments = [
    {
      title: "Compra muy sensible al precio",
      personas: scored.filter((persona) => persona.decisionStyle === "price_first"),
      advice: "Trabaja una oferta visible, una compra clara y evita senales de lujo innecesarias.",
    },
    {
      title: "Compra por valores o proximidad",
      personas: scored.filter((persona) =>
        ["sustainability_first", "local_loyalty"].includes(persona.decisionStyle)
      ),
      advice: "El origen ayuda, pero solo si la diferencia de precio parece razonable.",
    },
    {
      title: "Compra por calidad o comodidad",
      personas: scored.filter((persona) =>
        ["quality_balanced", "convenience_first", "brand_sensitive"].includes(persona.decisionStyle)
      ),
      advice: "Aqui puedes defender algo mas de margen si la experiencia de compra se entiende rapido.",
    },
  ];

  refs.simulatorSegments.innerHTML = segments
    .map((segment) => {
      const score = mean(segment.personas, "fitScore");
      const segmentTone = getFitTone(score);
      return `
        <article class="segment">
          <p>${segment.title}</p>
          <strong data-tone="${segmentTone.tone}">${formatPercent(score)}</strong>
          <span>${segmentTone.title}</span>
          <p class="segment-copy">${segment.advice}</p>
        </article>
      `;
    })
    .join("");
}

function renderScatter() {
  refs.scatterPlot.innerHTML = state.personas
    .map((persona) => {
      const left = persona.priceSensitivity * 100;
      const bottom = persona.economicSecurity * 100;
      const size = 12 + persona.brandLoyalty * 13;
      const color = styleColors[persona.decisionStyle] || "#1f1d1a";

      return `
        <button
          class="plot-point"
          style="left: ${left}%; bottom: ${bottom}%; width: ${size}px; height: ${size}px; background: ${color};"
          title="${escapeHtml(
            `${persona.label} | ${decisionLabels[persona.decisionStyle] || persona.decisionStyle} | precio ${formatPercent(
              persona.priceSensitivity
            )}`
          )}"
          data-short="${escapeHtml(persona.shortLabel)}"
          aria-label="${escapeHtml(persona.label)}"
        ></button>
      `;
    })
    .join("");
}

function renderDecisionStyles() {
  const grouped = Object.entries(groupByCount(state.personas, "decisionStyle"))
    .map(([decision, count]) => ({
      decision,
      count,
      averageSensitivity: mean(
        state.personas.filter((persona) => persona.decisionStyle === decision),
        "priceSensitivity"
      ),
    }))
    .sort((a, b) => b.count - a.count);

  refs.decisionStyles.innerHTML = grouped
    .map(
      (item) => `
        <div class="legend-item">
          <span class="legend-dot" style="background: ${styleColors[item.decision] || "#1f1d1a"};"></span>
          <div>
            <strong>${decisionLabels[item.decision] || item.decision}</strong>
            <small>${item.count} perfiles · sensibilidad ${formatPercent(item.averageSensitivity)}</small>
          </div>
        </div>
      `
    )
    .join("");
}

function renderPersonas() {
  const filtered = state.personas
    .filter((persona) => state.filters.income === "all" || persona.incomeLevel === state.filters.income)
    .filter((persona) => state.filters.decision === "all" || persona.decisionStyle === state.filters.decision)
    .filter((persona) => persona.priceSensitivity >= state.filters.sensitivityMin)
    .sort((a, b) => b.priceSensitivity - a.priceSensitivity);

  if (!filtered.length) {
    refs.personasGrid.innerHTML = `
      <div class="empty-state">
        No hay perfiles con estos filtros. Baja el umbral o abre mas criterios.
      </div>
    `;
    return;
  }

  refs.personasGrid.innerHTML = filtered
    .map(
      (persona) => `
        <article class="persona">
          <div class="persona-top">
            <div>
              <p class="persona-eyebrow">${environmentLabels[persona.environment] || persona.environment}</p>
              <h3>${persona.label}</h3>
            </div>
            <span class="persona-age">${persona.ageGroup}</span>
          </div>

          <p class="persona-summary">${buildPersonaSummary(persona)}</p>

          <div class="persona-tags">
            <span>${incomeLabels[persona.incomeLevel] || persona.incomeLevel}</span>
            <span>${decisionLabels[persona.decisionStyle] || persona.decisionStyle}</span>
            <span>${digitalLabels[persona.digitalLevel] || persona.digitalLevel}</span>
          </div>

          <div class="persona-advice">
            <div>
              <strong>Que le tienes que demostrar</strong>
              <p>${buildPersonaProof(persona)}</p>
            </div>
            <div>
              <strong>Como venderle la tienda</strong>
              <p>${decisionMessages[persona.decisionStyle] || "Explica el valor de forma directa y concreta."}</p>
            </div>
          </div>

          <div class="bar-group">
            ${renderBar("Sensibilidad al precio", persona.priceSensitivity, "#d86f31")}
            ${renderBar("Confianza", persona.trustLevel, "#2f7f69")}
            ${renderBar("Seguridad economica", persona.economicSecurity, "#6f8f6b")}
            ${renderBar("Valor sostenible", persona.sustainability, "#ec9e39")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderBar(label, value, color) {
  return `
    <div class="bar-row">
      <span class="bar-label">${label}</span>
      <div class="bar-track">
        <span class="bar-fill" style="width: ${value * 100}%; background: ${color};"></span>
      </div>
      <span class="bar-value">${formatPercent(value)}</span>
    </div>
  `;
}

function simulateFit(persona, priceIndex, valueProof) {
  const premiumDelta = Math.max(0, priceIndex - 100) / 100;
  const discountDelta = Math.max(0, 100 - priceIndex) / 100;
  const proof = valueProof / 100;

  let score = 0.58;
  score += (persona.economicSecurity - 0.5) * 0.22;
  score += (persona.trustLevel - 0.5) * 0.18;
  score += (persona.brandLoyalty - 0.5) * 0.1;
  score += (proof - 0.5) * getProofWeight(persona);
  score -= premiumDelta * (0.52 + persona.priceSensitivity * 0.78);
  score += discountDelta * (0.18 + persona.priceSensitivity * 0.26);

  if (persona.decisionStyle === "price_first") {
    score -= premiumDelta * 0.26;
  }

  if (persona.decisionStyle === "sustainability_first") {
    score += proof * persona.sustainability * 0.11;
  }

  if (persona.decisionStyle === "local_loyalty") {
    score += proof * persona.localPreference * 0.08;
  }

  if (persona.decisionStyle === "brand_sensitive") {
    score += proof * persona.brandLoyalty * 0.1;
  }

  return clamp(score, 0.06, 0.94);
}

function getProofWeight(persona) {
  const weights = {
    price_first: 0.08,
    brand_sensitive: 0.21,
    convenience_first: 0.19,
    sustainability_first: 0.18,
    local_loyalty: 0.14,
    quality_balanced: 0.2,
  };

  return weights[persona.decisionStyle] || 0.16;
}

function getFitTone(score) {
  if (score < 0.4) {
    return {
      tone: "fragil",
      title: "Escenario fragil",
      copy: "Con este precio medio, una parte importante de la muestra sentiria la tienda demasiado cara o poco clara.",
    };
  }

  if (score < 0.55) {
    return {
      tone: "tenso",
      title: "Escenario tenso",
      copy: "La propuesta puede funcionar, pero solo si el valor se explica muy bien y el surtido evita ambiguedad.",
    };
  }

  if (score < 0.7) {
    return {
      tone: "viable",
      title: "Escenario viable",
      copy: "Hay margen para defender el precio si la promesa de frescura, origen y comodidad es visible desde fuera.",
    };
  }

  return {
    tone: "solido",
    title: "Escenario solido",
    copy: "La muestra parece tolerar bien el precio propuesto y la narrativa comercial acompana.",
  };
}

function buildPersonaSummary(persona) {
  const sensitivityText =
    persona.priceSensitivity >= 0.7
      ? "Va a notar cualquier sobreprecio muy rapido."
      : persona.priceSensitivity >= 0.5
        ? "Compara y necesita sentir equilibrio entre calidad y precio."
        : "Puede aceptar una propuesta mas premium si la experiencia convence.";

  return `${incomeLabels[persona.incomeLevel] || persona.incomeLevel}, ${environmentLabels[persona.environment] || persona.environment}, ${
    digitalLabels[persona.digitalLevel] || persona.digitalLevel
  }. ${sensitivityText}`;
}

function buildPersonaProof(persona) {
  if (persona.decisionStyle === "price_first") {
    return "Que la compra basica tiene logica, que el precio se entiende y que no estas cobrando por estetica.";
  }

  if (persona.decisionStyle === "sustainability_first") {
    return "Que el origen, la frescura y la sostenibilidad son reales y visibles, no solo una promesa.";
  }

  if (persona.decisionStyle === "local_loyalty") {
    return "Que la tienda pertenece al barrio o al entorno y que el producto local tiene presencia de verdad.";
  }

  if (persona.decisionStyle === "convenience_first") {
    return "Que puede resolver la compra diaria rapido, con buena presentacion y sin perder tiempo.";
  }

  if (persona.decisionStyle === "brand_sensitive") {
    return "Que la tienda se siente cuidada, fiable y un poco mejor que la media sin parecer artificial.";
  }

  return "Que pagara un poco mas por una calidad que realmente nota al entrar y al comprar.";
}

function groupByCount(items, field) {
  return items.reduce((accumulator, item) => {
    accumulator[item[field]] = (accumulator[item[field]] || 0) + 1;
    return accumulator;
  }, {});
}

function uniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]))];
}

function topKey(items, field) {
  return Object.entries(groupByCount(items, field)).sort((a, b) => b[1] - a[1])[0][0];
}

function mean(items, field) {
  if (!items.length) {
    return 0;
  }

  return items.reduce((sum, item) => sum + Number(item[field] || 0), 0) / items.length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatPercent(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

function setStatus(message, isOk) {
  refs.appStatus.textContent = message;
  refs.appStatus.className = isOk ? "status-ok" : "status-error";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

init();
