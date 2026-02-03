# ADR: Test Strategie met Storybook en Playwright

## Status

Accepted

## Context

De `remark-kroki-a11y` plugin genereert HTML met interactieve tab-componenten voor diagram broncode en natuurlijke taal beschrijvingen. Deze componenten moeten toegankelijk zijn voor:

1. **Keyboard navigatie** - Gebruikers moeten met Tab/Enter kunnen navigeren
2. **Screen readers** - ARIA attributen moeten correct zijn voor voorleessoftware
3. **Visuele weergave** - CSS moet correct laden en tabs moeten werken

Er zijn verschillende test-niveaus nodig (zie ook: Test Pyramid, Fowler 2012):

| Test niveau | Focus | Tools |
|-------------|-------|-------|
| **Unit tests** | Parser logica | Cucumber/Gherkin (BDD) |
| **Component tests** | UI componenten in isolatie | Storybook |
| **Integration tests** | Plugin in Docusaurus | Playwright E2E |

### Probleem: Accessibility Testing Gap

GitHub Issue #10 identificeerde dat tab content niet keyboard-focusbaar was. Dit type bug werd niet gevangen door:
- Unit tests (testen parser output, niet browser gedrag)
- Handmatig testen (developers focussen op visueel, niet keyboard)

We hebben geautomatiseerde accessibility tests nodig op meerdere niveaus.

## Decision

We implementeren een **multi-level test strategie** met:

### 1. Storybook voor Component Testing

- **Framework**: `@storybook/html-vite`
- **A11y Addon**: `@storybook/addon-a11y` voor automatische WCAG scans
- **Interactions Addon**: `@storybook/addon-interactions` voor `play()` functie tests

Stories in `src/stories/` simuleren plugin output en testen:
- Keyboard navigatie flow
- ARIA attributen
- Focus management
- Tab switching gedrag

```javascript
// Voorbeeld: play() functie test
export const KeyboardNavigationTest = {
  play: async ({ canvasElement }) => {
    // Test dat Tab naar content navigeert
    await userEvent.tab();
    expect(document.activeElement).toBe(a11yContent);
  },
};
```

### 2. Playwright voor E2E Testing

- **Framework**: `@playwright/test`
- **Target**: Werkende Docusaurus test site
- **Scope**: Volledige user flows inclusief browser-specifiek gedrag

Tests in `e2e/` verifiëren:
- Plugin werkt correct in echte Docusaurus omgeving
- Keyboard navigatie werkt cross-browser (Chromium, Firefox, WebKit)
- ARIA attributen correct gerenderd na build

```bash
# Run tests
yarn start        # Start Docusaurus site
yarn test:e2e     # Run Playwright tests
```

### 3. Test Commando's

| Commando | Beschrijving |
|----------|--------------|
| `yarn test` | BDD/Cucumber unit tests |
| `yarn storybook` | Interactieve component tests |
| `yarn test:e2e` | Playwright E2E tests |
| `yarn test:e2e:ui` | Playwright met UI |

## Consequences

### Positive

- **Vroege bug detectie**: A11y issues gevonden in Storybook voordat ze in productie komen
- **Cross-browser testing**: Playwright test Chromium, Firefox en WebKit
- **Visuele documentatie**: Storybook dient als interactieve component library
- **CI/CD integratie**: Beide tools kunnen in pipeline draaien
- **WCAG compliance**: Storybook A11y addon checkt automatisch tegen WCAG 2.1

### Negative

- **Extra dependencies**: Storybook en Playwright vergroten node_modules
- **Onderhoud**: Stories moeten bijgewerkt worden bij HTML wijzigingen
- **Test runtime**: E2E tests zijn trager dan unit tests
- **Server vereist**: Playwright tests vereisen draaiende Docusaurus site

### Mitigation

- Storybook tests draaien snel in isolatie
- Playwright tests alleen in CI of voor specifieke features
- Stories genereren waar mogelijk HTML uit dezelfde templates als plugin

## Alternatives Considered

### Alternative 1: Alleen Cypress

Cypress biedt component testing en E2E, maar:
- Minder goede Storybook integratie
- Playwright heeft betere cross-browser support
- Storybook A11y addon heeft geen Cypress equivalent

### Alternative 2: Alleen unit tests

Unit tests alleen zijn onvoldoende omdat:
- Browser gedrag (focus, ARIA) niet getest wordt
- CSS/JS interactie niet getest wordt
- Issue #10 was niet gevangen met unit tests

### Alternative 3: Manual testing only

Handmatig testen is:
- Niet reproduceerbaar
- Niet schaalbaar
- Gevoelig voor menselijke fouten bij A11y checks

## References

- Fowler, M. (2012). [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
- WAI-ARIA Authoring Practices. (2023). [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- Storybook. (2024). [Accessibility Testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- Playwright. (2024). [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

---

*Date: 2026-02-02*
*Author: Bart van der Wal & Claude Code*
