// Language configurations
const LANG_CONFIG = {
  en: {
    to: 'to',
  },
  de: {
    to: 'bis',
  },
  es: {
    to: 'a',
  },
  fr: {
    to: 'à',
  },
  it: {
    // Temporarily using the same as English until we decide what to do with Italian
    to: 'to',
  },
  pt: {
    to: 'a',
  },
};

const calculateEffectDuration = (duration, lang) => {
  if (duration === 0) {
    return '';
  }

  if (duration === 1) {
    switch (lang) {
      case 'en':
      case 'it':
        return ` (${duration} turn)`;
      case 'fr':
        return ` (${duration} tour)`;
      case 'de':
        return ` (${duration} runde)`;
      case 'es':
      case 'pt':
        return ` (${duration} turno)`;
    }
  }

  switch (lang) {
    case 'en':
    case 'it':
      return ` (${duration} turns)`;
    case 'fr':
      return ` (${duration} tours)`;
    case 'de':
      return ` (${duration} runden)`;
    case 'es':
    case 'pt':
      return ` (${duration} turnos)`;
  }
};

export class StatTemplateParser {
  constructor(defaultLang = 'en') {
    this.defaultLang = defaultLang.toLowerCase();
  }

  // Sanitize spell text to remove formatting and color tags
  // like {{spell,29701,1::<color=#ebc304>King of Diamonds</color>}}
  sanitizeSpellText(input) {
    // Normalize the input string to make it easier to work with
    let normalized = input
      .replace(/\\/g, '') // Remove backslashes
      .replace(/"+/g, '') // Remove all double quotes
      .replace(/<font color=#ebc304>/g, '<color=#ebc304>') // Normalize font tags to color tags
      .replace(/<\/font>/g, '</color>') // Normalize closing font tags
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim(); // Remove leading/trailing whitespace

    // First replace: handle the spell/color structure
    // Then apply our regex patterns
    const colorPattern = /<color=#ebc304>(.*?)<\/color>/g;
    const spellPattern = /\{+spell,\d+,\d+::(.*?)\}+/g;

    // Apply cleanups
    let cleaned = normalized
      .replace(colorPattern, '$1') // Clean color tags
      .replace(spellPattern, '$1') // Clean spell wrappers
      .replace(colorPattern, '$1'); // Clean any remaining standalone color tags

    return cleaned;
  }

  parse(template, values, lang) {
    const config = LANG_CONFIG[lang] || LANG_CONFIG[this.defaultLang];
    let result = template;
    const hasRange = values[0] !== values[1] && values[1] !== 0;

    // Replace number placeholders (#1, #2, etc)
    values.forEach((value, index) => {
      if (!hasRange) {
        // If it doesn't have a range, #2 is unused
        if (index === 1) {
          result = result.replace(`#2`, '');
        }
        result = result.replace(`#${index + 1}`, value);
      }
      result = result.replace(`#${index + 1}`, value);
    });

    // Handle range formatting based on language
    // Handle positive ranges, regex matches plus sign optionally
    result = result.replace(
      new RegExp(`{{~1~2 ${config.to} \\\+?}}`),
      hasRange ? ` ${config.to} ` : ''
    );

    // Handle negative ranges, regex matches both hyphen and en-dash
    result = result.replace(
      new RegExp(`{{~1~2 ${config.to} [-–]}}`),
      hasRange ? ` ${config.to} -` : ''
    );

    const totalValue = values[1] - values[0];

    // Handle pluralization (~p)
    result = result.replace(/{{~p}}/, '');
    result = result.replace(/{{~p(.+?)}}/g, (_, suffix) =>
      totalValue === 1 || totalValue === 0 ? '' : suffix
    );

    // Handle zero cases (~z)
    result = result.replace(/{{~z}}/, '');
    result = result.replace(/{{~z(.+?)}}/g, (_, suffix) =>
      totalValue !== 0 ? '' : suffix
    );

    // Handle extra spaces
    result = result.replace(/\s+/g, ' ').trim();

    const effectDuration = calculateEffectDuration(values[3], lang);
    result = this.sanitizeSpellText(result);
    result += effectDuration;

    return result;
  }
}
