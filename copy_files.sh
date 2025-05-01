#!/bin/bash

# Source directory
SOURCE_DIR="../doduda/data"

# Destination directory
DEST_DIR="./input"

# Create input directory if it doesn't exist
mkdir -p "$DEST_DIR"

# List of all files to copy
files=(
    "effects.json"
    "spell_levels.json"
    "spell_pairs.json"
    "spells.json"
    "spell_states.json"
    "spell_variants.json"
    "monsters.json"
    "spell_types.json"
)

# List of language files
language_files=(
    "de.json"
    "en.json"
    "es.json"
    "fr.json"
    "pt.json"
)

# Copy root files
for file in "${files[@]}"; do
    if [ -f "$SOURCE_DIR/$file" ]; then
        cp "$SOURCE_DIR/$file" "$DEST_DIR/"
        echo "Copied $file"
    else
        echo "Warning: $file not found in source directory"
    fi
done

# Copy language files directly to input directory
for file in "${language_files[@]}"; do
    if [ -f "$SOURCE_DIR/languages/$file" ]; then
        cp "$SOURCE_DIR/languages/$file" "$DEST_DIR/"
        echo "Copied $file from languages"
    else
        echo "Warning: languages/$file not found in source directory"
    fi
done

echo "Done copying files!"