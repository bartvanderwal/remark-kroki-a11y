import { describe, expect, it } from 'vitest';
import i18n from './i18n.cjs';
import remarkKrokiA11y from './index.js';
import runtime from './runtime/a11yRuntime.cjs';

const { createTranslator, formatPattern } = i18n;

describe('ICU localization', () => {
  it('resolves regional locales and falls back per message to English', () => {
    expect(createTranslator('ui', 'nl-NL')('tabSource')).toBe('Bron');
    expect(createTranslator('ui', 'NL_nl')('tabSource')).toBe('Bron');
    const t = createTranslator('ui', 'fr-CA', { fr: { ui: { tabSource: 'Source française' } } });
    expect(t('tabSource')).toBe('Source française');
    expect(t('tabA11y')).toBe('In natural language');
    expect(createTranslator('ui', 'unknown')('tabSource')).toBe('Source');
    expect(createTranslator('ui', 'nl_NL', { nl_NL: { ui: {
      count: '{count, plural, one {# item} other {# items}}',
    } } })('count', { count: 2 })).toBe('2 items');
  });

  it('supports ICU plural and select messages without changing global formatter state', () => {
    const translations = { ru: { ui: {
      count: '{count, plural, one {# класс} few {# класса} many {# классов} other {# класса}}',
      choice: '{mode, select, source {Исходник} other {Описание}}',
    } } };
    const t = createTranslator('ui', 'ru', translations);
    expect(t('count', { count: 1 })).toBe('1 класс');
    expect(t('count', { count: 2 })).toBe('2 класса');
    expect(t('count', { count: 5 })).toBe('5 классов');
    expect(t('choice', { mode: 'source' })).toBe('Исходник');
    expect(createTranslator('ui', 'en')('tabSource')).toBe('Source');
    expect(t('count', { count: 21 })).toBe('21 класс');
  });

  it('substitutes repeated placeholders and preserves literal argument content', () => {
    expect(formatPattern('{title} / {title} / {type}', { title: 'A {type}', type: 'Mermaid' }))
      .toBe('A {type} / A {type} / Mermaid');
  });

  it('localizes unsupported-diagram messages and keeps fallback overrides', () => {
    const options = { imgType: 'graphviz', content: 'digraph {}', locale: 'fr', translations: {
      fr: { ui: { fallbackA11yText: 'Description indisponible pour {diagramType}.' },
        diagramTypes: { diagram: 'ce diagramme' } },
    } };
    expect(runtime.generateA11yFromSource(options).a11yText).toBe('Description indisponible pour ce diagramme.');
    expect(runtime.generateA11yFromSource({ ...options, fallbackA11yText: { fr: 'Autre : {diagramType}.' } }).a11yText)
      .toBe('Autre : ce diagramme.');
    expect(runtime.generateA11yFromSource({ imgType: 'graphviz', content: '', locale: 'nl-NL' }).a11yText)
      .toBe('Natuurlijke taal beschrijving nog niet beschikbaar voor dit diagram type.');
  });

  it('passes custom description messages through the shared runtime', () => {
    const result = runtime.generateA11yFromSource({
      imgType: 'mermaid', content: 'classDiagram\nclass A', locale: 'fr-FR',
      translations: { fr: { class: {
        classDiagram: 'Diagramme de classes',
        withClasses: 'avec {count, plural, one {# classe} other {# classes}}',
        andRelations: 'et {count, plural, one {# relation} other {# relations}}',
      } } },
    });
    expect(result.a11yText).toContain('Diagramme de classes avec 1 classe et 0 relation.');
  });
});

function render(options = {}, meta = '') {
  const tree = { type: 'root', children: [
    { type: 'code', lang: 'kroki', meta: `imgType="mermaid" imgTitle="A & B" ${meta}`, value: 'classDiagram\nclass A' },
  ] };
  remarkKrokiA11y({ skipKrokiRender: true, ...options })(tree);
  return tree.children.filter(node => node.type === 'html').map(node => node.value).join('');
}

describe('localized plugin UI', () => {
  it('supports custom languages and per-block regional locale overrides', () => {
    const html = render({ locale: 'en', translations: { fr: { ui: {
      tabSource: 'Code', tabA11y: 'Description', summaryText: '{type} pour "{title}"',
    } } } }, 'lang="fr-CA"');
    expect(html).toContain('lang="fr-CA"');
    expect(html).toContain('>Code</button>');
    expect(html).toContain('>Description</button>');
    expect(html).toContain('Mermaid pour &quot;A &amp; B&quot;');
  });

  it('keeps translation configuration isolated between plugin instances', () => {
    expect(render({ locale: 'en', translations: { en: { ui: { tabSource: 'Custom' } } } })).toContain('>Custom</button>');
    expect(render()).toContain('>Source</button>');
    expect(render({ locale: 'nl-NL' })).toContain('>Bron</button>');
  });

  it('passes custom description messages through the plugin', () => {
    const html = render({ locale: 'fr', translations: { fr: { class: {
      classDiagram: 'Diagramme de classes',
      withClasses: 'avec {count, plural, one {# classe} other {# classes}}',
    } } } });
    expect(html).toContain('Diagramme de classes avec 1 classe and 0 relations.');
  });

  it('escapes custom labels and honors existing UI option overrides', () => {
    const html = render({ tabSourceLabel: '<Code>', summaryText: '{title} / {title}',
      translations: { en: { ui: { tabA11y: '"><img src=x onerror=alert(1)>' } } } });
    expect(html).toContain('>&lt;Code&gt;</button>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('<summary>A &amp; B / A &amp; B</summary>');
  });
});
