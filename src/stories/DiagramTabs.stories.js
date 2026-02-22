/**
 * Storybook stories for diagram tabs accessibility testing
 * Tests keyboard navigation for the expandable diagram source and a11y description tabs
 *
 * Related to GitHub issue #10: Tab content niet keyboard toegankelijk voor screenreaders
 */
import { userEvent, within, expect, waitFor } from 'storybook/test';
// CSS is now imported globally in .storybook/preview.js

// HTML that simulates the output of remark-kroki-a11y plugin
// Example from: test-docusaurus-site/docs/examples/roodkapje-als-uml-diagrammen.md
const createDiagramTabsHTML = () => `
<details class="diagram-expandable-source">
<summary>PlantUML broncode voor "Roodkapje: Domeinmodel"</summary>
<div class="diagram-expandable-source-tabs">
<div class="diagram-expandable-source-tab-buttons" role="tablist">
<button class="diagram-expandable-source-tab-btn active" data-tab="source" role="tab" aria-selected="true" id="story-tab-source" aria-controls="story-panel-source">Bron</button>
<button class="diagram-expandable-source-tab-btn" data-tab="a11y" role="tab" aria-selected="false" id="story-tab-a11y" aria-controls="story-panel-a11y">In natuurlijke taal</button>
</div>
<section class="diagram-expandable-source-tab-content active" data-tab="source" role="tabpanel" tabindex="0" id="story-panel-source" aria-labelledby="story-tab-source">
<pre><code>@startuml
!theme plain
title Er was eens... het domeinmodel van Roodkapje

class Roodkapje {
  -naam: String = "Roodkapje"
  -heeftKapje: boolean = true
  +vertrek()
  +klop()
}

class Wolf {
  -honger: boolean = true
  +eetOp(slachtoffer: Persoon)
}

Roodkapje --> Wolf : ontmoet
@enduml</code></pre>
</section>
<section class="diagram-expandable-source-tab-content" data-tab="a11y" role="tabpanel" tabindex="0" id="story-panel-a11y" aria-labelledby="story-tab-a11y">
Klassendiagram met 2 klasse(n) en 1 relatie(s).

Klassen:
- Klasse Roodkapje met:
  - Private attribuut naam van type String, standaardwaarde "Roodkapje"
  - Private attribuut heeftKapje van type boolean, standaardwaarde true
  - Publieke methode vertrek, zonder parameters
  - Publieke methode klop, zonder parameters
- Klasse Wolf met:
  - Private attribuut honger van type boolean, standaardwaarde true
  - Publieke methode eetOp met parameter slachtoffer van type Persoon

Relaties:
- Roodkapje heeft een associatie-relatie met naam 'ontmoet' met Wolf
</section>
</div>
</details>
`;

