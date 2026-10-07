import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const names = {
  class: 'classDiagramParser',
  state: 'stateDiagramParser',
  sequence: 'sequenceDiagramParser',
  activity: 'activityDiagramParser',
  pie: 'pieDiagramParser',
  domainStory: 'domainStoryParser',
  c4: 'c4DiagramParser'
};
const items = count => Array.from({ length: count }, (_, index) => ({
  name: `Item${index}`, id: `item${index}`, alias: `Item${index}`,
  attributes: [], methods: []
}));
const diagrams = count => ({
  class: {
    classes: Object.fromEntries(items(count).map(item => [item.name, item])),
    relations: items(count).map(() => ({ from: 'A', to: 'B', type: 'association' })),
    notes: []
  },
  state: {
    states: items(count).map(item => item.name),
    transitions: items(count).map(() => ({ from: 'A', to: 'B' })),
    finalStates: [], initialState: null
  },
  sequence: { participants: items(count), messages: [] },
  activity: { elements: [], activityCount: count, decisionCount: count, partitionCount: 0 },
  pie: { title: null, segments: items(count).map(item => ({ label: item.name, value: 1 })) },
  domainStory: { activities: items(count).map(() => ({ subject: 'Actor', predicate: 'acts' })) },
  c4: { actors: items(count), systems: [], components: [], containers: [], relationships: [] }
});
const words = {
  en: {
    class: ['class', 'classes'], state: ['state', 'states'],
    sequence: ['participant', 'participants'], activity: ['activity', 'activities'],
    pie: ['segment', 'segments'], domainStory: ['activity', 'activities'], c4: ['actor', 'actors']
  },
  nl: {
    class: ['klasse', 'klassen'], state: ['toestand', 'toestanden'],
    sequence: ['deelnemer', 'deelnemers'], activity: ['activiteit', 'activiteiten'],
    pie: ['segment', 'segmenten'], domainStory: ['activiteit', 'activiteiten'], c4: ['actor', 'actoren']
  }
};

