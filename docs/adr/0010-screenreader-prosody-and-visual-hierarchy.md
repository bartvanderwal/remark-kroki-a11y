# ADR: Screenreader prosody and visual hierarchy for natural language descriptions

## Status

Pending

## Context

The current natural language descriptions for activity diagrams are functional but have several areas for improvement regarding screenreader experience and visual presentation:

1. **Reading tempo and cadence**: Screenreaders may read the description too fast or with incorrect pacing, making it difficult for users to follow the flow of activities.

2. **Distinguishing labels from content**: Words like "Stap" (Step) or "Beslissing" (Decision) are structural labels, while the text that follows is the actual content. Currently, there's no auditory or visual distinction between these - a screenreader reads "Stap. process all diagrams" as a continuous phrase without indicating that "Stap" is a type indicator.

3. **Word concatenation issues**: Screenreaders may incorrectly join words together when reading, leading to an unnatural cadence that makes comprehension harder.

4. **Visual indentation for nested structures**: Partitions, parallel executions, and loops create nested structures. While the text indicates nesting through "bestaande uit:" (consisting of) and "Einde" (End) markers, the visual presentation in the "Natuurlijke taal" tab currently shows everything at the same indentation level. Adding visual indentation for sub-steps within partitions or parallel flows would improve readability for sighted users while maintaining the same semantic content for screenreaders.

5. **Pause and emphasis control**: HTML/ARIA provides limited control over how screenreaders interpret pauses and emphasis. SSML (Speech Synthesis Markup Language) offers more control but is not supported by most screenreaders in browser contexts.

6. **Quotes are ignored**: Attempts to use quotation marks around step content (e.g., `Stap. "process all diagrams"`) to create pauses or differentiation are ignored by screenreaders in Chrome - they read through the quotes without any change in prosody. This means quotes add visual noise without providing auditory benefit and could be removed.

## Options

TODO - Research needed:

- **Option 1: ARIA attributes for structure** - Use `aria-label`, `role`, and other ARIA attributes to provide better semantic hints to screenreaders
- **Option 2: Punctuation-based pauses** - Strategic use of periods, commas, and colons to influence screenreader pacing
- **Option 3: CSS-based visual indentation** - Add indentation styling for nested elements in the visual presentation without changing the underlying text
- **Option 4: Separate visual and audio descriptions** - Generate two versions: one optimized for visual display with indentation, one optimized for screenreader flow
- **Option 5: User testing and iteration** - Conduct usability testing with actual screenreader users to identify specific pain points before choosing technical solutions

## Decision

(Pending research and options evaluation)

## Consequences

(To be determined after decision)

## References

- [WCAG 2.1 - Reading Level](https://www.w3.org/WAI/WCAG21/Understanding/reading-level.html)
- [WebAIM - Designing for Screen Reader Compatibility](https://webaim.org/techniques/screenreader/)
- [MDN - ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [W3C - SSML (Speech Synthesis Markup Language)](https://www.w3.org/TR/speech-synthesis11/)

---

*Date*: 2026-02-05
*Author*: Bart van der Wal & Claude Code
