/**
 * Client-side script for diagram expandable source tabs
 * Handles tab switching for source code and A11y description tabs
 * Also handles the "Speak Out Loud" button for text-to-speech
 *
 * Usage in Docusaurus docusaurus.config.js:
 *
 *   clientModules: [
 *     require.resolve('remark-kroki-a11y/src/diagramTabs.js'),
 *   ],
 */

import TextToSpeechService from './TextToSpeechService.js';

// Make TextToSpeechService available globally for speak buttons
if (typeof window !== 'undefined') {
  window.TextToSpeechService = TextToSpeechService;
}

export function onRouteDidUpdate() {
  const measurePane = (container) => {
    if (!container) return { width: 0, height: 0 };
    const visual = container.querySelector('img, svg, object, canvas') || container;
    const rect = visual.getBoundingClientRect();
    return { width: rect.width || 0, height: rect.height || 0 };
  };

  // Handle dev/simpler diagram mode toggle
  const diagramModeToggles = document.querySelectorAll('.diagram-visual-toggle-controls');

  diagramModeToggles.forEach((controls) => {
    if (controls.dataset.diagramModeToggleListener) return;
    controls.dataset.diagramModeToggleListener = 'true';

    const groupId = controls.dataset.diagramGroup;
    if (!groupId) return;

    const markerDev = document.querySelector(`.diagram-visual-toggle-marker[data-diagram-group="${groupId}"][data-mode="dev"]`);
    const markerSimpler = document.querySelector(`.diagram-visual-toggle-marker[data-diagram-group="${groupId}"][data-mode="simpler"]`);
    const devImageContainer = markerDev ? markerDev.previousElementSibling : null;
    const simplerImageContainer = markerSimpler ? markerSimpler.previousElementSibling : null;
    const buttons = controls.querySelectorAll('.diagram-visual-toggle-btn');
    let stackElement = null;

    if (!devImageContainer || !simplerImageContainer || buttons.length < 2) {
      controls.style.display = 'none';
      return;
    }

    // Keep both visual variants in one shared stack so the toggle position is stable.
    const sharedParent = controls.parentElement;
    if (sharedParent && devImageContainer.parentElement === sharedParent && simplerImageContainer.parentElement === sharedParent) {
      let stack = sharedParent.querySelector(`.diagram-visual-toggle-stack[data-diagram-group="${groupId}"]`);

      if (!stack) {
        stack = document.createElement('div');
        stack.className = 'diagram-visual-toggle-stack';
        stack.dataset.diagramGroup = groupId;
        sharedParent.insertBefore(stack, devImageContainer);
      }

      stackElement = stack;

      if (devImageContainer.parentElement !== stack) {
        stack.appendChild(devImageContainer);
      }

      if (simplerImageContainer.parentElement !== stack) {
        stack.appendChild(simplerImageContainer);
      }

      // Keep controls anchored directly after the shared stack.
      if (controls.previousElementSibling !== stack) {
        sharedParent.insertBefore(controls, stack.nextSibling);
      }

      devImageContainer.classList.add('diagram-visual-toggle-pane');
      simplerImageContainer.classList.add('diagram-visual-toggle-pane');
    }

    const lockStackSize = () => {
      if (!stackElement) return;
      const devSize = measurePane(devImageContainer);
      const simplerSize = measurePane(simplerImageContainer);
      const width = Math.max(devSize.width, simplerSize.width);
      const height = Math.max(devSize.height, simplerSize.height);
      if (width > 0) {
        stackElement.style.minWidth = `${Math.ceil(width)}px`;
      }
      if (height > 0) {
        stackElement.style.minHeight = `${Math.ceil(height)}px`;
      }
    };

    const registerLoadSync = (container) => {
      const media = container ? container.querySelector('img, object') : null;
      if (!media) return;

      if (media.tagName === 'IMG') {
        if (media.complete) {
          lockStackSize();
        } else {
          media.addEventListener('load', lockStackSize, { once: true });
        }
      } else {
        media.addEventListener('load', lockStackSize, { once: true });
      }
    };

    registerLoadSync(devImageContainer);
    registerLoadSync(simplerImageContainer);

    const setMode = (mode) => {
      const showDev = mode !== 'simpler';
      devImageContainer.classList.toggle('diagram-visual-toggle-pane-hidden', !showDev);
      simplerImageContainer.classList.toggle('diagram-visual-toggle-pane-hidden', showDev);
      devImageContainer.setAttribute('aria-hidden', showDev ? 'false' : 'true');
      simplerImageContainer.setAttribute('aria-hidden', showDev ? 'true' : 'false');

      buttons.forEach((button) => {
        const isActive = button.dataset.mode === (showDev ? 'dev' : 'simpler');
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        setMode(button.dataset.mode || 'dev');
      });
    });

    setMode('dev');
    requestAnimationFrame(lockStackSize);
  });

  // Handle tab switching
  const tabContainers = document.querySelectorAll('.diagram-expandable-source-tabs');

  tabContainers.forEach((container) => {
    const buttons = container.querySelectorAll('.diagram-expandable-source-tab-btn');
    const contents = container.querySelectorAll('.diagram-expandable-source-tab-content');

    buttons.forEach((button) => {
      // Skip if already has listener (check via data attribute)
      if (button.dataset.tabListener) return;
      button.dataset.tabListener = 'true';

      button.addEventListener('click', () => {
        const tabId = button.dataset.tab;

        // Update button states and ARIA attributes
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
  });

  // Handle speak buttons
  const speakButtons = document.querySelectorAll('.diagram-expandable-source-speak-btn');

  speakButtons.forEach((btn) => {
    if (btn.dataset.speakListener) return;
    btn.dataset.speakListener = 'true';

    // Store TTS service instance and original text on the button element
    let ttsService = null;
    const originalText = btn.textContent;
    const stopText = '⏸️ Stop';

    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Get content from aria-describedby reference
      const contentId = btn.getAttribute('aria-describedby');
      const lang = btn.dataset.lang || 'en';
      const langMap = { nl: 'nl-NL', en: 'en-US' };

      if (!contentId) return;

      const contentElement = document.getElementById(contentId);
      if (!contentElement) return;

      // Get text content from the HTML element (preserves list structure for natural pauses)
      const content = contentElement.textContent || contentElement.innerText;
      if (!content) return;

      // Check if already speaking using the stored service
      if (ttsService && ttsService.isSpeaking()) {
        ttsService.stop();
        btn.textContent = originalText;
        ttsService = null;
      } else {
        // Create new service only when starting to speak
        ttsService = new window.TextToSpeechService({
          language: langMap[lang] || 'en-US',
        });

        btn.textContent = stopText;
        ttsService.speak(content, {
          onEnd: () => {
            btn.textContent = originalText;
            ttsService = null;
          },
          onError: (error) => {
            const errorType = error && (error.error || error.name);
            if (errorType !== 'canceled' && errorType !== 'interrupted') {
              console.error('Speech synthesis error:', error);
            }
            btn.textContent = originalText;
            ttsService = null;
          },
        });
      }
    });
  });
}
