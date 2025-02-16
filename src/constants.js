// Modifiable effects that DofusLab uses
export const modifiableEffectStrings = {
  5: 'Pushback damage',
  81: 'HP restored',
  91: 'Water steal',
  92: 'Earth steal',
  93: 'Air steal',
  94: 'Fire steal',
  95: 'Neutral steal',
  96: 'Water damage',
  97: 'Earth damage',
  98: 'Air damage',
  99: 'Fire damage',
  100: 'Neutral damage',
  108: 'Fire healing',
  1020: 'Shield',
  2822: 'Best element damage',
  2998: 'Water healing',
  2999: 'Air healing',
  3000: 'Earth healing',
  3001: 'Neutral healing',
  3002: 'Best element healing',
};

// Buff effect ids that DofusLab currently supports
export const buffEffectStrings = {
  138: 'Power',
  414: 'Pushback Damage',
  112: 'Damage',
  115: 'Critical',
  2800: '% Melee Damage',
  2812: '% Spell Damage',
  1171: '% Final Damage',
  268: 'Agility',
  119: 'Agility',
  266: 'Chance',
  123: 'Chance',
  269: 'Intelligence',
  126: 'Intelligence',
  271: 'Strength',
  118: 'Strength',
  2804: '% Ranged Damage',
};

// Referential for the breed list, and in case we need them in the future
export const BREED_TO_CLASS_MAP = {
  1: 'Feca',
  2: 'Osamodas',
  3: 'Enutrof',
  4: 'Sram',
  5: 'Xelor',
  6: 'Ecaflip',
  7: 'Eniripsa',
  8: 'Iop',
  9: 'Cra',
  10: 'Sadida',
  11: 'Sacrier',
  12: 'Pandawa',
  13: 'Rogue',
  14: 'Masqueraider',
  15: 'Foggernaut',
  16: 'Eliotrope',
  17: 'Huppermage',
  18: 'Ouginak',
  20: 'Forgelance',
};

// These effectIds have spells in their descriptions so they relate differently
// with the final string, the spellId has to be replaced in the template, for example
// #1: +#3 Minimum Range becomes Flaming Crow: +2 Minimum Range
export const effectsWithSpells = [
  280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294,
  295, 296, 297, 298, 299, 314, 1035, 1036, 1045, 2022,
];

// These apply states as their effects so they have to be replaced with the state name
// that is in the value so #3 - an example would be "#3 state" becomes "Rooted state"
export const effectsWithStates = [950, 951, 952];

// These apply summons as their effects so they have to be replaced with the monster name
// that is in diceNum so #1 - an example would be "Summons: #1" becomes "Summons: Melanic tofu"
export const effectsWithSummons = [181, 185, 1008, 1011, 2796];

export const effectsWithoutTranslations = [
  // These only have "#1" as their translation so we kill them
  237, 792, 793, 814, 1017, 1018, 1019, 1084, 1160, 1161, 1175, 1187, 2017,
  2160, 2792, 2793, 2794, 2795, 2880, 2960,

  // These are ""
  12, 30, 31, 32, 46, 47, 48, 49, 52, 53, 54, 55, 56, 57, 58, 60, 61, 62, 63,
  80, 239, 289, 350, 351, 517, 630, 631, 632, 652, 654, 789, 911, 916, 917, 970,
  971, 972, 973, 974, 984, 999, 1051, 1052, 1053, 1055, 1057, 1058, 1062, 1081,
  1083, 1149, 1150, 1152, 1154, 1168, 1169, 1170, 1173, 1177, 1178, 1188, 1229,
  2030, 2031, 2900, 2901, 2902, 2903, 2904, 2914, 2991, 2994, 2995, 2996, 3003,
  3004, 3005, 3007, 3009, 3010, 3011, 3012, 3400, 3401, 3402, 3403, 3405, 3410,
  3792, 3793, 3799, 3800, 3801,
];

// '-': 'diagonale de %1 case',
// A: 'tout le monde',
// a: 'tout le monde',
//? C: 'cercle de %1 case'
// Explosive arrow
// Bat's eye
//! Shape 67?
// D: 'Damier de %1 case',
//? L: 'ligne de %1 case',
// Burning arrows (cra)
// Chopper (iop)
//! Shape 76?
//? O: 'anneau de %1 case',
// Ronda
// Hot iron
//! Shape 79?
//? Q: 'croix de %1 case',
// Influx
// Lance of the Lake
// Slingshot
//! Shape 81? - Not conclusive
// T: 'ligne perpendiculaire de %1 case',
//? U: 'demi-cercle de %1 case',
// Martelo
// Boomerang Daggers
//! Shape 85?
// V: 'cône de %1 case',
//? X: 'croix de %1 case',
// Lance of the Lake - was 88
// Slingshot - was 67
// Influx - was 81
//! Shape 88? - Not conclusive
// G: 'carré de %1 case',
// '+': 'croix diagonale de %1 case',
// '*': 'étoile de %1 case',
//? p: 'case',
//? P: 'case',
//! Seems to both be 80
