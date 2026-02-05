# ADR: No automatic step numbering in activity diagram descriptions

## Status

Accepted

## Context

The remark-kroki-a11y plugin generates natural language descriptions for PlantUML activity diagrams, making them accessible to screenreader users. An early implementation choice was to automatically number each step in the generated description (e.g., "Step 1. Prepare ingredients", "Step 2. Cook food").

However, PlantUML itself does **not** support an `autonumber` directive for activity diagrams. The `autonumber` keyword only exists for sequence diagrams. There is an open feature request for hierarchical numbering in PlantUML activity diagrams ([plantuml/plantuml#1848](https://github.com/plantuml/plantuml/issues/1848)), but it has not been implemented.

This raises several concerns:

1. **Conflict with user-defined numbering**: If a diagram author manually numbers their activities (e.g., "1. Prepare", "2. Cook"), the plugin's auto-numbering would create confusing double-numbering ("Step 1. 1. Prepare").

2. **Future PlantUML `autonumber` support**: If PlantUML eventually adds `autonumber` for activity diagrams, the plugin's own numbering would conflict with the native numbering visible in the rendered diagram image.

3. **Nested structures break sequential numbering**: Activity diagrams contain parallel executions (fork/join), loops (while/repeat), and partitions. A flat sequential number does not meaningfully represent the structure of these constructs. Step 5 inside a parallel branch has no meaningful sequential relationship to Step 4 in a different branch.

4. **Cognitive complexity**: Large activity diagrams with many numbered steps are inherently difficult to follow. Rather than making them slightly easier with numbering, it is better to encourage authors to keep diagrams small and focused - using overview diagrams that link to detail diagrams, as demonstrated in the "Little Red Riding Hood" UML example pages.

## Options

- **Option 1: Keep automatic step numbering**
  Continue generating "Step 1.", "Step 2.", etc. for each activity in the description.
  - Pro: Provides a reference point for discussing specific steps
  - Con: Conflicts with user-defined or future PlantUML numbering; breaks down with nested structures

- **Option 2: Remove step numbering, add structural markers**
  Use a plain "Step." prefix without numbers. Instead, invest in explicit structural markers: begin/end markers for parallel execution blocks, partitions, and loops. Number only the structural constructs (e.g., "Parallel execution 1", "Parallel execution 2") to disambiguate nested blocks.
  - Pro: No conflict with diagram-level numbering; accurately represents nesting structure; robust for screenreader navigation
  - Con: Individual steps cannot be referenced by number

- **Option 3: Let users control numbering via a plugin option**
  Add a configuration option (e.g., `autoNumber: true/false`) to let users decide.
  - Pro: Maximum flexibility
  - Con: Added complexity; still has the same fundamental problems with nested structures when enabled

## Decision

We choose **Option 2: Remove step numbering, add structural markers**.

Activities are prefixed with a plain label ("Step." / "Stap.") without a number. Structural constructs use explicit begin/end markers with numbering only where needed for disambiguation:

- **Partitions**: `Partition A: <name>, consisting of:` ... `End partition A.`
- **Parallel execution**: `Parallel execution 1, consisting of:` / `Branch 1:` / `Branch 2:` ... `End parallel execution 1.` (numbered globally to disambiguate nested forks)
- **Loops**: `Repeat while <condition>, consisting of:` ... `End repeat.`
- **Decisions**: `Decision: <condition>` (no step prefix)

### Why keep the "Step." prefix?

While we remove the *numbers*, we explicitly keep the word "Step." (or "Stap." in Dutch) as a prefix for activities. This provides essential **semantic context** for screenreader users:

- Without the prefix, the description becomes an undifferentiated stream of words with no indication of element type
- The prefix tells the listener "this is an activity/step" vs. "this is a decision" vs. "this is a parallel execution block"
- Similarly, prefixes like "Decision:", "Partition:", and "Parallel execution" give meaning to what follows

This is analogous to how a sighted user visually distinguishes rounded rectangles (activities) from diamonds (decisions) in the diagram - the prefix provides the same semantic differentiation in text form.

This approach:

- Avoids any conflict with user-defined or future PlantUML-native numbering
- Accurately represents the hierarchical and parallel structure of activity diagrams for screenreader users
- Preserves semantic context through type prefixes ("Step.", "Decision:", "Partition:", etc.)
- Uses numbered identifiers only for parallel execution blocks, which genuinely need disambiguation in nested scenarios
- Encourages diagram authors to keep diagrams small and use overview/detail patterns for complex flows (see the "Little Red Riding Hood" example in the test-docusaurus-site)

## Consequences

- The `generateAccessibleDescription` function in `activityDiagramParser.js` no longer tracks a global step counter
- A global `forkCounter` is introduced to assign unique numbers to parallel execution blocks
- BDD test scenarios are updated to reflect the new output format (both Dutch and English)
- Users who want numbered steps should number them explicitly in their PlantUML diagram text, which is the approach consistent with how PlantUML sequence diagrams work (user-controlled `autonumber`)

## References

- PlantUML issue: [Set autonumber value only for subsequences (#1848)](https://github.com/plantuml/plantuml/issues/1848) - Open feature request for `autonumber` in activity diagrams
- PlantUML documentation: [Sequence Diagram autonumber](https://plantuml.com/sequence-diagram#autonumber) - The existing `autonumber` feature (sequence diagrams only)
- [ADR-0005: Navigable a11y descriptions](0005-navigeerbare-a11y-beschrijvingen.md) - Related decision on keeping diagrams small

---

*Date*: 2026-02-05
*Author*: Bart van der Wal & Claude Code
