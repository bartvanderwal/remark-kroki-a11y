# Definition of Done

This document defines the criteria that a feature or bug fix must meet before it is considered "Done".

## Acceptance Criteria

Each task/feature must have acceptance criteria before it can be considered Done:

- [ ] **Acceptance criteria defined** - Clear, testable criteria for the feature
- [ ] **BDD tests written** - Acceptance criteria translated into `.feature` files

See existing examples in the `features/` folder:

- [features/basic-classdiagram.feature](features/basic-classdiagram.feature) - Basic class diagram parsing
- [features/sequence-diagram.feature](features/sequence-diagram.feature) - Sequence diagram parsing
- [features/unsupported-diagrams.feature](features/unsupported-diagrams.feature) - Fallback for unsupported types

## Code Quality

- [ ] **ESLint passes** - No linting errors (`yarn lint`)
- [ ] **Markdownlint passes** - Documentation follows markdown best practices
- [ ] **Valid syntax** - `node -c src/index.js` succeeds without errors

## Build & Runtime

- [ ] **Compiles** - `yarn build` completes without errors
- [ ] **Runs correctly** - `yarn start` starts without runtime errors
- [ ] **Package works** - `npm pack` or `yarn pack` succeeds

## Testing

- [ ] **BDD tests pass** - All tests in `yarn test` pass
- [ ] **New features have tests** - BDD scenarios added for new functionality
- [ ] **No regressions** - Existing tests still pass

## Documentation

- [ ] **Links work** - Docusaurus link checker passes (`onBrokenLinks: 'throw'` is enabled)
- [ ] **README updated** - New options or features documented
- [ ] **Changelog updated** - (if applicable)

## Docusaurus Test Site

- [ ] **Site builds** - `cd test-docusaurus-site && yarn build` succeeds
- [ ] **Site runs** - `yarn start` shows the site correctly
- [ ] **Example added** - For new diagram types, an example page exists in `test-docusaurus-site/docs/examples/`

## Pre-commit Checks

The pre-commit hook (Husky) automatically runs:

1. Check for `package-lock.json` (warning - we use yarn)
2. Check for `yarn.lock` presence (warning)
3. **BDD tests** (blocking - must pass before commit)

## Checklist for Specific Changes

### New Diagram Parser

- [ ] Parser file created in `src/parsers/`
- [ ] BDD feature file created in `features/`
- [ ] Step definitions added/extended in `features/steps/`
- [ ] Dutch (nl) and English (en) localization
- [ ] Example page in test-docusaurus-site (NL + EN version)

### Bug Fix

- [ ] Failing test added that reproduces the bug
- [ ] Fix implemented
- [ ] Test passes after the fix

### Documentation

- [ ] Spelling checked
- [ ] Links validated
- [ ] Screenshots/examples updated if needed
