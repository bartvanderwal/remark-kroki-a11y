import { beforeAll, describe, expect, it } from 'vitest';

let simplifyPlantUMLClassDiagram;
let generateDevModePlantUMLClassDiagram;

beforeAll(async () => {
  const module = await import('./classDiagramSimplifier.js');
  simplifyPlantUMLClassDiagram = module.simplifyPlantUMLClassDiagram;
  generateDevModePlantUMLClassDiagram = module.generateDevModePlantUMLClassDiagram;
});

describe('simplifyPlantUMLClassDiagram', () => {
  it('converts relation types to simple arrows and removes id attributes', () => {
    const source = `@startuml
class Order {
  +id : UUID
  +orderNumber : String
}
class Customer {
  +id : UUID
  +name : String
}
Order o-- Customer : belongsTo
@enduml`;

    const simplified = simplifyPlantUMLClassDiagram(source);

    expect(simplified).toContain('Order --> Customer : belongsTo');
    expect(simplified).not.toContain('+id : UUID');
    expect(simplified).toContain('+orderNumber');
    expect(simplified).toContain('+name');
    expect(simplified).not.toContain('+orderNumber : String');
    expect(simplified).not.toContain('+name : String');
  });

  it('returns null when no classes are detected', () => {
    const source = `@startuml
Alice -> Bob : Hello
@enduml`;

    const simplified = simplifyPlantUMLClassDiagram(source);
    expect(simplified).toBeNull();
  });

  it('hides custom stereotypes in simpler mode', () => {
    const source = `@startuml
class Customer <<Entity>> {
  +id : UUID
  +name : String
}
class Address <<Value Object>> {
  +street : String
}
Customer -- Address
@enduml`;

    const simplified = simplifyPlantUMLClassDiagram(source);

    expect(simplified).toContain('class Customer {');
    expect(simplified).toContain('class Address {');
    expect(simplified).not.toContain('<<Entity>>');
    expect(simplified).not.toContain('<<Value Object>>');
  });

  it('does not add a legend in simpler mode, even when enabled', () => {
    const source = `@startuml
class Order {
  +id : UUID
  +orderNumber : String
}
class Customer
Order --> Customer
@enduml`;

    const simplified = simplifyPlantUMLClassDiagram(source, { showLegend: true, locale: 'en' });

    expect(simplified).not.toContain('legend right');
    expect(simplified).not.toContain('endlegend');
  });
});

describe('generateDevModePlantUMLClassDiagram', () => {
  it('duplicates non-dependency relations as attributes in the source class', () => {
    const source = `@startuml
class Order {
  +id : UUID
}
class Customer
class PaymentService
Order --> Customer : customer
Order ..> PaymentService : uses
@enduml`;

    const devMode = generateDevModePlantUMLClassDiagram(source);

    expect(devMode).toContain('-customer : Customer');
    expect(devMode).toContain('Order --> Customer : customer');
    expect(devMode).toContain('Order ..> PaymentService : uses');
    expect(devMode).not.toContain('-uses : PaymentService');
  });

  it('uses array attributes when relation multiplicity indicates many', () => {
    const source = `@startuml
class Order
class OrderLine
Order "1" --> "*" OrderLine : lines
@enduml`;

    const devMode = generateDevModePlantUMLClassDiagram(source);
    expect(devMode).toContain('-lines : OrderLine[]');
  });

  it('keeps aggregation and composition when multiplicities are present', () => {
    const source = `@startuml
class Order
class Customer
class OrderLine
Order "1" o-- "1" Customer : customer
Order "1" *-- "*" OrderLine : lines
@enduml`;

    const devMode = generateDevModePlantUMLClassDiagram(source, { showLegend: true, locale: 'en' });

    expect(devMode).toContain('Order o--> Customer : customer');
    expect(devMode).toContain('Order *--> OrderLine : lines');
    expect(devMode).toContain('◇→ : aggregation');
    expect(devMode).toContain('◆→ : composition');
  });

  it('adds a relation legend in dev mode with only used relation types', () => {
    const source = `@startuml
class Order
class Customer
Order ..> Customer : uses
@enduml`;

    const devMode = generateDevModePlantUMLClassDiagram(source, { showLegend: true, locale: 'en' });

    expect(devMode).toContain('legend right');
    expect(devMode).toContain('<b>Relations</b>');
    expect(devMode).toContain('⇢ : dependency');
    expect(devMode).not.toContain('◆→ : composition');
    expect(devMode).not.toContain('*--> : composition');
    expect(devMode).toContain('endlegend');
  });
});
