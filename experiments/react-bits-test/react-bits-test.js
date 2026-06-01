const COPY = {
  en: {
    metaTitle: "T-Spin Traveler React Bits Motion Lab",
    heroTitle: "T-Spin Traveler",
    heroSubtitle: "Alien ruins. Falling blocks. Rift-powered battles.",
    jumpCombat: "Preview Combat Text",
    jumpCards: "Preview Cards",
    sections: {
      combat: {
        title: "Combat Text Preview",
        body: "Different impact rhythms for clear feedback. Perfect Clear is intentionally strongest, Combo is second, and the rest stay readable.",
      },
      buttons: {
        title: "Button Preview",
        body: "Hover, click, glow, and small displacement tests for magical menu controls.",
      },
      cards: {
        title: "Card Preview",
        body: "Fake rarity cards for motion only. Text is code-native and not baked into images.",
      },
      performance: {
        title: "Performance Notes",
        body: "A removable prototype page for checking visual direction before any formal game integration.",
      },
    },
    combat: [
      { text: "COMBO x4", variant: "combo", note: "Two-beat pop, medium burst, readable damage cadence." },
      { text: "BACK-TO-BACK", variant: "b2b", note: "Horizontal rift snap with controlled afterglow." },
      { text: "PERFECT CLEAR", variant: "pc", note: "Largest crown pulse and gold flare for the rarest moment." },
      { text: "T-SPIN DOUBLE", variant: "tspin", note: "Angular kick and violet cut for spin recognition." },
    ],
    buttons: [
      { label: "Start Run", icon: "play", tone: "teal" },
      { label: "Upgrade", icon: "diamond", tone: "gold" },
      { label: "Rift Archive", icon: "archive", tone: "violet" },
    ],
    cards: [
      { tier: "COMMON", className: "common", title: "Rune Draft", note: "Low glow, slow float, restrained reveal." },
      { tier: "RARE", className: "rare", title: "Star Map", note: "Cooler hover field and sharper frame light." },
      { tier: "EPIC", className: "epic", title: "Void Prism", note: "Stronger aura without covering card text." },
      { tier: "RELIC", className: "relic", title: "Ancient Core", note: "Gold reveal, heavier halo, highest rarity feel." },
    ],
    notes: [
      ["React", "No. This isolated page uses native DOM, CSS animations, and a tiny JS controller to avoid project-wide React changes."],
      ["Tailwind", "No. Plain CSS keeps the experiment removable and compatible with the current static Vite setup."],
      ["GSAP / Framer Motion", "No. These effects intentionally test whether React Bits-style motion can be approximated with CSS first."],
      ["Native CSS / Canvas portability", "Likely. Title, combat text, button, and card motion can move to DOM overlay CSS; background ideas can inform Canvas timing."],
      ["Formal integration fit", "Promising for menus, callouts, upgrade choice screens, and non-gameplay overlays after performance checks."],
      ["React Bits source", "No component source was copied. The page references effect categories and recreates them for this game's visual direction."],
    ],
    references: [
      "Shiny Text / Split Text",
      "Aurora / Soft Aurora",
      "Spotlight Card",
      "Star Border",
      "Tilted Card",
      "Magic Rings",
    ],
  },
  zh: {
    metaTitle: "T-Spin Traveler React Bits 動畫實驗室",
    heroTitle: "T-Spin Traveler",
    heroSubtitle: "Alien ruins. Falling blocks. Rift-powered battles.",
    jumpCombat: "預覽戰鬥文字",
    jumpCards: "預覽卡片",
    sections: {
      combat: {
        title: "戰鬥文字預覽",
        body: "測試不同強度的消除回饋節奏。Perfect Clear 最強，Combo 次之，其餘維持可讀性。",
      },
      buttons: {
        title: "按鈕預覽",
        body: "測試魔法選單控制項的 hover、click、glow 與微位移。",
      },
      cards: {
        title: "卡片預覽",
        body: "僅用假稀有度卡片測試動效。文字由程式渲染，沒有烤進圖片。",
      },
      performance: {
        title: "效能備註",
        body: "這是可刪除的原型頁，用於正式導入前確認視覺方向。",
      },
    },
    combat: [
      { text: "COMBO x4", variant: "combo", note: "雙拍彈跳，中強度爆發，維持傷害節奏可讀性。" },
      { text: "BACK-TO-BACK", variant: "b2b", note: "橫向裂隙切入，殘光控制在低干擾範圍。" },
      { text: "PERFECT CLEAR", variant: "pc", note: "最大金色冠冕脈衝，用於最稀有的瞬間。" },
      { text: "T-SPIN DOUBLE", variant: "tspin", note: "角度踢動與紫色切光，凸顯 T-Spin 辨識。" },
    ],
    buttons: [
      { label: "Start Run", icon: "play", tone: "teal" },
      { label: "Upgrade", icon: "diamond", tone: "gold" },
      { label: "Rift Archive", icon: "archive", tone: "violet" },
    ],
    cards: [
      { tier: "COMMON", className: "common", title: "Rune Draft", note: "低亮度、慢浮動、收斂揭示。" },
      { tier: "RARE", className: "rare", title: "Star Map", note: "偏冷 hover 場與較銳利的邊框光。" },
      { tier: "EPIC", className: "epic", title: "Void Prism", note: "更強光暈，但不遮住卡片文字。" },
      { tier: "RELIC", className: "relic", title: "Ancient Core", note: "金色揭示、較重 halo、最高稀有感。" },
    ],
    notes: [
      ["React", "否。此隔離頁使用原生 DOM、CSS 動畫與少量 JS，避免整個專案導入 React。"],
      ["Tailwind", "否。使用純 CSS，讓實驗更容易刪除，並維持目前靜態 Vite 架構。"],
      ["GSAP / Framer Motion", "否。此頁優先測試 React Bits 風格是否能先用 CSS 近似。"],
      ["原生 CSS / Canvas 可移植性", "高。標題、戰鬥文字、按鈕與卡片動效可移到 DOM overlay；背景可作為 Canvas 節奏參考。"],
      ["正式導入適性", "適合先評估主選單、戰鬥 callout、升級選擇畫面與非 gameplay overlay。"],
      ["React Bits source", "未複製元件原始碼。此頁僅參考效果分類，並重做為本遊戲視覺方向。"],
    ],
    references: [
      "Shiny Text / Split Text",
      "Aurora / Soft Aurora",
      "Spotlight Card",
      "Star Border",
      "Tilted Card",
      "Magic Rings",
    ],
  },
};

