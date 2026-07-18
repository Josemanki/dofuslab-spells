// Builds the human-readable `condition` label attached to a conditionalEffect.
// These strings are NOT in the game files — Ankama renders masks through UI
// code, never per spell — so they are authored here, one entry per language.

export const LANGS = ['en', 'fr', 'de', 'es', 'it', 'pt'];

const TEAM_LABELS = {
  enemies: {
    en: 'Enemies',
    fr: 'Ennemis',
    de: 'Gegner',
    es: 'Enemigos',
    it: 'Nemici',
    pt: 'Inimigos',
  },
  allies: {
    en: 'Allies and summons',
    fr: 'Alliés et invocations',
    de: 'Verbündete und Beschwörungen',
    es: 'Aliados e invocaciones',
    it: 'Alleati ed evocazioni',
    pt: 'Aliados e invocações',
  },
  caster: {
    en: 'Caster',
    fr: 'Le lanceur',
    de: 'Der Zauberer',
    es: 'El lanzador',
    it: 'Il lanciatore',
    pt: 'O lançador',
  },
  everyone: {
    en: 'Everyone',
    fr: 'Tout le monde',
    de: 'Alle',
    es: 'Todos',
    it: 'Tutti',
    pt: 'Todos',
  },
  allExceptCaster: {
    en: 'All except caster',
    fr: 'Tous sauf le lanceur',
    de: 'Alle außer dem Zauberer',
    es: 'Todos excepto el lanzador',
    it: 'Tutti tranne il lanciatore',
    pt: 'Todos exceto o lançador',
  },
  targets: {
    en: 'Targets',
    fr: 'Cibles',
    de: 'Ziele',
    es: 'Objetivos',
    it: 'Bersagli',
    pt: 'Alvos',
  },
  // The unconditional default effect, shown alongside conditional variants.
  base: { en: 'Base', fr: 'Base', de: 'Basis', es: 'Base', it: 'Base', pt: 'Base' },
};

const lifeClause = (op, value, lang) => {
  const below = {
    en: `below ${value}% HP`,
    fr: `en dessous de ${value}% de vie`,
    de: `unter ${value}% LP`,
    es: `por debajo del ${value}% de vida`,
    it: `sotto il ${value}% dei PV`,
    pt: `abaixo de ${value}% de vida`,
  };
  const above = {
    en: `above ${value}% HP`,
    fr: `au-dessus de ${value}% de vie`,
    de: `über ${value}% LP`,
    es: `por encima del ${value}% de vida`,
    it: `sopra il ${value}% dei PV`,
    pt: `acima de ${value}% de vida`,
  };
  return (op === '<=' ? below : above)[lang];
};

const CONNECTIVES = {
  // Positive (AND) states are joined with "and"; negated (OR) with "or",
  // matching how the game phrases "hasn't X or Y" for a set of forbidden states.
  and: { en: 'and', fr: 'et', de: 'und', es: 'y', it: 'e', pt: 'e' },
  or: { en: 'or', fr: 'ou', de: 'oder', es: 'o', it: 'o', pt: 'ou' },
};

const STATE_PREFIXES = {
  target: {
    with: { en: 'with', fr: 'avec', de: 'mit', es: 'con', it: 'con', pt: 'com' },
    without: {
      en: 'without',
      fr: 'sans',
      de: 'ohne',
      es: 'sin',
      it: 'senza',
      pt: 'sem',
    },
  },
  caster: {
    with: {
      en: 'if caster has',
      fr: 'si le lanceur a',
      de: 'wenn der Zauberer hat',
      es: 'si el lanzador tiene',
      it: 'se il lanciatore ha',
      pt: 'se o lançador tem',
    },
    without: {
      en: 'if caster lacks',
      fr: 'si le lanceur n’a pas',
      de: 'wenn der Zauberer nicht hat',
      es: 'si el lanzador no tiene',
      it: 'se il lanciatore non ha',
      pt: 'se o lançador não tem',
    },
  },
};

// Renders one grouped state clause: a shared prefix followed by the state
// names joined with a connective (e.g. "without Arrow I or Arrow II").
const stateClause = (side, positive, names, lang) => {
  const clean = names.map((n) => n || '').filter(Boolean);
  if (clean.length === 0) return '';
  const prefix = STATE_PREFIXES[side][positive ? 'with' : 'without'][lang];
  const connective = CONNECTIVES[positive ? 'and' : 'or'][lang];
  return `${prefix} ${clean.join(` ${connective} `)}`;
};

// ctx.stateName(id, lang) resolves a state id to its localized name.
export const buildConditionLabel = (parsedMask, ctx = {}) => {
  const teamKey = parsedMask.teamKey ?? 'targets';

  const life = parsedMask.conditions.filter((c) => c.type === 'life');
  // Group state conditions so same-prefix clauses share one prefix and join
  // their names (e.g. "without Arrow I or Arrow II") instead of repeating it.
  const stateGroups = { targetTrue: [], targetFalse: [], casterTrue: [], casterFalse: [] };
  for (const c of parsedMask.conditions) {
    if (c.type !== 'state') continue;
    const key = (c.onCaster ? 'caster' : 'target') + (c.positive ? 'True' : 'False');
    stateGroups[key].push(c.id);
  }
  // monster / breed / other conditions still force conditional routing, but we
  // don't yet render a clause for them (the team label stands alone).

  const out = {};
  for (const lang of LANGS) {
    const parts = [(TEAM_LABELS[teamKey] ?? TEAM_LABELS.targets)[lang]];
    const names = (ids) =>
      ids.map((id) => (ctx.stateName ? ctx.stateName(id, lang) : null));

    parts.push(stateClause('target', true, names(stateGroups.targetTrue), lang));
    parts.push(stateClause('target', false, names(stateGroups.targetFalse), lang));
    parts.push(stateClause('caster', true, names(stateGroups.casterTrue), lang));
    parts.push(stateClause('caster', false, names(stateGroups.casterFalse), lang));
    for (const c of life) parts.push(lifeClause(c.op, c.value, lang));

    out[lang] = parts.filter(Boolean).join(' ');
  }

  return out;
};

// The "Base" condition label, precomputed for effects with a simple mask that
// share a slot with conditional effects.
export const BASE_CONDITION = buildConditionLabel({ teamKey: 'base', conditions: [] });

const DELAYED = {
  en: 'Delayed',
  fr: 'Différé',
  de: 'Verzögert',
  es: 'Retrasado',
  it: 'Ritardato',
  pt: 'Atrasado',
};

// Marks a condition as the delayed variant — the effect that lands on a later
// turn (when the stack's timer expires or the caster changes target). Returns a
// new object so shared labels like BASE_CONDITION aren't mutated.
export const withDelayed = (label) => {
  const out = {};
  for (const lang of LANGS) out[lang] = `${label[lang]} (${DELAYED[lang]})`;
  return out;
};
