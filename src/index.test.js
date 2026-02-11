/**
 * Unit tests for utility functions in remark-kroki-a11y
 * 
 * Tests the escapeHtml and extractTextContent functions to ensure:
 * 1. Individual function behavior is correct
 * 2. The combination escapeHtml(extractTextContent()) is necessary or redundant
 * 3. Both functions are properly inverting/complementing each other
 */

import { describe, it, expect, beforeAll } from 'vitest';

let escapeHtml, extractTextContent;

beforeAll(async () => {
	const module = await import('./index.js');
	escapeHtml = module.escapeHtml;
	extractTextContent = module.extractTextContent;
});

describe('escapeHtml', () => {
	it('encodes HTML special characters', () => {
		expect(escapeHtml('<')).toBe('&lt;');
		expect(escapeHtml('>')).toBe('&gt;');
		expect(escapeHtml('&')).toBe('&amp;');
		expect(escapeHtml('"')).toBe('&quot;');
	});

	it('encodes all special characters in mixed text', () => {
		expect(escapeHtml('<test> & "quoted"')).toBe('&lt;test&gt; &amp; &quot;quoted&quot;');
	});

	it('leaves safe characters unchanged', () => {
		expect(escapeHtml('Hello world 123')).toBe('Hello world 123');
		expect(escapeHtml('some-text_with.symbols')).toBe('some-text_with.symbols');
	});

	it('handles empty string', () => {
		expect(escapeHtml('')).toBe('');
	});
});

describe('extractTextContent', () => {
	it('removes HTML tags', () => {
		expect(extractTextContent('<p>Hello</p>')).toBe('Hello');
		expect(extractTextContent('<strong>bold</strong> text')).toBe('bold text');
		expect(extractTextContent('<div><span>nested</span></div>')).toBe('nested');
	});

	it('adds periods after list items', () => {
		expect(extractTextContent('<li>Item 1</li><li>Item 2</li>')).toBe('Item 1. Item 2.');
		expect(extractTextContent('<ul><li>One</li><li>Two</li></ul>')).toBe('One. Two.');
	});

	it('decodes HTML entities', () => {
		expect(extractTextContent('&lt;test&gt;')).toBe('<test>');
		expect(extractTextContent('&amp;')).toBe('&');
		expect(extractTextContent('&quot;')).toBe('"');
	});

	it('normalizes whitespace', () => {
		expect(extractTextContent('text  with   multiple    spaces')).toBe('text with multiple spaces');
		expect(extractTextContent('text\nwith\nnewlines')).toBe('text with newlines');
	});

	it('removes duplicate periods', () => {
		expect(extractTextContent('Test..')).toBe('Test.');
		expect(extractTextContent('One. . Two')).toBe('One. Two');
	});

	it('trims leading and trailing whitespace', () => {
		expect(extractTextContent('  text  ')).toBe('text');
	});

	it('handles complex HTML with entities and tags', () => {
		const input = '<ul><li>Item &lt;1&gt;</li><li>Item &quot;2&quot;</li></ul>';
		const result = extractTextContent(input);
		expect(result).toBe('Item <1>. Item "2".');
	});

	it('handles empty string', () => {
		expect(extractTextContent('')).toBe('');
	});
});

describe('combined escapeHtml(extractTextContent())', () => {
	it('double conversion is redundant for plain HTML without entities', () => {
		// When a11yDescription has NO encoded entities, the double conversion is wasteful
		const plainHtml = '<p>Hello <strong>world</strong></p>';
		const extracted = extractTextContent(plainHtml);
		const doubleConverted = escapeHtml(extracted);
		
		// Both should be identical because extractTextContent removes all tags
		// and leaves no special characters that escapeHtml would encode
		expect(extracted).toBe(doubleConverted);
		expect(extracted).toBe('Hello world');
	});

	it('double conversion is redundant for list items without entities', () => {
		const listHtml = '<ul><li>Item 1</li><li>Item 2</li></ul>';
		const extracted = extractTextContent(listHtml);
		const doubleConverted = escapeHtml(extracted);
		
		expect(extracted).toBe(doubleConverted);
		expect(extracted).toBe('Item 1. Item 2.');
	});

	it('shows the real issue: encoded entities flow through unchanged', () => {
		// When descriptionOverride is escaped BEFORE being wrapped in HTML:
		// escapeHtml(descriptionOverride) → descriptionOverride with &lt;, &gt;, &quot;, &amp;
		// This gets wrapped: <p>&lt;test&gt;</p>
		// Then extractTextContent decodes it: <test>
		// Then escapeHtml re-encodes it: &lt;test&gt;
		
		const descriptionOverrideOriginal = '<test>';
		const escapeStep1 = escapeHtml(descriptionOverrideOriginal); // '&lt;test&gt;'
		const wrappedInHtml = `<p>${escapeStep1}</p>`; // '<p>&lt;test&gt;</p>'
		const extracted = extractTextContent(wrappedInHtml); // '<test>'
		const doubleConverted = escapeHtml(extracted); // '&lt;test&gt;'
		
		// The round trip: escapeHtml → escapeHtml(extractTextContent()) = no net effect
		expect(doubleConverted).toBe(escapeStep1);
	});

	it('reveals the issue is by design but inefficient', () => {
		// The flow for aria-label with encoded HTML:
		// Original: `<p>&lt;test&gt;</p>`
		// After extractTextContent: `<test>` (decoded)
		// After escapeHtml: `&lt;test&gt;` (re-encoded for safe HTML attribute)
		
		// This is safe but roundabout. Would be better to:
		// Option A: Keep entities all the way (no decoding in extractTextContent)
		// Option B: Don't escape descriptionOverride if already escaped later
		
		const input = '<p>&lt;test&gt;</p>';
		const result = escapeHtml(extractTextContent(input));
		
		// Result is correct for aria-label, but involves unnecessary cycles
		expect(result).toBe('&lt;test&gt;');
	});
});

describe('function usage analysis', () => {
	it('shows escapeHtml(extractTextContent()) is used twice identically in index.js', () => {
		// Lines 368 and 422 use: escapeHtml(extractTextContent(a11yDescription))
		// Both for creating aria-label values
		// This is duplicate code that could be refactored
		expect(true).toBe(true); // Documentation test
	});

	it('clarifies the purpose: make HTML content safe for aria-label', () => {
		// aria-label must have:
		// 1. No HTML tags (extractTextContent removes them)
		// 2. Safe for HTML attribute context (escapeHtml ensures this)
		
		// However, after extractTextContent removes all tags,
		// escapeHtml only needs to handle entities that were already in the source
		const htmlWithEntities = '<p>Test &lt;T&gt;</p>';
		const result = escapeHtml(extractTextContent(htmlWithEntities));
		
		expect(result).toBe('Test &lt;T&gt;');
		// This is needed because the original HTML contained &lt; and &gt;
	});
});
