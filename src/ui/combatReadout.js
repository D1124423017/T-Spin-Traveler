const identityTranslate = (key) => key;

export function buildDamageEquation(breakdown, { translate = identityTranslate, compact = false } = {}) {
  if (!breakdown) return translate("damageEquationHint");
  const terms = getDamageEquationTerms(breakdown, { translate });
  const addParts = terms.filter((term) => term.source !== "multiplier").map((term) => term.text);
  const multiplierParts = terms.filter((term) => term.source === "multiplier").map((term) => term.text);
  const parts = [...addParts, ...multiplierParts.map((part) => `× ${part}`)];
  const maxParts = compact ? 5 : 9;
  const shown = parts.slice(0, maxParts);
  if (parts.length > maxParts) shown.push("+...");
  return `${shown.join(" + ").replace(/\+ ×/g, "×")} = ${breakdown.total} ${translate("dmgShort")}`;
}

export function getDamageEquationTerms(breakdown, { translate = identityTranslate } = {}) {
  if (!breakdown) return [];
  const terms = [];
  for (const part of breakdown.parts || []) {
    if (!part.value) continue;
    terms.push({
      text: `${translate(part.key)} +${part.value}`,
      label: translate(part.key),
      value: `+${part.value}`,
      source: part.source || "base",
      color: damageSourceColor(part.source || "base"),
    });
  }
  for (const multi of breakdown.multipliers || []) {
    const name = multi.key ? translate(multi.key) : multi.label;
    terms.push({
      text: `${name} ${multi.value}`,
      label: name,
      value: multi.value,
      source: "multiplier",
      color: "#d7c2ff",
    });
  }
  return terms;
}

export function damageSourceColor(source) {
  return {
    base: "#b9c2ff",
    spin: "#d7c2ff",
    combo: "#7ef7ff",
    b2b: "#fff0a6",
    perfect: "#fff0a6",
    weakness: "#ffdf8a",
    upgrade: "#9df7da",
    multiplier: "#d7c2ff",
  }[source] || "#f5f1e6";
}