describe.each(['js', 'cjs'])('parser localization (%s)', extension => {
  const parsers = Object.fromEntries(Object.entries(names).map(([section, name]) =>
    [section, require(`./${name}.${extension}`)]));

  describe.each(['en', 'nl'])('%s plurals', locale => {
    it.each([0, 1, 3])('formats count %s without parenthesized endings', count => {
      const parsed = diagrams(count);
      for (const [section, parser] of Object.entries(parsers)) {
        const description = parser.generateAccessibleDescription(parsed[section], locale);
        expect(description).not.toMatch(/\((?:s|n|es|en)\)/);
        if (section === 'pie' && count === 0) {
          expect(description).toBe(locale === 'nl' ? 'Taartdiagram zonder segmenten.' : 'Pie chart with no segments.');
        } else {
          expect(description).toContain(`${count} ${words[locale][section][count === 1 ? 0 : 1]}`);
        }
      }
    });

    it.each([1, 3])('formats relation, transition, partition and final-state counts %s', count => {
      const parsed = diagrams(count);
      const plural = count !== 1;
      expect(parsers.class.generateAccessibleDescription(parsed.class, locale)).toContain(
        `${count} ${locale === 'nl' ? (plural ? 'relaties' : 'relatie') : (plural ? 'relations' : 'relation')}`);
      parsed.state.finalStates = parsed.state.states;
      expect(parsers.state.generateAccessibleDescription(parsed.state, locale)).toContain(
        `${locale === 'nl' ? (plural ? 'Eindtoestanden' : 'Eindtoestand') : (plural ? 'Final states' : 'Final state')}:`);
      expect(parsers.state.generateAccessibleDescription(parsed.state, locale)).toContain(
        `${count} ${locale === 'nl' ? (plural ? 'overgangen' : 'overgang') : (plural ? 'transitions' : 'transition')}`);
      parsed.activity.partitionCount = count;
      const activity = parsers.activity.generateAccessibleDescription(parsed.activity, locale);
      expect(activity).toContain(`${count} ${locale === 'nl' ? (plural ? 'partities' : 'partitie') : (plural ? 'partitions' : 'partition')}`);
      expect(activity).toContain(`${count} ${locale === 'nl' ? (plural ? 'beslispunten' : 'beslispunt') : (plural ? 'decision points' : 'decision point')}`);
    });

    it.each([0, 1, 3])('formats method parameters %s', count => {
      const parsed = diagrams(1).class;
      parsed.classes.Item0.methods = [{
        name: 'run', visibility: '+', returnType: 'void',
        parameters: items(count).map(item => ({ name: item.name, type: 'String' }))
      }];
      const description = parsers.class.generateAccessibleDescription(parsed, locale);
      expect(description).toContain(count === 0
        ? (locale === 'nl' ? 'zonder parameters' : 'without parameters')
        : `${locale === 'nl' ? 'met' : 'with'} ${count === 1 ? 'parameter' : 'parameters'} 'Item0'`);
      expect(description).not.toContain('parameter(s)');
    });
  });

  it.each([0, 1, 3])('uses French plural rules for count %s and English per-message fallback', count => {
    const translations = { fr: { class: {
      classDiagram: 'Diagramme de classes',
      withClasses: 'avec {count, plural, one {# classe} other {# classes}}'
    } } };
    const description = parsers.class.generateAccessibleDescription(diagrams(count).class, 'fr', translations);
    expect(description).toContain(`Diagramme de classes avec ${count} ${count < 2 ? 'classe' : 'classes'} and ${count} ${count === 1 ? 'relation' : 'relations'}.`);
    expect(description).not.toContain('{count');
  });

  it.each([[0, 'many'], [1, 'one'], [2, 'few'], [5, 'many'], [21, 'one'], [1.5, 'other']])(
    'uses Russian plural category for %s', (count, category) => {
      const translations = { ru: { activity: {
        withActivities: '{count, plural, one {one} few {few} many {many} other {other}}'
      } } };
      const parsed = { ...diagrams(0).activity, activityCount: count };
      expect(parsers.activity.generateAccessibleDescription(parsed, 'ru', translations)).toContain(`<p>Activity diagram ${category}.</p>`);
    });

  it('falls back from regional Dutch and unknown locales', () => {
    for (const [section, parser] of Object.entries(parsers)) {
      const parsed = diagrams(1)[section];
      expect(parser.generateAccessibleDescription(parsed, 'nl-BE')).toBe(parser.generateAccessibleDescription(parsed, 'nl'));
      expect(parser.generateAccessibleDescription(parsed, 'zz')).toBe(parser.generateAccessibleDescription(parsed, 'en'));
    }
  });

  it('preserves each parser default locale', () => {
    for (const [section, parser] of Object.entries(parsers)) {
      const parsed = diagrams(1)[section];
      const locale = ['pie', 'c4'].includes(section) ? 'en' : 'nl';
      expect(parser.generateAccessibleDescription(parsed)).toBe(parser.generateAccessibleDescription(parsed, locale));
    }
  });

  it('applies state, domain-story and nested activity overrides', () => {
    const translations = { fr: {
      state: { stateDiagram: 'États', finalStates: '{count, plural, one {État final} other {États finaux}}' },
      domainStory: { title: 'Histoire', withActivities: '{count, plural, one {# action} other {# actions}}' },
      activity: { partition: 'Partition française', step: 'Étape', endPartition: 'Fin' }
    } };
    const parsed = diagrams(1);
    parsed.state.finalStates = parsed.state.states;
    expect(parsers.state.generateAccessibleDescription(parsed.state, 'fr', translations)).toContain('État final: Item0');
    expect(parsers.domainStory.generateAccessibleDescription(parsed.domainStory, 'fr', translations)).toContain('Histoire 1 action.');
    parsed.activity.elements = [{
      type: 'partition', name: 'A: Work', elements: [{ type: 'activity', text: 'Run' }]
    }];
    parsed.activity.partitionCount = 1;
    const activity = parsers.activity.generateAccessibleDescription(parsed.activity, 'fr', translations);
    expect(activity).toContain('Partition française A: Work');
    expect(activity).toContain('Étape. Run');
    expect(activity).toContain('Fin A.');
  });

  it('propagates custom messages through class type and visibility helpers', () => {
    const parsed = diagrams(1).class;
    parsed.classes.Item0.attributes = [{ name: 'values', visibility: '+', type: 'List<String[]>' }];
    parsed.relations[0].label = 'owns';
    parsed.notes.push({ className: 'Item0', text: 'Note' });
    const translations = { fr: { class: {
      public: 'publique', array: 'Tableau', of: 'de',
      ofType: 'du type', noteFor: 'Note pour {class}'
    } } };
    const description = parsers.class.generateAccessibleDescription(parsed, 'fr', translations);
    expect(description).toContain("publique attribute 'values' du type List de String Tableau");
    expect(description).toContain("named 'owns' with");
    expect(description).toContain('Note pour Item0');
  });

  it.each(['en', 'nl'])('preserves quoted relationship, note and member labels in %s', locale => {
    const parsed = parsers.class.parseClassDiagram(`@startuml
class Order {
  +name : String
  +find(id : String) Order
}
class Customer
Order --> Customer : owner's {label}
note right of Order : Owner's {note}\\nSecond line
@enduml`);
    const description = parsers.class.generateAccessibleDescription(parsed, locale);
    expect(description).toContain(locale === 'nl'
      ? "met naam 'owner's {label}' met Customer"
      : "named 'owner's {label}' with Customer");
    expect(description).toContain(locale === 'nl'
      ? 'Bij klasse Order: "Owner\'s {note} Second line"'
      : 'Note for class Order: "Owner\'s {note} Second line"');
    expect(description).toContain(locale === 'nl'
      ? "publieke methode 'find', met parameter 'id' van type String, return type Order"
      : "public method 'find', with parameter 'id' of type String, return type Order");
    expect(description).toContain(locale === 'nl'
      ? "publieke attribuut 'name' van type String"
      : "public attribute 'name' of type String");
    expect(description).not.toContain('{name}');
    expect(description).not.toContain('{class}');
  });

  it('propagates custom messages through sequence list and message helpers', () => {
    const parsed = parsers.sequence.parseMermaidSequenceDiagram('sequenceDiagram\nparticipant A as alice: Person\nparticipant B\nA->>B: run()\nB-->>A: done');
    const translations = { fr: { sequence: {
      ofType: 'du type', and: 'et', call: '{from} appelle {to}.{message}', responds: 'répond à'
    } } };
    const description = parsers.sequence.generateAccessibleDescription(parsed, 'fr', translations);
    expect(description).toContain('alice du type Person et B');
    expect(description).toContain('alice appelle B.run()');
    expect(description).toContain('B répond à alice: done');
  });

  it('localizes titled pie charts and passes translations to ARIA helpers', () => {
    const parsed = { ...diagrams(1).pie, title: 'Fruit' };
    const translations = { fr: { pie: {
      summaryWithTitle: 'Graphique "{title}" : {count, plural, one {# segment} other {# segments}}.',
      segment: '{label} : {percentage} pour cent'
    }, c4: { context: 'Contexte', ariaLabel: 'Contexte "système"' } } };
    const pie = parsers.pie.generateAriaHtml(parsed, 'fr', translations);
    expect(pie.description).toBe('Graphique "Fruit" : 1 segment.\n\nItem0 : 100 pour cent');
    expect(pie.html).toContain(pie.description);
    const c4 = parsers.c4.generateAriaHtml(diagrams(0).c4, 'fr', translations);
    expect(c4).toContain('Contexte &quot;système&quot;');
    expect(c4).toContain('&lt;p&gt;Contexte&lt;/p&gt;');
  });

  it.each(['context', 'container', 'component'])('localizes C4 %s counts', diagramType => {
    const parsed = {
      ...diagrams(3).c4, diagramType,
      systems: [{ id: 'internal', name: 'Internal' }, { id: 'external', name: 'External', external: true }],
      components: items(3), containers: items(3).map(item => ({ ...item, type: 'container' })),
      relationships: [{ source: 'item0', target: 'item1', label: 'Uses' }]
    };
    const description = parsers.c4.generateAccessibleDescription(parsed, 'nl');
    expect(description).toContain('1 relatie:');
    expect(description).not.toMatch(/\((?:s|n|es|en)\)/);
    if (diagramType === 'context') {
      expect(description).toContain('2 systemen:');
      expect(description).toContain('1 intern systeem:');
      expect(description).toContain('1 extern systeem:');
    } else {
      expect(description).toContain(diagramType === 'container' ? '3 containers:' : '3 componenten:');
    }
  });
});

