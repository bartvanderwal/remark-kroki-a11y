# ADR: Deterministic parsing vs live LLM for natural language descriptions

## Status

Accepted

## Context

To generate accessible natural language descriptions of diagrams (PlantUML, Mermaid, etc.), there are two fundamentally different approaches:

1. **Live LLM integration** - Send diagram source to an LLM (e.g., OpenAI, Claude) at build time to generate descriptions
2. **Deterministic parsing** - Write parsers that transform diagram syntax into natural language using fixed rules

This is a foundational architectural decision that affects reliability, reproducibility, and the overall nature of the tool.

## Options

### Option A: Live LLM integration

Use an LLM API to generate natural language descriptions from diagram source code at build time.

**Pros:**

- Potentially more "natural" sounding descriptions
- Can handle arbitrary diagram complexity
- Less code to maintain (outsource intelligence to LLM)
- Could adapt to new diagram types without code changes

**Cons:**

- **Non-deterministic**: Same input may produce different output on each build
- **Hallucination risk**: LLM may describe elements that don't exist or misinterpret the diagram
- **Security concerns**: Potential for prompt injection via diagram source code
- **API dependency**: Requires API keys, network access, rate limits, costs
- **Build reproducibility**: Breaks reproducible builds (different output each time)
- **Offline builds impossible**: Cannot build documentation without internet
- **Latency**: API calls add build time
- **Privacy**: Diagram content sent to third-party service

### Option B: Deterministic parsing (chosen)

Write parsers that analyze diagram AST/syntax and generate natural language using fixed transformation rules.

**Pros:**

- **Deterministic**: Same input always produces same output
- **Reproducible builds**: Documentation builds are consistent
- **No hallucination**: Output is exactly what the parser is designed to produce
- **Offline capable**: No external dependencies at build time
- **No API costs**: Free to run
- **Fast**: No network latency
- **Secure**: No code injection risk via LLM prompts
- **Auditable**: Parser behavior can be inspected and tested

**Cons:**

- More development effort to write parsers
- May produce less "natural" sounding descriptions
- New diagram types require new parser code
- Complex diagrams may result in verbose descriptions

## Decision

We choose **Option B: Deterministic parsing**.

The development of the parsers themselves is AI-enhanced (using tools like GitHub Copilot and Claude), but the resulting code is deterministic. This gives us the best of both worlds:

- AI assists in writing the parsers (development speed)
- The parsers produce deterministic, reliable output (runtime reliability)

This approach aligns with the principle that documentation builds should be reproducible and that accessibility features must be reliable - a screen reader user should get the same description every time they visit a page.

## Consequences

- Parser code must be written for each supported diagram type (PlantUML, Mermaid, C4, etc.)
- Descriptions follow consistent patterns and terminology
- Build output is deterministic and can be tested
- No runtime dependencies on external AI services
- Development uses AI-assisted coding, but production code is traditional deterministic logic

## References

- WCAG 2.1 - Consistent, predictable behavior is an accessibility requirement
- Reproducible Builds: https://reproducible-builds.org/

---

*Date: 2026-02-09*
*Author: Bart van der Wal & Claude*
