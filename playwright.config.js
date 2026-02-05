import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing the Docusaurus test site.
 * Tests accessibility features of the remark-kroki-a11y plugin.
 *
 * Run tests with: yarn test:e2e
 * Note: Requires the Docusaurus site to be running (yarn start)
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:3001',
		trace: 'on-first-retry',
	},
	timeout: 60000, // 60 seconds per test (Docusaurus can be slow)
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		// Uncomment for cross-browser testing in CI:
		// {
		// 	name: 'firefox',
		// 	use: { ...devices['Desktop Firefox'] },
		// },
		// {
		// 	name: 'webkit',
		// 	use: { ...devices['Desktop Safari'] },
		// },
	],
	// Automatically start the Docusaurus dev server before running tests
	webServer: {
		command: 'npx docusaurus start --no-open --port 3001',
		cwd: './test-docusaurus-site',
		url: 'http://localhost:3001',
		reuseExistingServer: !process.env.CI,
		timeout: 120000, // 2 minutes for Docusaurus to start
		stdout: 'pipe', // Don't show server output unless debugging
	},
});
