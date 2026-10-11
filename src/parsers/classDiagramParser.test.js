import { describe, expect, it } from 'vitest';
import classDiagramParser from './classDiagramParser.js';

describe('class diagram accessible descriptions', () => {
  it('includes dependency names and lists using classes before their dependencies', () => {
    const source = `@startuml
class FizzBuzzer {
  +fizzBuzz(n: int): String
}
class Main {
  +main(args: String[]): void
}
Main ..> FizzBuzzer : uses
@enduml`;
    const parsed = classDiagramParser.parsePlantUMLClassDiagram(source);
    const description = classDiagramParser.generateAccessibleDescription(parsed, 'en');

    expect(description).toContain("Main has a dependency to named 'uses' with FizzBuzzer");
    expect(description.indexOf('<strong>Class Main</strong>')).toBeLessThan(
      description.indexOf('<strong>Class FizzBuzzer</strong>')
    );
  });
});