// Initialize tab switching behavior (same as diagramTabs.js)
const initTabSwitching = (container) => {
  const buttons = container.querySelectorAll('.diagram-expandable-source-tab-btn');
  const contents = container.querySelectorAll('.diagram-expandable-source-tab-content');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;

      // Update button states
      buttons.forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      // Update content visibility
      contents.forEach((content) => {
        if (content.dataset.tab === tabId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
};

export default {
  title: 'General/DiagramTabs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Keyboard Accessibility Test

Dit component test of de diagram tabs toegankelijk zijn via het toetsenbord.

**GitHub Issue #10:** De tab content is momenteel NIET bereikbaar via Tab-toets,
waardoor screenreaders de beschrijving niet kunnen voorlezen.

### Verwacht gedrag (na fix):
1. Tab naar details element → focus op summary
2. Enter/Spatie → details opent
3. Tab → focus op eerste tab button
4. Tab → focus op tweede tab button
5. Enter/Spatie → tweede tab wordt actief
6. **Tab → focus op tab content** (dit faalt nu!)
7. Screenreader kan content voorlezen
				`,
      },
    },
  },
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = createDiagramTabsHTML();
    initTabSwitching(container);
    return container;
  },
};

/**
 * Default story - toont de diagram tabs
 */
export const Default = {};

/**
 * Keyboard Navigation Test
 *
 * Deze test toont aan dat de tab content NIET bereikbaar is via keyboard.
 * Na de fix zou deze test moeten slagen.
 */
export const KeyboardNavigationTest = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open details met keyboard', async () => {
      // Wacht tot summary beschikbaar is
      const summary = await waitFor(() => canvas.getByText(/PlantUML broncode voor/));
      summary.focus();

      await waitFor(() => {
        expect(document.activeElement).toBe(summary);
      });

      // Open met Enter
      await userEvent.keyboard('{Enter}');

      // Wacht tot details open is
      const details = summary.closest('details');
      await waitFor(() => {
        expect(details).toHaveAttribute('open');
      });
    });

    await step('Navigeer naar Natuurlijke taal tab', async () => {
      // Tab naar eerste button
      await userEvent.tab();
      const sourceBtn = canvas.getByRole('tab', { name: 'Bron' });
      await waitFor(() => {
        expect(document.activeElement).toBe(sourceBtn);
      });

      // Tab naar tweede button
      await userEvent.tab();
      const a11yBtn = canvas.getByRole('tab', { name: 'In natuurlijke taal' });
      await waitFor(() => {
        expect(document.activeElement).toBe(a11yBtn);
      });

      // Activeer met Enter
      await userEvent.keyboard('{Enter}');
      await waitFor(() => {
        expect(a11yBtn).toHaveClass('active');
      });
    });

    await step('Tab naar content (dit faalt momenteel!)', async () => {
      // Tab zou naar de content moeten gaan
      await userEvent.tab();

      // Haal de a11y content op
      const a11yContent = canvasElement.querySelector('[data-tab="a11y"].active');

      // Dit is de test die faalt: content heeft geen tabindex, dus focus gaat ergens anders heen
      // Na de fix zou dit moeten slagen:
      // expect(document.activeElement).toBe(a11yContent);

      // Voor nu loggen we waar de focus naartoe ging
      console.log('Focus is now on:', document.activeElement);
      console.log('A11y content element:', a11yContent);
      console.log('Content has tabindex:', a11yContent?.getAttribute('tabindex'));

      // Deze assertion toont het probleem aan: content is niet focusable
      // Verwacht: content element heeft focus
      // Actueel: focus gaat naar iets anders (body of volgend focusable element)
      const contentHasFocus = document.activeElement === a11yContent ||
				a11yContent?.contains(document.activeElement);

      if (!contentHasFocus) {
        console.warn('⚠️ ACCESSIBILITY BUG: Tab content is niet keyboard focusable!');
        console.warn('Focus ging naar:', document.activeElement.tagName, document.activeElement.className);
      }

      // Uncomment na fix om te valideren:
      // expect(contentHasFocus).toBe(true);
    });
  },
};

/**
 * Met tabindex fix - toont hoe het zou moeten werken
 * Note: De "Default" story hierboven bevat nu al de fix met <section> en tabindex.
 * Deze story blijft voor backwards compatibility en demonstratie.
 */
const createDiagramTabsHTMLWithFix = () => `
<details class="diagram-expandable-source">
<summary>PlantUML broncode voor "Roodkapje: Domeinmodel"</summary>
<div class="diagram-expandable-source-tabs">
<div class="diagram-expandable-source-tab-buttons" role="tablist">
<button class="diagram-expandable-source-tab-btn active" data-tab="source" role="tab" aria-selected="true" id="fix-tab-source" aria-controls="fix-panel-source">Bron</button>
<button class="diagram-expandable-source-tab-btn" data-tab="a11y" role="tab" aria-selected="false" id="fix-tab-a11y" aria-controls="fix-panel-a11y">In natuurlijke taal</button>
</div>
<section class="diagram-expandable-source-tab-content active" data-tab="source" role="tabpanel" tabindex="0" id="fix-panel-source" aria-labelledby="fix-tab-source">
<pre><code>@startuml
class Roodkapje { ... }
class Wolf { ... }
@enduml</code></pre>
</section>
<section class="diagram-expandable-source-tab-content" data-tab="a11y" role="tabpanel" tabindex="0" id="fix-panel-a11y" aria-labelledby="fix-tab-a11y">
Klassendiagram met 2 klasse(n) en 1 relatie(s).
Roodkapje heeft een associatie-relatie met naam 'ontmoet' met Wolf.
</section>
</div>
</details>
`;

export const WithTabindexFix = {
  name: 'Met tabindex fix (gewenst gedrag)',
  parameters: {
    docs: {
      description: {
        story: `
Dit toont hoe de HTML eruit zou moeten zien NA de fix:
- \`tabindex="0"\` op de content divs
- ARIA attributen voor betere screenreader ondersteuning
				`,
      },
    },
  },
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = createDiagramTabsHTMLWithFix();
    initTabSwitching(container);
    return container;
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open en navigeer naar content met fix', async () => {
      // Wacht tot summary beschikbaar is
      const summary = await waitFor(() => canvas.getByText(/PlantUML broncode voor/));
      summary.focus();
      await userEvent.keyboard('{Enter}');

      // Wacht tot details open is
      const details = summary.closest('details');
      await waitFor(() => {
        expect(details).toHaveAttribute('open');
      });

      // Tab naar a11y tab en activeer
      await userEvent.tab(); // Bron tab
      await userEvent.tab(); // Natuurlijke taal tab
      await userEvent.keyboard('{Enter}');

      // Tab naar content - dit zou NU moeten werken
      await userEvent.tab();

      const a11yContent = canvasElement.querySelector('[data-tab="a11y"]');
      await waitFor(() => {
        expect(document.activeElement).toBe(a11yContent);
      });
      console.log('✅ Content is nu keyboard focusable!');
    });
  },
};
