import { modifiableEffectStrings } from '../constants.js';

// Semantic buckets for the modifiable effects DofusLab tracks. Element is
// intentionally NOT a distinguisher here: Water vs Earth damage are both
// "damage", so a spell hitting several elements on one team is not a split.
// Steals and pushback are offensive, so they bucket as damage.
export const effectCategories = {
  damage: [5, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 2822],
  heal: [81, 108, 2998, 2999, 3000, 3001, 3002],
  shield: [1020],
};

const categoryByEffectId = {};
for (const [category, ids] of Object.entries(effectCategories)) {
  for (const id of ids) categoryByEffectId[id] = category;
}

export const effectCategory = (effectId) => categoryByEffectId[effectId] ?? 'other';

// Sanity check: every modifiable effect should be bucketed, or the split
// detector silently treats it as its own category.
export const uncategorizedModifiable = Object.keys(modifiableEffectStrings)
  .map(Number)
  .filter((id) => !(id in categoryByEffectId));
