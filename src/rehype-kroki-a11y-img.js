/**
 * rehype-kroki-a11y-img
 *
 * A Rehype plugin that fixes accessibility attributes on Kroki-generated images:
 * 1. Replaces hash-based alt text with the title attribute value
 * 2. Adds aria-describedby pointing to the natural language description section
 *
 * This plugin runs AFTER remark-kroki-plugin has generated the images
 * and AFTER rehype-raw has parsed the HTML into the AST.
 *
 * Usage in docusaurus.config.js:
 *
 *   rehypePlugins: [
 *     [rehypeRaw, { passThrough }],  // Parse raw HTML first
 *     require('../src/rehype-kroki-a11y-img'),  // Then fix img accessibility
 *   ],
 */

const { visit } = require('unist-util-visit');

// Counter for generating unique IDs within a page
let idCounter = 0;

module.exports = function rehypeKrokiA11yImg(options = {}) {
	const opts = {
		// CSS class pattern to identify Kroki images
		imgPathPattern: /\/img\/kroki\//,
		// CSS class for the a11y description section
		a11yDescriptionClass: 'diagram-expandable-source-tab-content',
		...options,
	};

	return (tree) => {
		// Reset counter per page
		idCounter = 0;

		// First pass: collect all img elements and their indices
		const images = [];
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName === 'img' && node.properties) {
				const src = node.properties.src || '';
				if (opts.imgPathPattern.test(src)) {
					images.push({ node, index, parent });
				}
			}
		});

		// Second pass: find a11y sections and add IDs, link images to them
		visit(tree, 'element', (node, index, parent) => {
			// Find section elements with data-tab="a11y" (our a11y description sections)
			if (node.tagName === 'section' && node.properties) {
				const dataTab = node.properties.dataTab || node.properties['data-tab'];
				if (dataTab === 'a11y') {
					// Generate unique ID if not present
					if (!node.properties.id) {
						node.properties.id = `a11y-desc-${idCounter}`;
					}

					// Find the preceding img element in the document flow
					// The image should be the closest preceding Kroki image
					if (images.length > idCounter && images[idCounter]) {
						const imgNode = images[idCounter].node;

						// Fix alt attribute: use title if alt is a hash
						if (imgNode.properties.alt && imgNode.properties.title) {
							const alt = imgNode.properties.alt;
							// Check if alt looks like a hash (alphanumeric, 32 chars)
							if (/^[a-f0-9]{32}$/i.test(alt)) {
								imgNode.properties.alt = imgNode.properties.title;
							}
						}

						// Add aria-describedby pointing to the a11y section
						imgNode.properties['aria-describedby'] = node.properties.id;
					}

					idCounter++;
				}
			}
		});

		// Handle images without corresponding a11y sections (still fix their alt)
		images.forEach((img) => {
			const imgNode = img.node;
			if (imgNode.properties.alt && imgNode.properties.title) {
				const alt = imgNode.properties.alt;
				if (/^[a-f0-9]{32}$/i.test(alt)) {
					imgNode.properties.alt = imgNode.properties.title;
				}
			}
		});
	};
};
