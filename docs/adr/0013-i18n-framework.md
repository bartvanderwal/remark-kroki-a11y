# ADR: Internationalization (i18n) framework

## Status

Pending

## Context

The plugin needs to generate natural language descriptions in multiple languages. Currently, localization uses a simple custom object structure with string arrays (`uiLabels` in `src/index.js`).

### Current implementation

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

5. **No fallback mechanism**: Missing translations cause errors rather than graceful fallbacks

### Key requirement: Contributor accessibility

The primary driver for choosing an i18n framework is **maintainability through contributor accessibility**:

- Translators should be able to add/edit translations without touching JavaScript
- Standard file formats (JSON, YAML, PO) enable use of translation tools (Crowdin, Weblate, POEditor)
- Non-technical accessibility advocates can contribute localizations
- While UML diagram users may be technical, Mermaid users come from diverse fields and primarily value accessibility

## Options

### Option A: format-message

Lightweight ICU MessageFormat implementation.

### Option B: i18next

Full-featured i18n framework, widely used.

### Option C: @formatjs/intl

React ecosystem standard (part of FormatJS/react-intl).

### Option D: Keep custom implementation

Extend the current simple approach with pluralization rules.

## Multi-criteria decision matrix

Based on the [ICT Research Methods - Multi-criteria decision making](https://ictresearchmethods.nl/workshop/multi-criteria-decision-making/) approach.

### Criteria (weighted)

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Contributor accessibility | 5 | Can non-developers add translations via standard files/tools? |
| Pluralization support | 4 | Handles complex plural forms (Dutch, Russian, Arabic)? |
| Bundle size | 3 | Impact on plugin size |
| Translation tooling | 4 | Integration with Crowdin, Weblate, POEditor, etc. |
| Documentation | 2 | Quality of docs and community support |
| Maintenance burden | 3 | Long-term effort to maintain |

### Scoring (1-5, higher is better)

| Criterion | Weight | A: format-message | B: i18next | C: @formatjs | D: Custom |
|-----------|--------|-------------------|------------|--------------|-----------|
| Contributor accessibility | 5 | 3 | 5 | 3 | 1 |
| Pluralization support | 4 | 5 | 5 | 5 | 2 |
| Bundle size | 3 | 5 | 2 | 3 | 5 |
| Translation tooling | 4 | 3 | 5 | 4 | 1 |
| Documentation | 2 | 3 | 5 | 4 | 2 |
| Maintenance burden | 3 | 4 | 3 | 3 | 2 |

### Weighted scores

| Option | Calculation | Total |
|--------|-------------|-------|
| A: format-message | (5×3)+(4×5)+(3×5)+(4×3)+(2×3)+(3×4) | 15+20+15+12+6+12 = **80** |
| B: i18next | (5×5)+(4×5)+(3×2)+(4×5)+(2×5)+(3×3) | 25+20+6+20+10+9 = **90** |
| C: @formatjs | (5×3)+(4×5)+(3×3)+(4×4)+(2×4)+(3×3) | 15+20+9+16+8+9 = **77** |
| D: Custom | (5×1)+(4×2)+(3×5)+(4×1)+(2×2)+(3×2) | 5+8+15+4+4+6 = **42** |

## Decision

Status: *Pending - requires evaluation*

Based on the multi-criteria analysis, **Option B (i18next)** scores highest (90 points) primarily due to:

1. **Best contributor accessibility** - Standard JSON files, widely known format
2. **Excellent translation tooling** - Supported by Crowdin, Weblate, Lokalise, POEditor
3. **Strong pluralization** - Full ICU-like plural rules support
4. **Large community** - Well-documented, many examples, active maintenance

The larger bundle size (~40KB vs ~3KB) is a trade-off, but acceptable given:

- This is a build-time plugin, not runtime code shipped to users
- The accessibility benefits outweigh the size cost
- Contributor accessibility is the primary driver for adoption

## Example with i18next

Translation file `locales/nl/translation.json`:

```json
{
  "classCount_one": "{{count}} klasse",
  "classCount_other": "{{count}} klassen",
  "relationCount_one": "{{count}} relatie",
  "relationCount_other": "{{count}} relaties",
  "classDiagram": "Klassendiagram met {{classCount}} en {{relationCount}}"
}
```

Usage in code:

```javascript
import i18next from 'i18next';

await i18next.init({
  lng: 'nl',
  resources: {
    nl: { translation: require('./locales/nl/translation.json') }
  }
});

// Usage
i18next.t('classCount', { count: 3 });
// Output: "3 klassen"

i18next.t('classCount', { count: 1 });
// Output: "1 klasse"
```

## Consequences

If i18next is chosen:

- Translation files are separate JSON - editable by non-developers
- Can integrate with translation platforms (Crowdin, Weblate)
- Remove all `(n)/(s)` hacks
- Bundle size increases (~40KB) - acceptable for build-time plugin
- Can support additional languages more easily
- Screenreader experience improves (no parentheses pauses)
- Lower barrier for community translations

## Actions

1. [ ] Prototype with format-message
2. [ ] Measure bundle size impact
3. [ ] Migrate existing strings
4. [ ] Test with screenreaders
5. [ ] Update documentation

## References

- GitHub Issue: https://github.com/bartvanderwal/remark-kroki-a11y/issues/20
- Related: Issue #15 (screenreader prosody)
- ICU Message Format: https://unicode-org.github.io/icu/userguide/format_parse/messages/
- format-message: https://github.com/format-message/format-message
- i18next: https://www.i18next.com/

---

*Date: 2026-02-09*
*Author: Bart van der Wal & Claude*