describe('catalog compatibility', () => {
  it.each(Object.values(names))('keeps %s module copies synchronized', name => {
    expect(readFileSync(new URL(`./${name}.js`, import.meta.url), 'utf8')).toBe(
      readFileSync(new URL(`./${name}.cjs`, import.meta.url), 'utf8'));
  });

  it.each(['class', 'state', 'sequence', 'activity', 'domainStory'])('preserves legacy %s i18n export', section => {
    const parser = require(`./${names[section]}.js`);
    expect(parser.i18n.en).toEqual(require('../locales/en/parsers.json')[section]);
    expect(parser.i18n.nl).toEqual(require('../locales/nl/parsers.json')[section]);
  });

  it('localizes unsupported diagram names and messages with English fallback', () => {
    const parser = require('./unsupportedDiagramParser.js');
    const translations = { fr: { unsupported: {
      pie: 'circulaires', notSupportedTemplate: 'Diagrammes {type} non pris en charge.'
    } } };
    const description = parser.generateUnsupportedDescription('pie', 'pie', 'fr', translations);
    expect(description).toContain('Diagrammes circulaires non pris en charge.');
    expect(description).toContain('Contribute to this A11Y project');
    expect(parser.generateUnsupportedDescription('', '', 'nl-BE')).toContain('dit type');
  });
});
