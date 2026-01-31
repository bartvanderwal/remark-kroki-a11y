# Contributing to remark-kroki-a11y

Thanks for considering a contribution! This plugin is plain JavaScript (no build step) and is tested primarily in Docusaurus.

For complete quality standards and acceptance criteria, see the [Definition of Done](definition-of-done.md).

## Prerequisites

- Node.js >= 16
- npm or yarn

## Local development

1. Install dependencies:

  ```bash
  npm install
  # or
  yarn install
  ```

2. Make changes in `src/` (the entry point is `src/index.js`).

3. Run basic sanity checks:
  - Ensure `npm pack` or `yarn pack` succeeds.
  - Optionally run `node -c src/index.js` to catch syntax errors.

## Running BDD tests

BDD tests are located in the `test/` directory. Run them with:

```bash
yarn test
# or
npm test
```

These tests will execute all `.feature` files and check a11y functionality and rendering.

## Manual testing with Docusaurus

To manually test the plugin in a Docusaurus site, use the example markdown file in `test-docusaurus-site/plantuml-examples.md`.

This file contains various PlantUML diagram scenarios:

- Diagram only
- Source code only (expandable)
- Diagram + source code
- Diagram + source code + a11y description/tab

You can copy or import this file into your test Docusaurus site to verify plugin behavior.

See the README for more info on plugin configuration.

## Testing in a Docusaurus site

You can link the plugin into a local Docusaurus project to verify behavior:

### Test Option A: `npm link`

```bash
# In this repo
npm link
# In your Docusaurus project
npm link remark-kroki-a11y
```

### Test Option B: file dependency

```bash
# In the Docusaurus project package.json
"remark-kroki-a11y": "file:../remark-kroki-a11y"

# Then install
npm install
# or
yarn install
```

Update the Docusaurus `remarkPlugins` order so this plugin runs **before** `remark-kroki-plugin` (see README for the snippet).

## Publishing (maintainers)

- Bump version in `package.json` following semver.
- Run `npm pack` to confirm the tarball includes expected files.
- Publish: `npm publish` (ensure you are logged in to npm with the right scope).

## Coding style

- Keep the codebase compatible with Node 16 and CommonJS.
- Use plain JS, no build tooling required.
- Prefer small, isolated functions; add inline comments only where non-obvious.

## Definition of Done

Before submitting a PR, ensure your changes meet the following criteria:

### Code Quality

- [ ] **ESLint passes** - No linting errors (`yarn lint` or configured in IDE)
- [ ] **Markdownlint passes** - Documentation follows markdown best practices
- [ ] **Syntax valid** - `node -c src/index.js` succeeds without errors

### Build & Runtime

- [ ] **Compiles** - `yarn build` completes without errors
- [ ] **Runs correctly** - `yarn start` launches without runtime errors
- [ ] **Package works** - `npm pack` or `yarn pack` succeeds

### Testing

- [ ] **BDD tests pass** - All tests in `yarn test` succeed
- [ ] **New features have tests** - Added BDD scenarios for new functionality
- [ ] **No regressions** - Existing tests still pass

### Documentation

- [ ] **Links work** - Docusaurus link checker passes (`onBrokenLinks: 'throw'` is enabled)
- [ ] **README updated** - New options or features documented
- [ ] **Changelog updated** - (if applicable)

### Pre-commit Checks

The pre-commit hook (Husky) automatically runs:

1. Check for `package-lock.json` (warning - we use yarn)
2. Check for `yarn.lock` presence (warning)
3. **BDD tests** (blocking - must pass to commit)

## Issues and PRs

- When filing issues, include a minimal code block that reproduces the problem (diagram type, meta flags, expected vs actual).
- For PRs, describe the change, testing steps, and any new options added.
