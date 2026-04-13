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
  heroPersonaCount: document.getElementById("heroPersonaCount"),
  heroSignals: document.getElementById("heroSignals"),
  metricsGrid: document.getElementById("metricsGrid"),
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
  brand_sensitive: "Marca y estatus",
  convenience_first: "Conveniencia",
  sustainability_first: "Sostenibilidad",
  local_loyalty: "Preferencia local",
  quality_balanced: "Calidad equilibrada",
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
  price_first: "#cd5c2b",
  brand_sensitive: "#b44d64",
  convenience_first: "#c69324",
  sustainability_first: "#0b7d77",
  local_loyalty: "#738552",
  quality_balanced: "#5b6cb2",
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
      "No se pudo cargar persons.json. En GitHub Pages funcionara al servirse desde el mismo directorio.",
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
  const environment = persona.environment === "Uban" ? "Urban" : persona.environment;

  return {
    ...persona,
    environment,
    shortLabel: persona.label.split(" ").slice(0, 2).join(" "),
  };
}

function populateFilters() {
  setSelectOptions(refs.incomeFilter, ["all", ...uniqueValues(state.personas, "incomeLevel")], (value) =>
    value === "all" ? "Todos los ingresos" : incomeLabels[value] || value
  );

  setSelectOptions(
    refs.decisionFilter,
    ["all", ...uniqueValues(state.personas, "decisionStyle")],
    (value) => (value === "all" ? "Todas las decisiones" : decisionLabels[value] || value)
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
  renderInsights();
  renderSimulator();
  renderScatter();
  renderDecisionStyles();
  renderPersonas();
}

function renderHero() {
  const total = state.personas.length;
  const highSensitivity = state.personas.filter((persona) => persona.priceSensitivity >= 0.7).length;
  const lowTrust = state.personas.filter((persona) => persona.trustLevel < 0.5).length;
  const premiumReady = state.personas.filter((persona) => persona.priceSensitivity < 0.45).length;

  refs.heroPersonaCount.textContent = total;

  const signals = [
    `${highSensitivity} de ${total} perfiles muestran sensibilidad alta al precio.`,
    `${lowTrust} de ${total} parten de una confianza baja o fragil.`,
    `${premiumReady} perfiles parecen admitir una propuesta mas premium si el valor se entiende bien.`,
  ];

  refs.heroSignals.innerHTML = "";
  signals.forEach((signal) => {
    const item = document.createElement("li");
    item.textContent = signal;
    refs.heroSignals.append(item);
  });
}

function renderMetrics() {
  const personas = state.personas;
  const averageSensitivity = mean(personas, "priceSensitivity");
  const highSensitivityShare = personas.filter((persona) => persona.priceSensitivity >= 0.7).length / personas.length;
  const lowTrustShare = personas.filter((persona) => persona.trustLevel < 0.5).length / personas.length;
  const valueDrivenAverage = mean(
    personas.filter((persona) => ["sustainability_first", "local_loyalty"].includes(persona.decisionStyle)),
    "priceSensitivity"
  );
  const topDecision = Object.entries(groupByCount(personas, "decisionStyle")).sort((a, b) => b[1] - a[1])[0];

  const metrics = [
    {
      title: "Sensibilidad media",
      value: formatPercent(averageSensitivity),
      note: "Una media alta indica que el precio sera parte central de la decision.",
    },
    {
      title: "Mercado tensionado",
      value: formatPercent(highSensitivityShare),
      note: "Cuota de personas con sensibilidad alta al precio.",
    },
    {
      title: "Confianza fragil",
      value: formatPercent(lowTrustShare),
      note: "Si tu precio sube, la transparencia y las pruebas importan aun mas.",
    },
    {
      title: "Decision dominante",
      value: decisionLabels[topDecision[0]] || topDecision[0],
      note: `Los segmentos guiados por este criterio son ${topDecision[1]} de ${personas.length}.`,
    },
    {
      title: "Valores con friccion",
      value: formatPercent(valueDrivenAverage),
      note: "Ni sostenibilidad ni proximidad borran por si solas la tension de precio.",
    },
    {
      title: "Segmento premium",
      value: `${personas.filter((persona) => persona.priceSensitivity < 0.45).length}/${personas.length}`,
      note: "Personas que podrian tolerar una prima si el valor esta muy bien argumentado.",
    },
    {
      title: "Digital dominante",
      value: topDigitalLabel(personas),
      note: "Sirve para calibrar formato de prueba social, comparativas y detalle de oferta.",
    },
    {
      title: "Edad dominante",
      value: topAgeGroup(personas),
      note: "La muestra esta sesgada hacia etapas vitales donde comparar sigue siendo habitual.",
    },
  ];

  refs.metricsGrid.innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric-card">
          <span class="metric-title">${metric.title}</span>
          <strong class="metric-value">${metric.value}</strong>
          <p class="metric-note">${metric.note}</p>
        </article>
      `
    )
    .join("");
}

function renderInsights() {
  const personas = state.personas;
  const priceFirst = personas.filter((persona) => persona.decisionStyle === "price_first");
  const valueDriven = personas.filter((persona) =>
    ["sustainability_first", "local_loyalty"].includes(persona.decisionStyle)
  );
  const premium = personas.filter((persona) => persona.priceSensitivity < 0.45);

  const cards = [
    {
      tag: "Lectura 01",
      title: "Subir precio sin narrativa sera duro",
      copy: `${priceFirst.length} perfiles deciden primero por precio y su sensibilidad media sube hasta ${formatPercent(
        mean(priceFirst, "priceSensitivity")
      )}. Si vas por encima de mercado, necesitas justificar muy bien el salto.`,
    },
    {
      tag: "Lectura 02",
      title: "Los valores ayudan, pero no salvan",
      copy: `Los perfiles movidos por sostenibilidad o cercania local siguen mostrando ${formatPercent(
        mean(valueDriven, "priceSensitivity")
      )} de sensibilidad media. El valor etico necesita ir acompanado de claridad economica.`,
    },
    {
      tag: "Lectura 03",
      title: "Hay hueco premium, pero es minoritario",
      copy: `${premium.length} de ${personas.length} personas parecen tener margen para aceptar una prima. Son utiles para capturar ticket alto, no para definir por si solas la estrategia base.`,
    },
  ];

  refs.insightGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="insight-card">
          <span class="tag">${card.tag}</span>
          <h3>${card.title}</h3>
          <p class="insight-copy">${card.copy}</p>
        </article>
      `
    )
    .join("");
}

