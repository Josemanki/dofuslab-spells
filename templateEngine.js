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
    to: 'a',
  },
  pt: {
    to: 'a',
  },
};

export class StatTemplateParser {
  constructor(defaultLang = 'en') {
    this.defaultLang = defaultLang.toLowerCase();
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
        result = result.replace(`#${index + 1}`, Math.abs(value));
      }
      result = result.replace(`#${index + 1}`, Math.abs(value));
    });

    // Handle range formatting based on language
    // Handle positive ranges
    result = result.replace(
      new RegExp(`{{~1~2 ${config.to} }}`),
      hasRange ? ` ${config.to} ` : ''
    );

    // Handle negative ranges
    result = result.replace(
      new RegExp(`{{~1~2 ${config.to} -}}`),
      hasRange ? ` ${config.to} -` : ''
    );

    const totalValue = values[1];

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

    return result;
  }
}
