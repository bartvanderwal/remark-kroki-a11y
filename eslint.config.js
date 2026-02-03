// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

const js = require('@eslint/js');

module.exports = [
	js.configs.recommended,
	{
		// CommonJS files (Node.js)
		files: ['**/*.js'],
		ignores: ['src/diagramTabs.js', 'node_modules/**', 'test-docusaurus-site/**', 'test-results/**'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: {
				// Node.js globals
				require: 'readonly',
				module: 'readonly',
				exports: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				process: 'readonly',
				console: 'readonly',
				Buffer: 'readonly',
			},
		},
		rules: {
			// Code quality
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'no-console': 'off', // Allow console for CLI/debugging
			'prefer-const': 'warn',

			// Style (relaxed for existing codebase)
			'indent': ['warn', 'tab'],
			'quotes': ['warn', 'single', { avoidEscape: true }],
			'semi': ['warn', 'always'],

			// Best practices
			'eqeqeq': ['warn', 'smart'],
			'no-var': 'warn',
		},
	},
	{
		// ES modules (browser/client code)
		files: ['src/diagramTabs.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				// Browser globals
				document: 'readonly',
				window: 'readonly',
				console: 'readonly',
			},
		},
		rules: {
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'prefer-const': 'warn',
			'indent': ['warn', 'tab'],
			'quotes': ['warn', 'single', { avoidEscape: true }],
			'semi': ['warn', 'always'],
		},
	},
];
