/**
 * Client-side script for diagram expandable source tabs
 * Handles tab switching for source code and A11y description tabs
 *
 * Usage in Docusaurus docusaurus.config.js:
 *
 *   clientModules: [
 *     require.resolve('remark-kroki-a11y/src/diagramTabs.js'),
 *   ],
 */

export function onRouteDidUpdate() {
	// Find all tab containers
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

				// Update button states
				buttons.forEach((btn) => btn.classList.remove('active'));
				button.classList.add('active');

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
}
