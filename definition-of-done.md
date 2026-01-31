# Definition of Done

Dit document beschrijft de criteria waaraan een feature of bugfix moet voldoen voordat deze als "Done" wordt beschouwd.

## Acceptatiecriteria

Elke taak/feature moet acceptatiecriteria hebben voordat deze als Done kan worden beschouwd:

- [ ] **Acceptatiecriteria gedefinieerd** - Duidelijke, testbare criteria voor de feature
- [ ] **BDD tests geschreven** - Acceptatiecriteria vertaald naar `.feature` bestanden

Zie bestaande voorbeelden in de `features/` map:

- [features/basic-classdiagram.feature](features/basic-classdiagram.feature) - Basis klassediagram parsing
- [features/sequence-diagram.feature](features/sequence-diagram.feature) - Sequentiediagram parsing
- [features/unsupported-diagrams.feature](features/unsupported-diagrams.feature) - Fallback voor niet-ondersteunde types

## Code Kwaliteit

- [ ] **ESLint passes** - Geen linting errors (`yarn lint`)
- [ ] **Markdownlint passes** - Documentatie volgt markdown best practices
- [ ] **Syntax geldig** - `node -c src/index.js` slaagt zonder errors

## Build & Runtime

- [ ] **Compileert** - `yarn build` voltooit zonder errors
- [ ] **Draait correct** - `yarn start` start zonder runtime errors
- [ ] **Package werkt** - `npm pack` of `yarn pack` slaagt

## Testing

- [ ] **BDD tests slagen** - Alle tests in `yarn test` slagen
- [ ] **Nieuwe features hebben tests** - BDD scenario's toegevoegd voor nieuwe functionaliteit
- [ ] **Geen regressies** - Bestaande tests slagen nog steeds

## Documentatie

- [ ] **Links werken** - Docusaurus link checker slaagt (`onBrokenLinks: 'throw'` is enabled)
- [ ] **README bijgewerkt** - Nieuwe opties of features gedocumenteerd
- [ ] **Changelog bijgewerkt** - (indien van toepassing)

## Docusaurus Test Site

- [ ] **Site bouwt** - `cd test-docusaurus-site && yarn build` slaagt
- [ ] **Site draait** - `yarn start` toont de site correct
- [ ] **Voorbeeld toegevoegd** - Bij nieuwe diagram types is er een voorbeeld pagina in `test-docusaurus-site/docs/examples/`

## Pre-commit Checks

De pre-commit hook (Husky) voert automatisch uit:

1. Check op `package-lock.json` (warning - we gebruiken yarn)
2. Check op aanwezigheid `yarn.lock` (warning)
3. **BDD tests** (blocking - moet slagen om te committen)

## Checklist voor specifieke wijzigingen

### Nieuwe Diagram Parser

- [ ] Parser bestand aangemaakt in `src/parsers/`
- [ ] BDD feature file aangemaakt in `features/`
- [ ] Step definitions toegevoegd/uitgebreid in `features/steps/`
- [ ] Nederlandse (nl) en Engelse (en) lokalisatie
- [ ] Voorbeeld pagina in test-docusaurus-site (NL + EN versie)

### Bug Fix

- [ ] Falende test toegevoegd die de bug reproduceert
- [ ] Fix geïmplementeerd
- [ ] Test slaagt na fix

### Documentatie

- [ ] Spelling gecontroleerd
- [ ] Links gevalideerd
- [ ] Screenshots/voorbeelden bijgewerkt indien nodig