const ICONS = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z" fill="currentColor"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 21 12 12 21 3 12 12 3Zm0 4.1L7.1 12 12 16.9 16.9 12 12 7.1Z" fill="currentColor"/></svg>',
  archive: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v4H5V4Zm1 6h12v10H6V10Zm4 3v2h4v-2h-4Z" fill="currentColor"/></svg>',
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const lang = new URLSearchParams(window.location.search).get("lang") === "zh" ? "zh" : "en";
const copy = COPY[lang];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function splitTitle(text) {
  return [...text].map((char, index) => {
    const safeChar = char === " " ? "&nbsp;" : escapeHtml(char);
    return `<span style="--i:${index}">${safeChar}</span>`;
  }).join("");
}

function sectionHeading(section, titleId) {
  return `
    <div class="section-heading">
      <h2 id="${escapeHtml(titleId)}">${escapeHtml(section.title)}</h2>
      <p>${escapeHtml(section.body)}</p>
    </div>
  `;
}

function renderHero() {
  return `
    <section class="hero lab-section" aria-labelledby="motion-lab-title">
      <div class="hero-copy">
        <div class="title-wrap">
          <h1 id="motion-lab-title" class="hero-title">${splitTitle(copy.heroTitle)}</h1>
        </div>
        <p class="hero-subtitle">${escapeHtml(copy.heroSubtitle)}</p>
        <div class="hero-actions">
          <a class="anchor-button" href="#combat-preview">${escapeHtml(copy.jumpCombat)}</a>
          <a class="anchor-button" href="#card-preview">${escapeHtml(copy.jumpCards)}</a>
        </div>
      </div>
      <div class="rift-preview tilt-reactive" aria-hidden="true">
        <div class="rift-layers">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </section>
  `;
}

