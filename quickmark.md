# Markdown linting

This project uses [Quickmark](https://github.com/ekropotin/quickmark), a fast
CommonMark linter that implements the markdownlint rule set.

## Usage

```bash
qmark .          # lint the whole repo
yarn lint:md     # same, via the npm script
yarn lint        # ESLint + Quickmark
```

Install the CLI with Homebrew:

```bash
brew install quickmark
```

## Configuration

Rules are configured in `quickmark.toml` in the repository root. Disabled rules
and their rationale:

| Rule                      | Why it is off                                       |
| ------------------------- | --------------------------------------------------- |
| `line-length`             | Prose and links stay readable without hard wrapping  |
| `no-bare-urls`            | Plain URLs are used in documentation and ADRs        |
| `no-inline-html`          | Docusaurus docs intentionally use inline HTML        |
| `code-fence-style`        | Existing docs mix backtick and tilde fences          |
| `no-trailing-punctuation` | Preserves the current writing style                  |

Quickmark has no auto-fix mode, so violations must be corrected by hand.

## Resources

- [Quickmark](https://github.com/ekropotin/quickmark)
- [markdownlint rule reference](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
