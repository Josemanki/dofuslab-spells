import fs from 'fs';

export const writeOutput = (path, data) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.error(`No matching file for ${path}, creating...`);
  }

  fs.writeFileSync(path, JSON.stringify(data));
};

export const cleanTempDirectory = () => {
  console.log('Cleaning temp directory...');
  fs.rm('./temp', { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

// Spell flag utilities
export const SpellFlags = {
  CAST_IN_LINE: 1,
  CAST_TEST_LOS: 4,
  NEED_FREE_CELL: 8,
  RANGE_CAN_BE_BOOSTED: 64,
};

export const checkSpellFlag = (spellLevel, flag) => {
  return (spellLevel.m_flags & flag) > 0;
};

export const getSpellMetaProperties = (spellLevel) => {
  return {
    isLinear: checkSpellFlag(spellLevel, SpellFlags.CAST_IN_LINE),
    needLos: checkSpellFlag(spellLevel, SpellFlags.CAST_TEST_LOS),
    needsFreeCell: checkSpellFlag(spellLevel, SpellFlags.NEED_FREE_CELL),
    modifiableRange: checkSpellFlag(
      spellLevel,
      SpellFlags.RANGE_CAN_BE_BOOSTED
    ),
  };
};

// SpellLevelFlags {
// 	CastInLine = 1,
// 	CastInDiagonal = 2,
// 	CastTestLos = 4,
// 	NeedFreeCell = 8,
// 	NeedTakenCell = 16,
// 	NeedFreeTrapCell = 32,
// 	RangeCanBeBoosted = 64,
// 	HideEffects = 128,
// 	Hidden = 256,
// 	PlayAnimation = 512,
// 	NeedVisibleEntity = 1024,
// 	NeedCellWithoutPortal = 2048,
// 	PortalProjectionForbidden = 4096,
// }