function renderCombat() {
  return `
    <section id="combat-preview" class="preview-band lab-section" aria-labelledby="combat-title">
      ${sectionHeading(copy.sections.combat, "combat-title")}
      <div class="combat-grid">
        ${copy.combat.map((item) => `
          <article class="combat-burst ${escapeHtml(item.variant)}" tabindex="0" data-combat="${escapeHtml(item.variant)}">
            <span class="combat-word">${escapeHtml(item.text)}</span>
            <span class="combat-note">${escapeHtml(item.note)}</span>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderButtons() {
  return `
    <section class="preview-band lab-section" aria-labelledby="buttons-title">
      ${sectionHeading(copy.sections.buttons, "buttons-title")}
      <div class="button-grid">
        ${copy.buttons.map((item) => `
          <button class="magic-button tilt-reactive" type="button" data-tone="${escapeHtml(item.tone)}">
            ${ICONS[item.icon] || ""}
            <span>${escapeHtml(item.label)}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCards() {
  return `
    <section id="card-preview" class="preview-band lab-section" aria-labelledby="cards-title">
      ${sectionHeading(copy.sections.cards, "cards-title")}
      <div class="card-grid">
        ${copy.cards.map((item, index) => `
          <article class="relic-card tilt-reactive ${escapeHtml(item.className)}" style="--i:${index}" tabindex="0">
            <span class="card-tier">${escapeHtml(item.tier)}</span>
            <div class="card-sigil" aria-hidden="true"><span>${escapeHtml(item.tier.slice(0, 1))}</span></div>
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <p class="card-note">${escapeHtml(item.note)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPerformanceNotes() {
  return `
    <section class="preview-band lab-section" aria-labelledby="performance-title">
      ${sectionHeading(copy.sections.performance, "performance-title")}
      <div class="notes-panel">
        ${copy.notes.map(([label, value]) => `
          <article class="note-item">
            <strong>${escapeHtml(label)}</strong>
            <span>${escapeHtml(value)}</span>
          </article>
        `).join("")}
      </div>
      <div class="reference-row" aria-label="React Bits reference effect categories">
        ${copy.references.map((item) => `<span class="reference-chip">${escapeHtml(item)}</span>`).join("")}
      </div>
    </section>
  `;
}

function bindReactivePointer(root) {
  root.querySelectorAll(".tilt-reactive").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      element.style.setProperty("--mx", `${x.toFixed(2)}%`);
      element.style.setProperty("--my", `${y.toFixed(2)}%`);
    });
    element.addEventListener("pointerleave", () => {
      element.style.removeProperty("--mx");
      element.style.removeProperty("--my");
    });
  });
}

function replayCombat(card) {
  card.classList.remove("is-replaying");
  window.requestAnimationFrame(() => {
    card.classList.add("is-replaying");
    window.setTimeout(() => card.classList.remove("is-replaying"), 900);
  });
}

function spawnSparks(target) {
  if (prefersReducedMotion.matches) return;
  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const colors = ["#7ef7ff", "#9b6dff", "#f7d77a", "#65d69b"];

  for (let index = 0; index < 10; index += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 10;
    const distance = 34 + (index % 3) * 16;
    spark.className = "rift-spark";
    spark.style.left = `${centerX}px`;
    spark.style.top = `${centerY}px`;
    spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    spark.style.setProperty("--spark-color", colors[index % colors.length]);
    document.body.append(spark);
    window.setTimeout(() => spark.remove(), 760);
  }
}

function bindInteractions(root) {
  root.querySelectorAll(".combat-burst").forEach((card) => {
    card.addEventListener("click", () => replayCombat(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        replayCombat(card);
      }
    });
  });

  root.querySelectorAll(".magic-button").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.add("is-pressed");
      spawnSparks(button);
      window.setTimeout(() => button.classList.remove("is-pressed"), 180);
    });
  });
}

function startAmbientReplay(root) {
  if (prefersReducedMotion.matches) return;
  const combatCards = Array.from(root.querySelectorAll(".combat-burst"));
  let index = 0;
  window.setInterval(() => {
    if (!document.hidden && combatCards[index]) {
      replayCombat(combatCards[index]);
      index = (index + 1) % combatCards.length;
    }
  }, 2600);
}

function render() {
  const root = document.getElementById("react-bits-test-root");
  if (!root) {
    throw new Error("React Bits test root not found");
  }

  document.documentElement.lang = lang;
  document.title = copy.metaTitle;
  root.className = "motion-lab";
  root.innerHTML = [
    renderHero(),
    renderCombat(),
    renderButtons(),
    renderCards(),
    renderPerformanceNotes(),
  ].join("");

  bindReactivePointer(root);
  bindInteractions(root);
  startAmbientReplay(root);

  window.REACT_BITS_TEST_READY = true;
  window.__reactBitsTestDiagnostics = () => ({
    ready: window.REACT_BITS_TEST_READY === true,
    usesReact: false,
    usesTailwind: false,
    usesGsap: false,
    usesFramerMotion: false,
    sections: root.querySelectorAll(".preview-band").length,
    combatItems: root.querySelectorAll(".combat-burst").length,
    buttons: root.querySelectorAll(".magic-button").length,
    cards: root.querySelectorAll(".relic-card").length,
    assetSummaryPresent: typeof window.TST_ASSETS?.getSummary === "function",
  });
}

render();