function renderSimulator() {
  const personas = state.personas;
  const scores = personas.map((persona) =>
    Object.assign({}, persona, {
      fitScore: simulateFit(persona, state.simulator.priceIndex, state.simulator.valueProof),
    })
  );

  const averageFit = scores.reduce((sum, persona) => sum + persona.fitScore, 0) / scores.length;
  const resistant = scores.filter((persona) => persona.fitScore < 0.45);
  const aligned = scores.filter((persona) => persona.fitScore >= 0.65);
  const resistantTop = [...scores].sort((a, b) => a.fitScore - b.fitScore).slice(0, 3);
  const fitTone = getFitTone(averageFit);

  refs.fitCard.innerHTML = `
    <div class="fit-topline">
      <div>
        <p class="section-kicker">Encaje agregado</p>
        <h3>${fitTone.title}</h3>
      </div>
      <div class="fit-score" data-tone="${fitTone.tone}">${formatPercent(averageFit)}</div>
    </div>
    <p class="fit-copy">${fitTone.copy}</p>
    <div class="micro-grid">
      <div class="micro-card">
        <span class="micro-label">Riesgo alto</span>
        <strong class="micro-value">${resistant.length}/${scores.length}</strong>
      </div>
      <div class="micro-card">
        <span class="micro-label">Buen encaje</span>
        <strong class="micro-value">${aligned.length}/${scores.length}</strong>
      </div>
      <div class="micro-card">
        <span class="micro-label">Mas resistencia</span>
        <strong class="micro-value">${resistantTop[0] ? resistantTop[0].shortLabel : "--"}</strong>
      </div>
    </div>
  `;

  const segmentDefinitions = [
    {
      label: "Segmento precio primero",
      description: "Quien tiende a comparar y castiga cualquier prima poco explicada.",
      personas: personas.filter((persona) => persona.decisionStyle === "price_first"),
    },
    {
      label: "Segmento guiado por valores",
      description: "Aprecia sostenibilidad o cercania, pero aun necesita sentir equilibrio economico.",
      personas: personas.filter((persona) =>
        ["sustainability_first", "local_loyalty"].includes(persona.decisionStyle)
      ),
    },
    {
      label: "Segmento valor y conveniencia",
      description: "Tolera mejor el precio si el beneficio se percibe rapido y claro.",
      personas: personas.filter(
        (persona) => !["price_first", "sustainability_first", "local_loyalty"].includes(persona.decisionStyle)
      ),
    },
  ];

  refs.simulatorSegments.innerHTML = segmentDefinitions
    .map((segment) => {
      const segmentScore = mean(
        segment.personas.map((persona) => ({
          fitScore: simulateFit(persona, state.simulator.priceIndex, state.simulator.valueProof),
        })),
        "fitScore"
      );
      const tone = getFitTone(segmentScore);

      return `
        <article class="segment-card">
          <span class="tag">${segment.label}</span>
          <div class="segment-score" data-tone="${tone.tone}">${formatPercent(segmentScore)}</div>
          <span class="segment-tone">${tone.title}</span>
          <p class="insight-copy">${segment.description}</p>
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
      const size = 12 + persona.brandLoyalty * 12;
      const color = styleColors[persona.decisionStyle] || "#1f1d1a";

      return `
        <button
          class="plot-point"
          style="left: ${left}%; bottom: ${bottom}%; width: ${size}px; height: ${size}px; background: ${color};"
          data-short="${escapeHtml(persona.shortLabel)}"
          title="${escapeHtml(
            `${persona.label} | ${decisionLabels[persona.decisionStyle] || persona.decisionStyle} | sensibilidad ${formatPercent(
              persona.priceSensitivity
            )}`
          )}"
          aria-label="${escapeHtml(persona.label)}"
        ></button>
      `;
    })
    .join("");
}

function renderDecisionStyles() {
  const grouped = Object.entries(groupByCount(state.personas, "decisionStyle"))
    .map(([decision, count]) => {
      const personas = state.personas.filter((persona) => persona.decisionStyle === decision);
      return {
        decision,
        count,
        averageSensitivity: mean(personas, "priceSensitivity"),
      };
    })
    .sort((a, b) => b.count - a.count);

  refs.decisionStyles.innerHTML = grouped
    .map((item) => {
      const color = styleColors[item.decision] || "#1f1d1a";
      return `
        <article class="style-item">
          <div class="style-head">
            <h3>${decisionLabels[item.decision] || item.decision}</h3>
            <span class="style-count">${item.count} perfiles</span>
          </div>
          <p class="style-meta">Sensibilidad media al precio: ${formatPercent(item.averageSensitivity)}</p>
          <div class="style-bar">
            <span style="width: ${item.averageSensitivity * 100}%; background: ${color};"></span>
          </div>
        </article>
      `;
    })
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
        No hay personas que cumplan estos filtros. Baja el umbral o abre mas segmentos.
      </div>
    `;
    return;
  }

  refs.personasGrid.innerHTML = filtered
    .map(
      (persona) => `
        <article class="persona-card">
          <div class="persona-header">
            <div>
              <h3>${persona.label}</h3>
              <div class="persona-meta">
                <span class="persona-tag">${incomeLabels[persona.incomeLevel] || persona.incomeLevel}</span>
                <span class="persona-tag">${decisionLabels[persona.decisionStyle] || persona.decisionStyle}</span>
                <span class="persona-tag">${environmentLabels[persona.environment] || persona.environment}</span>
              </div>
            </div>
            <span class="persona-tag">${persona.ageGroup}</span>
          </div>

          <p class="persona-summary">${buildPersonaSummary(persona)}</p>

          <div class="persona-tag-row">
            <span class="persona-tag">${digitalLabels[persona.digitalLevel] || persona.digitalLevel}</span>
            <span class="persona-tag">${persona.education}</span>
            <span class="persona-tag">${persona.household.replaceAll("_", " ")}</span>
          </div>

          <div class="bar-group">
            ${renderBar("Sensibilidad precio", persona.priceSensitivity, "--bar-color: #cd5c2b;")}
            ${renderBar("Confianza", persona.trustLevel, "--bar-color: #0b7d77;")}
            ${renderBar("Seguridad economica", persona.economicSecurity, "--bar-color: #738552;")}
            ${renderBar("Sostenibilidad", persona.sustainability, "--bar-color: #c69324;")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderBar(label, value, inlineStyle) {
  return `
    <div class="bar-row">
      <span class="bar-label">${label}</span>
      <div class="bar-track">
        <span class="bar-fill" style="${inlineStyle} width: ${value * 100}%; background: var(--bar-color);"></span>
      </div>
      <span class="bar-value">${formatPercent(value)}</span>
    </div>
  `;
}

function simulateFit(persona, priceIndex, valueProof) {
  const premiumDelta = Math.max(0, priceIndex - 100) / 100;
  const discountDelta = Math.max(0, 100 - priceIndex) / 100;
  const proof = valueProof / 100;

  let score = 0.57;
  score += (persona.economicSecurity - 0.5) * 0.22;
  score += (persona.trustLevel - 0.5) * 0.2;
  score += (persona.brandLoyalty - 0.5) * 0.12;
  score += (proof - 0.5) * getProofWeight(persona);
  score -= premiumDelta * (0.5 + persona.priceSensitivity * 0.8);
  score += discountDelta * (0.18 + persona.priceSensitivity * 0.24);

  if (persona.decisionStyle === "price_first") {
    score -= premiumDelta * 0.28;
  }

  if (persona.decisionStyle === "sustainability_first") {
    score += proof * persona.sustainability * 0.1;
  }

  if (persona.decisionStyle === "local_loyalty") {
    score += proof * persona.localPreference * 0.08;
  }

  if (persona.decisionStyle === "brand_sensitive") {
    score += proof * persona.brandLoyalty * 0.12;
  }

  return clamp(score, 0.06, 0.94);
}

function getProofWeight(persona) {
  const weights = {
    price_first: 0.1,
    brand_sensitive: 0.22,
    convenience_first: 0.2,
    sustainability_first: 0.18,
    local_loyalty: 0.15,
    quality_balanced: 0.2,
  };

  return weights[persona.decisionStyle] || 0.16;
}

function getFitTone(score) {
  if (score < 0.4) {
    return {
      tone: "fragil",
      title: "Encaje fragil",
      copy: "El precio propuesto generaria rechazo en buena parte de la muestra. Necesitas bajar friccion o reforzar mucho mas el valor.",
    };
  }

  if (score < 0.55) {
    return {
      tone: "tenso",
      title: "Encaje tenso",
      copy: "El escenario es defendible, pero varios perfiles seguiran viendo la oferta como cara o arriesgada.",
    };
  }

  if (score < 0.7) {
    return {
      tone: "viable",
      title: "Encaje viable",
      copy: "Hay margen para sostener el precio siempre que la explicacion de valor sea consistente y visible.",
    };
  }

  return {
    tone: "solido",
    title: "Encaje solido",
    copy: "La combinacion de precio y narrativa parece alinearse bien con la muestra actual.",
  };
}

function buildPersonaSummary(persona) {
  const sensitivityText =
    persona.priceSensitivity >= 0.7
      ? "Reacciona rapido ante un precio percibido como alto."
      : persona.priceSensitivity >= 0.5
        ? "Compara antes de decidir y necesita sentir equilibrio."
        : "Tolera mejor una prima si entiende lo que gana.";

  return `${incomeLabels[persona.incomeLevel] || persona.incomeLevel}, ${environmentLabels[persona.environment] || persona.environment}, ${
    digitalLabels[persona.digitalLevel] || persona.digitalLevel
  }. ${sensitivityText}`;
}

function topDigitalLabel(personas) {
  const [key] = Object.entries(groupByCount(personas, "digitalLevel")).sort((a, b) => b[1] - a[1])[0];
  return digitalLabels[key] || key;
}

function topAgeGroup(personas) {
  const [key] = Object.entries(groupByCount(personas, "ageGroup")).sort((a, b) => b[1] - a[1])[0];
  return key;
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
