// Parses a Dofus effect `targetMask` into a team + a set of conditions.
//
// A targetMask is a comma-separated list of tokens. Letter CASE encodes team
// (lowercase = caster's side / allies, uppercase = opposing side / enemies).
// A leading `*` means the condition is tested against the CASTER, not the
// target. Condition tokens carry a numeric suffix (state id, life %, etc.).
//
//   "A"            -> enemies
//   "a,A"          -> everyone
//   "g" / "A,g"    -> all except caster
//   "C"            -> caster
//   "A,E2020"      -> enemies WITH state 2020
//   "A,e2020"      -> enemies WITHOUT state 2020
//   "A,V50"        -> enemies at/below 50% HP
//   "a,A,*e245"    -> everyone, if the CASTER lacks state 245

const CASTER = new Set(['c', 'C']);
const ALLY = new Set(['a', 'd', 'h', 'i', 'j', 'l', 'm', 's']);
const ENEMY = new Set(['A', 'D', 'H', 'I', 'J', 'L', 'M', 'S']);

// F50000 is a sentinel ("around the caster's summons"), not a real condition —
// Ankama's own hasCondition() excludes it, so we do too.
const isSummonSentinel = (letter, rest) =>
  (letter === 'F' || letter === 'f') && rest === '50000';

const parseCondition = (letter, rest, onCaster) => {
  // Shield points: PB = has shield, pb = no shield (b = bouclier). Guarded on
  // the trailing b so single P/p still means the summon flag below.
  if ((letter === 'P' || letter === 'p') && (rest === 'B' || rest === 'b')) {
    return { type: 'flag', flag: 'shield', positive: letter === 'P', onCaster };
  }
  const value = rest === '' ? null : Number(rest);
  switch (letter) {
    case 'E':
      return { type: 'state', positive: true, id: value, onCaster };
    case 'e':
      return { type: 'state', positive: false, id: value, onCaster };
    case 'V':
      return { type: 'life', op: '<=', value, onCaster };
    case 'v':
      return { type: 'life', op: '>', value, onCaster };
    case 'F':
      return { type: 'monster', positive: true, id: value, onCaster };
    case 'f':
      return { type: 'monster', positive: false, id: value, onCaster };
    case 'B':
      return { type: 'breed', positive: true, id: value, onCaster };
    case 'b':
      return { type: 'breed', positive: false, id: value, onCaster };
    // Boolean flags (no value); case encodes has/not.
    case 'P':
      return { type: 'flag', flag: 'summon', positive: true, onCaster };
    case 'p':
      return { type: 'flag', flag: 'summon', positive: false, onCaster };
    case 'O':
      return { type: 'flag', flag: 'mainTarget', positive: true, onCaster };
    case 'o':
      return { type: 'flag', flag: 'mainTarget', positive: false, onCaster };
    case 'K':
      return { type: 'flag', flag: 'carried', positive: true, onCaster };
    case 'R':
      return { type: 'flag', flag: 'portal', positive: true, onCaster };
    case 'r':
      return { type: 'flag', flag: 'portal', positive: false, onCaster };
    case 'T':
      return { type: 'flag', flag: 'telefrag', positive: true, onCaster };
    case 'W':
      return { type: 'flag', flag: 'teleported', positive: true, onCaster };
    default:
      return { type: 'other', token: `${letter}${rest}`, onCaster };
  }
};

const deriveTeamKey = (teamLetters, hasG) => {
  if (hasG) return 'allExceptCaster';
  const hasAlly = teamLetters.some((l) => ALLY.has(l));
  const hasEnemy = teamLetters.some((l) => ENEMY.has(l));
  const hasCaster = teamLetters.some((l) => CASTER.has(l));
  if (hasAlly && hasEnemy) return 'everyone';
  if (hasEnemy) return 'enemies';
  if (hasAlly) return 'allies';
  if (hasCaster) return 'caster';
  return null;
};

export const parseMask = (rawMask) => {
  const tokens = (rawMask || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const teamLetters = [];
  const conditions = [];
  let hasG = false;

  for (let token of tokens) {
    const onCaster = token.startsWith('*');
    if (onCaster) token = token.slice(1);
    const letter = token[0];
    const rest = token.slice(1);

    if (letter === 'g' || letter === 'G') {
      hasG = true;
      continue;
    }
    if (CASTER.has(letter) || ALLY.has(letter) || ENEMY.has(letter)) {
      teamLetters.push(letter);
      continue;
    }
    if (isSummonSentinel(letter, rest)) continue;
    conditions.push(parseCondition(letter, rest, onCaster));
  }

  return {
    teamKey: deriveTeamKey(teamLetters, hasG),
    conditions,
    hasConditions: conditions.length > 0,
    raw: rawMask,
  };
};
