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
