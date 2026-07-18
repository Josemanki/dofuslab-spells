// Manual corrections for values the pipeline can't reliably derive from the raw
// data. Keyed by spell id (spell names collide across breeds/variants). Each
// override is field-scoped, so auto-generated values keep updating on every
// run — only the pinned field is replaced, and it wins over the derived value.
//
// Keep this list surgical (only genuinely-underivable fields), and always note
// WHY the value can't be derived so it stays maintainable.
//
// The generator writes unresolved candidates to output/review.json each run;
// resolving one here removes it from that list.
export const overrides = {
  // Force of Nature: the real cap (6 Leafy Trees) is declared on the sibling
  // spell 13584, not on the main spell we output (which reads maxStack -1).
  13570: { damageIncreaseMaxStacks: 6 },

  // Toxines: the cap (5) lives in the "Toxines I–V" state chain (5194–5198),
  // which we don't parse; the spell's own maxStack is 1.
  12933: { damageIncreaseMaxStacks: 5 },

  // Peat Bog: the real cap (unlimited) is based on the MPs usage, not the spell's own maxStack. We make it 10 to have a sensible default.
  13358: { damageIncreaseMaxStacks: 10 },

  // Dark Ray: the real cap (unlimited) is based on the amount of Telefrag entities in the area of effect, not the spell's own maxStack. We make it 3 as area is 3 tiles.
  13253: { damageIncreaseMaxStacks: 3 },

  // Pygmachia: the real cap (unlimited) is based on the amount of casts of the spell, not the spell's own maxStack. We make it 4 as the spell can be cast 4 times.
  13146: { damageIncreaseMaxStacks: 4 },

  // Tumult: the real cap (unlimited) is based on the amount of enemies in the area of effect, not the spell's own maxStack. We make it 5 as the area is 5 tiles.
  13144: { damageIncreaseMaxStacks: 5 },

  // Slaughtering Arrow: the real cap (unlimited) is based on the amount of enemies in the area of effect, not the spell's own maxStack. We make it 3 as the area is 3 tiles.
  32457: { damageIncreaseMaxStacks: 3 },

  // Stripping: the real cap (unlimited) is based on the amount of allies adjacent to the target, not the spell's own maxStack. We make it 4 as only 4 allies can be adjacent to the target.
  13789: { damageIncreaseMaxStacks: 4 },

  // Muzzle: the real cap (unlimited) is based on the amount of enemies adjacent to the target, not the spell's own maxStack. We make it 4 as only 4 enemies can be adjacent to the target.
  13793: { damageIncreaseMaxStacks: 4 },
};
