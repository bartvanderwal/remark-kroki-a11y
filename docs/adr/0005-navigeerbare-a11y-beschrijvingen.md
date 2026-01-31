# ADR: Navigeerbare A11y beschrijvingen voor diagrammen

## Status

Accepted

## Context

De huidige A11y beschrijvingen voor diagrammen worden gegenereerd als platte tekst in een `<pre>` element. Bij grote diagrammen met veel klassen, attributen en relaties wordt dit een lange, ongestructureerde lap tekst die moeilijk te navigeren is voor screenreader-gebruikers.

**Voorbeeld huidige output:**

```text
Class diagram with 5 class(es) and 4 relation(s). Classes: Class WordList with: - public method sort, without parameters, return type void - private attribute words of type String Array Interface SortStrategy with: - public method sort...
```

Dit is problematisch omdat:

1. Screenreaders lezen alles in één keer voor zonder pauzes
2. Gebruikers kunnen niet naar specifieke secties springen (klassen, relaties)
3. Bij complexe diagrammen raakt de gebruiker het overzicht kwijt
4. Er is geen manier om "terug te spoelen" naar een specifiek onderdeel

## Opties

### Optie 0: Niets doen - houd diagrammen klein

Accepteer de huidige implementatie en focus op het klein houden van diagrammen.

**Rationale:**

- Het probleem van lange, moeilijk navigeerbare beschrijvingen ontstaat primair door te grote diagrammen
- Dit sluit aan bij het **Single Responsibility Principle** toegepast op diagrammen: elk diagram toont één aspect of concept
- In **Domain-Driven Design** komt dit overeen met het werken in **subdomains**: splits complexe domeinen op in kleinere, behapbare delen
- Kleinere diagrammen zijn niet alleen beter voor screenreader-gebruikers, maar ook voor ziende gebruikers

**Vuistregels voor diagramgrootte:**

- Maximaal 5-7 klassen per diagram (cognitieve limiet)
- Eén diagram per subdomain of bounded context
- Splits "overzichtsdiagrammen" op in detail-diagrammen met links ertussen

**Voordelen:**

- Geen extra implementatie-inspanning
- Dwingt betere documentatiepraktijken af
- Beter voor alle gebruikers, niet alleen screenreader-gebruikers
- Past bij onderwijscontext: studenten leren modulair denken

**Nadelen:**

- Lost het probleem niet op voor bestaande grote diagrammen
- Niet altijd mogelijk om diagrammen te splitsen (bijv. bij externe bronnen)
- Vereist discipline van documentatie-auteurs

### Optie 1: Semantische HTML met koppen en lijsten

Vervang de `<pre>` door gestructureerde HTML:

```html
<div class="diagram-a11y-description" role="region" aria-label="Diagram beschrijving">
  <p>Class diagram with 5 classes and 4 relations.</p>

  <h4>Classes</h4>
  <ul>
    <li>
      <strong>Class WordList</strong>
      <ul>
        <li>public method sort, without parameters, return type void</li>
        <li>private attribute words of type String Array</li>
      </ul>
    </li>
    <li>
      <strong>Interface SortStrategy</strong>
      <ul>
        <li>public method sort, with parameter words of type String[]</li>
      </ul>
    </li>
  </ul>

  <h4>Relations</h4>
  <ul>
    <li>WordList has an association-relationship with SortStrategy</li>
  </ul>
</div>
```

**Voordelen:**

- Screenreaders herkennen koppen en lijsten automatisch
- Gebruikers kunnen met toetsen navigeren (H voor koppen, L voor lijsten)
- Visueel ook beter leesbaar voor ziende gebruikers
- Geen JavaScript nodig

**Nadelen:**

- Complexere HTML generatie
- Meer CSS nodig voor opmaak
- De "uitleg" functie voor reguliere gebruikers kan anders aanvoelen

### Optie 2: ARIA landmarks en regio's

Gebruik ARIA attributen voor navigatie:

```html
<div role="region" aria-label="Class diagram with 5 classes">
  <section aria-labelledby="classes-heading">
    <h4 id="classes-heading">Classes</h4>
    <ul role="list">
      <li role="listitem">Class WordList...</li>
    </ul>
  </section>
  <section aria-labelledby="relations-heading">
    <h4 id="relations-heading">Relations</h4>
    ...
  </section>
</div>
```

