# DofusLab Spell parser

Script to generate a semi-automated version of the current spells in Dofus to simplify getting DofusLab up-to-date.

## How to use

First we must understand folder structure - we've got an input folder, a temp one and an output.

- Input will take a json version of the game files, which can be obtained with PyDofus.
- Temp will generate some files needed for the script to run, for example reordering certain "breeds", as the game files reference them, and some spell pairs.
- Output will be the autogenerated files that we can now use to edit DofusLab spell file (keeping in mind this is by no means a copy-pasteable version, there's some manual work involved like some duplicated effects on skills that have alternative effects, for example Morph, which will look like having 4 lines of damage).

### So, how do we use it then?

- We must place a json copy of the following files into the `input` folder:
`Effects.json, i18n_de.json, i18n_en.json, i18n_es.json, i18n_fr.json, i18n_it.json, i18n_pt.json, SpellLevels.json, SpellPairs.json, Spells.json, SpellStates.json, SpellVariants.json`.

- Execute `generate.bat` in order to generate the new data from the files.

- Then, the `output` folder will contain the `translatedEffects.json` file that we can use to start correlating with DofusLab files.