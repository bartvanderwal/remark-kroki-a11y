const formatMessage = require('format-message');

const catalogs = {
  en: {
    ui: require('./locales/en/ui.json'),
    diagramTypes: require('./locales/en/diagramTypes.json'),
    ...require('./locales/en/parsers.json'),
  },
  nl: {
    ui: require('./locales/nl/ui.json'),
    diagramTypes: require('./locales/nl/diagramTypes.json'),
    ...require('./locales/nl/parsers.json'),
  },
};

function getMessages(section) {
  return Object.fromEntries(Object.entries(catalogs).map(([locale, messages]) => [locale, messages[section]]));
}

function createTranslator(section, locale = 'en', translations = {}) {
  const formatter = formatMessage.namespace();
  formatter.setup({ missingTranslation: 'ignore' });
  const normalizedLocale = locale.toLowerCase().replace(/_/g, '-');
  const locales = [...new Set([locale, normalizedLocale, normalizedLocale.split('-')[0], 'en'])];

  return (key, values = {}) => {
    for (const language of locales) {
      const custom = translations[language] && translations[language][section];
      const builtin = catalogs[language] && catalogs[language][section];
      const pattern = custom && Object.prototype.hasOwnProperty.call(custom, key) ? custom[key]
        : builtin && Object.prototype.hasOwnProperty.call(builtin, key) ? builtin[key] : undefined;
      if (pattern !== undefined) {
        return formatter(pattern, values, language.replace(/_/g, '-'));
      }
    }
    return key;
  };
}

function formatPattern(pattern, values, locale = 'en') {
  const formatter = formatMessage.namespace();
  formatter.setup({ missingTranslation: 'ignore' });
  return formatter(pattern, values, locale.replace(/_/g, '-'));
}

function formatFallback(locale, diagramType, translations = {}, fallbackA11yText = {}) {
  const messages = { ...translations };
  for (const [language, pattern] of Object.entries(fallbackA11yText || {})) {
    messages[language] = {
      ...messages[language],
      ui: { ...messages[language]?.ui, fallbackA11yText: pattern },
    };
  }
  return createTranslator('ui', locale, messages)('fallbackA11yText', { diagramType });
}

module.exports = { createTranslator, getMessages, formatPattern, formatFallback };
