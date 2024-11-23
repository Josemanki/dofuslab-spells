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
export const effectIdsWithSpells = [
  280, 281, 290, 1035, 1036, 1045, 1181, 2022,
];

// These only have "#1" as their translation so we kill them
export const effectsWithoutTranslations = [
  237, 792, 793, 814, 1017, 1018, 1019, 1084, 1160, 1161, 1175, 1187, 2017,
  2160, 2792, 2793, 2794, 2795, 2880, 2960,
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
