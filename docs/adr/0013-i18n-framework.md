# ADR: Internationalization (i18n) framework

## Status

Accepted

## Context

The plugin generates natural language descriptions and interface labels in multiple languages. Its original localization used JavaScript objects (`uiLabels` in `src/index.js` and separate parser catalogs), simple placeholder replacement, and manually selected singular/plural forms.

### Original implementation

```javascript
const uiLabels = {
  en: {
    classCount: 'Class diagram with {count} class(es)',
    // ...
  },
  nl: {
    classCount: 'Klassendiagram met {count} klasse(n)',
    // ...
  }
};
```

### Problems

1. **Contributor barrier**: Adding translations requires editing JavaScript code
   - Non-technical users (translators, accessibility advocates) cannot contribute
   - Limits realistic outlook for reaching usable number of languages
   - Contributors who value accessibility may not be programmers

2. **No pluralization support**: The `(n)/(s)` parentheses hack causes:
   - Long pauses in screenreader speech (see issue #15)
   - Poor readability
   - Grammatically incorrect output

3. **No ICU Message Format**: Can't handle complex grammar rules:
   - Dutch: 1 klasse → 2 klassen
   - English: 1 class → 2 classes
   - Some languages have more than 2 plural forms (e.g., Russian, Arabic)

4. **Limited placeholders**: Only supports basic `{type}` and `{title}` substitution

5. **Inconsistent fallback**: Unsupported locales can produce English interface labels with Dutch descriptions.

### Key requirement: Contributor accessibility

The primary driver for choosing an i18n framework is **maintainability through contributor accessibility**:

- Translators should be able to add/edit translations without touching JavaScript
- Standard file formats (JSON, YAML, PO) enable use of translation tools (Crowdin, Weblate, POEditor)
- Non-technical accessibility advocates can contribute localizations
- While UML diagram users may be technical, Mermaid users come from diverse fields and primarily value accessibility

## Options

### Option A: format-message (selected)

Supports ICU placeholders, plural/select messages, and CLDR plural categories directly. Its documented `namespace()` API isolates translation configuration, while translations can live in JSON files (format-message contributors, n.d.). This suits synchronous description generation in both Node and the browser playground.

### Option B: i18next

Provides JSON catalogs, language fallback, pluralization, and an extensive translation ecosystem. Its native plural messages use suffixed keys; ICU syntax requires the separate i18next-icu integration (i18next contributors, n.d.). Those additional features and integration are not needed by this plugin.

### Option C: @formatjs/intl

Provides ICU message formatting and an imperative `createIntl` API without requiring React (FormatJS contributors, n.d.). It is suitable, but its broader date/number/rich-text API and associated tooling offer no necessary advantage for the current message-formatting requirement.

### Option D: Keep custom implementation

Extend the current simple approach with pluralization rules. This keeps dependencies unchanged but leaves the project maintaining grammar selection and message parsing itself, contrary to the requirement for a standard framework.

## Decision

Use **format-message** with ICU messages in separate JSON catalogs for interface labels, diagram type names, and parser descriptions.

The deciding criteria are standard grammar handling, translator-editable catalogs, isolated configuration, and compatibility with the plugin's synchronous Node/browser consumers. All three frameworks support translator-editable JSON; this is not an exclusive advantage of i18next.

Keep English and Dutch built in. Applications can supply additional language catalogs through `translations`, including languages with more than two plural categories, without modifying parser code.

Resolve messages by requested locale, base language, then English. Fallback messages use the plural rules of their source language, so an untranslated English message does not inherit another language's grammar. Configuration is isolated between plugin instances and per-diagram locale overrides.

Preserve existing locale defaults and public label/fallback options. Replace parenthesized plural suffixes and manual count-based wording with ICU plural messages.

## Consequences

- Translators edit standard JSON containing ICU messages rather than JavaScript.
- Singular, zero, and plural counts are grammatical and no longer create parenthesized-suffix pauses for screen readers.
- Missing messages fall back individually; partial translations remain usable, but can produce mixed-language descriptions.
- Adding a language requires translated messages, not parser changes. Shipping an additional built-in language still requires review and registration.
- A runtime dependency is added, including in browser consumers of the playground. No network backend, language detector, or translation service is required.
- Applications must supply valid ICU syntax. Malformed messages are configuration errors rather than silently repaired translations.
- Existing `uiLabels`/parser `i18n` exports remain catalog views for compatibility; rendering uses the framework.

## References

- format-message contributors. (n.d.). *format-message API documentation*. https://github.com/format-message/format-message/blob/master/packages/format-message/README.md
- i18next contributors. (n.d.). *i18next-icu integration*. https://github.com/i18next/i18next-icu/blob/master/README.md
- FormatJS contributors. (n.d.). *Imperative intl API*. https://github.com/formatjs/formatjs/blob/main/packages/intl/create-intl.ts

---

*Decision date: 2026-10-07*
