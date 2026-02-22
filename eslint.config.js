// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import js from '@eslint/js';

export default [
	js.configs.recommended,
	{
		// Mixed JS files (CommonJS + ESM)
		files: ['**/*.js'],
		ignores: ['node_modules/**', 'test-docusaurus-site/**', 'test-results/**'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
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
				// Browser globals
				document: 'readonly',
				window: 'readonly',
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
			'no-useless-escape': 'warn',
		},
	},
	...storybook.configs["flat/recommended"],
];