**Voordelen:**

- Maximale screenreader ondersteuning
- Landmarks menu in screenreaders toont structuur

**Nadelen:**

- Complexer te implementeren
- Vereist unieke IDs per diagram
- Overhead voor kleine diagrammen

### Optie 3: Collapsible secties met details/summary

Gebruik native HTML5 disclosure widgets:

```html
<div class="diagram-a11y-description">
  <p>Class diagram with 5 classes and 4 relations.</p>

  <details>
    <summary>Classes (5)</summary>
    <ul>
      <li>Class WordList: 1 method, 1 attribute</li>
      ...
    </ul>
  </details>

  <details>
    <summary>Relations (4)</summary>
    <ul>
      <li>WordList → SortStrategy (association)</li>
      ...
    </ul>
  </details>
</div>
```

**Voordelen:**

- Keyboard accessible (Enter/Space)
- Gebruiker kan secties openen/sluiten
- Werkt zonder JavaScript
- Visueel compact

**Nadelen:**

- Initieel zijn secties gesloten (extra stap voor gebruiker)
- Sommige screenreaders hebben inconsistent gedrag met details/summary

### Optie 4: Text-to-Speech API integratie

Gebruik de Web Speech API voor browser-native spraaksynthese:

```javascript
const utterance = new SpeechSynthesisUtterance(description);
utterance.lang = 'nl-NL';
speechSynthesis.speak(utterance);
```

**Voordelen:**

- Meer controle over voorleessnelheid en pauzes
- Kan specifieke secties voorlezen
- Play/pause/stop controls mogelijk

**Nadelen:**

- Vereist JavaScript
- Browser compatibiliteit varieert (vooral Safari/iOS)
- Dupliceert screenreader functionaliteit
- Extra onderhoud voor cross-browser support
- Niet standaard toegankelijkheidspatroon

### Optie 5: Hybride aanpak

Combineer semantische HTML (Optie 1) met optionele details/summary voor grote diagrammen:

- Kleine diagrammen (≤3 klassen): Direct tonen als lijst
- Grote diagrammen (>3 klassen): Collapsible secties

## Overwegingen

1. **WCAG 2.1 compliance**: Semantische HTML (Optie 1) volgt het beste de WCAG richtlijnen voor "Info and Relationships" (1.3.1)

2. **Browser support**: Native HTML elementen (koppen, lijsten, details) hebben de beste ondersteuning

3. **Onderhoud**: Hoe minder JavaScript, hoe minder te onderhouden

4. **Dual-purpose**: De beschrijving moet werken voor zowel screenreader-gebruikers als ziende gebruikers die het diagram willen begrijpen

## Beslissing

We kiezen voor **Optie 0 (Niets doen - houd diagrammen klein)** als primaire aanpak.

**Rationale:**

- Dit is een studentenproject waarbij we eenvoud prefereren boven complexiteit
- Het dwingt goede documentatiepraktijken af (kleine, gefocuste diagrammen)
- Sluit aan bij pedagogische doelen: studenten leren modulair denken

**Minimale verbetering:** We passen wel de huidige beschrijving aan om HTML `<ul><li>` bullets te gebruiken in plaats van tekst-streepjes (`-`). Dit voorkomt verwarring met de `-` (private) visibility marker in class diagrams en verbetert de leesbaarheid.

De Text-to-Speech optie (Optie 4) wordt **niet aanbevolen** vanwege:

- Extra complexiteit voor cross-browser ondersteuning
- Duplicatie van screenreader functionaliteit
- Geen standaard toegankelijkheidspatroon

## Toekomstige overwegingen

Mocht de behoefte aan navigeerbare beschrijvingen toch ontstaan (bijv. bij integratie met externe systemen die grote diagrammen genereren), dan is Optie 1 (Semantische HTML) de aanbevolen vervolgstap.

## Bronnen

- [WCAG 2.1 - Info and Relationships](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html)
- [MDN - ARIA landmarks](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role)
- [WebAIM - Semantic Structure](https://webaim.org/techniques/semanticstructure/)
- [Deque - Screen Reader Testing](https://www.deque.com/blog/how-screen-readers-navigate-data-tables/)

---

*Datum: 2026-01-31*
*Auteur: Bart van der Wal & Claude Code*
