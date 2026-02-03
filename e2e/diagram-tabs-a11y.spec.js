import { test, expect } from '@playwright/test';

/**
 * E2E Accessibility Tests for Diagram Tabs
 *
 * Tests keyboard navigation and screen reader accessibility
 * for the remark-kroki-a11y plugin output in the Docusaurus site.
 *
 * Related to GitHub Issue #10: Tab content niet keyboard toegankelijk voor screenreaders
 */

test.describe('Diagram Tabs Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the Roodkapje example page which has class diagrams
		await page.goto('/examples/roodkapje-als-uml-diagrammen');
		// Wait for the page content to load (Docusaurus hydration can take time)
		await page.waitForLoadState('networkidle');
		// Wait for the diagram expandable source to appear
		await page.waitForSelector('.diagram-expandable-source', { timeout: 30000 });
	});

	test('tab content should be keyboard focusable (Issue #10)', async ({ page }) => {
		// Find the first diagram expandable source
		const details = page.locator('.diagram-expandable-source').first();

		// Open the details element
		const summary = details.locator('summary');
		await summary.click();

		// Verify details is open
		await expect(details).toHaveAttribute('open', '');

		// Find the "In natuurlijke taal" tab button
		const a11yTabButton = details.locator('button[data-tab="a11y"]');
		await expect(a11yTabButton).toBeVisible();

		// Click the a11y tab to activate it
		await a11yTabButton.click();

		// Verify the tab is now active
		await expect(a11yTabButton).toHaveClass(/active/);
		await expect(a11yTabButton).toHaveAttribute('aria-selected', 'true');

		// The a11y content section should now be visible
		const a11yContent = details.locator('section[data-tab="a11y"]');
		await expect(a11yContent).toHaveClass(/active/);

		// CRITICAL TEST: The content section should be keyboard focusable
		// This is the fix for Issue #10
		await expect(a11yContent).toHaveAttribute('tabindex', '0');
		await expect(a11yContent).toHaveAttribute('role', 'tabpanel');
	});

	test('keyboard navigation flow should reach tab content', async ({ page }) => {
		const details = page.locator('.diagram-expandable-source').first();
		const summary = details.locator('summary');

		// Focus the summary element
		await summary.focus();

		// Press Enter to open details
		await page.keyboard.press('Enter');
		await expect(details).toHaveAttribute('open', '');

		// Tab to first button (Bron)
		await page.keyboard.press('Tab');
		const sourceButton = details.locator('button[data-tab="source"]');
		await expect(sourceButton).toBeFocused();

		// Tab to second button (In natuurlijke taal)
		await page.keyboard.press('Tab');
		const a11yButton = details.locator('button[data-tab="a11y"]');
		await expect(a11yButton).toBeFocused();

		// Press Enter to activate the a11y tab
		await page.keyboard.press('Enter');
		await expect(a11yButton).toHaveAttribute('aria-selected', 'true');

		// Tab should now move to the active tab content
		await page.keyboard.press('Tab');

		// The focus should be on the a11y content section
		const a11yContent = details.locator('section[data-tab="a11y"]');
		await expect(a11yContent).toBeFocused();
	});

	test('ARIA attributes should be correctly set', async ({ page }) => {
		const details = page.locator('.diagram-expandable-source').first();
		const summary = details.locator('summary');
		await summary.click();

		// Check tablist role
		const tablist = details.locator('[role="tablist"]');
		await expect(tablist).toBeVisible();

		// Check tab buttons have correct ARIA attributes
		const sourceButton = details.locator('button[data-tab="source"]');
		const a11yButton = details.locator('button[data-tab="a11y"]');

		await expect(sourceButton).toHaveAttribute('role', 'tab');
		await expect(sourceButton).toHaveAttribute('aria-selected', 'true');
		await expect(sourceButton).toHaveAttribute('aria-controls', /panel-source/);

		await expect(a11yButton).toHaveAttribute('role', 'tab');
		await expect(a11yButton).toHaveAttribute('aria-selected', 'false');
		await expect(a11yButton).toHaveAttribute('aria-controls', /panel-a11y/);

		// Check tabpanel sections have correct ARIA attributes
		const sourcePanel = details.locator('section[data-tab="source"]');
		const a11yPanel = details.locator('section[data-tab="a11y"]');

		await expect(sourcePanel).toHaveAttribute('role', 'tabpanel');
		await expect(sourcePanel).toHaveAttribute('aria-labelledby', /tab-source/);

		await expect(a11yPanel).toHaveAttribute('role', 'tabpanel');
		await expect(a11yPanel).toHaveAttribute('aria-labelledby', /tab-a11y/);
	});

	test('semantic HTML should use section elements', async ({ page }) => {
		const details = page.locator('.diagram-expandable-source').first();
		const summary = details.locator('summary');
		await summary.click();

		// Verify that tab content uses <section> elements, not <div>
		const tabContents = details.locator('.diagram-expandable-source-tab-content');
		const count = await tabContents.count();

		for (let i = 0; i < count; i++) {
			const tagName = await tabContents.nth(i).evaluate((el) => el.tagName.toLowerCase());
			expect(tagName).toBe('section');
		}
	});

	test('tab labels should be localized correctly (Dutch)', async ({ page }) => {
		const details = page.locator('.diagram-expandable-source').first();
		const summary = details.locator('summary');
		await summary.click();

		// Check Dutch labels
		const sourceButton = details.locator('button[data-tab="source"]');
		const a11yButton = details.locator('button[data-tab="a11y"]');

		await expect(sourceButton).toHaveText('Bron');
		await expect(a11yButton).toHaveText('In natuurlijke taal');
	});
});

test.describe('Diagram A11y Description Content', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/examples/roodkapje-als-uml-diagrammen');
		await page.waitForSelector('.diagram-expandable-source');
	});

	test('class diagram should have natural language description', async ({ page }) => {
		const details = page.locator('.diagram-expandable-source').first();
		const summary = details.locator('summary');
		await summary.click();

		// Click a11y tab
		const a11yButton = details.locator('button[data-tab="a11y"]');
		await a11yButton.click();

		// Get the a11y content
		const a11yContent = details.locator('section[data-tab="a11y"]');
		const text = await a11yContent.textContent();

		// The description should mention it's a class diagram
		// Note: This may be a custom description for this specific diagram
		expect(text).toBeTruthy();
		expect(text.length).toBeGreaterThan(50); // Should have substantial content
	});
});
