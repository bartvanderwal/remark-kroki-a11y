import { beforeAll, describe, expect, it } from 'vitest';

let runtime;

beforeAll(async () => {
  runtime = await import('./a11yRuntime.js');
});

describe('a11yRuntime.generateA11yFromSource', () => {
  it('uses the sequence parser for PlantUML sequence syntax', () => {
    const source = `@startuml
Alice -> Bob: Hello Bob!
Bob --> Alice: Hi Alice!
@enduml`;
    const result = runtime.generateA11yFromSource({
      imgType: 'plantuml',
      content: source,
      locale: 'en',
    });

    expect(result.diagramType).toBe('sequenceDiagram');
    expect(result.a11yText).toContain('Sequence diagram');
    expect(result.a11yText).toContain('Alice');
    expect(result.a11yText).toContain('Bob');
  });

  it('uses the domain story parser for DomainStory include syntax', () => {
    const source = `@startuml
!include <DomainStory/domainStory>
Person(Alice, "Alice")
Person(Bob, "Bob")
activity(1, Alice, talks about the, Info: weather, with, Bob)
@enduml`;
    const result = runtime.generateA11yFromSource({
      imgType: 'plantuml',
      content: source,
      locale: 'en',
    });

    expect(result.diagramType).toBe('domainStory');
    expect(result.a11yText).toContain('Domain story with 1 activities.');
    expect(result.a11yText).toContain('Alice talks about the weather with Bob.');
  });
});
