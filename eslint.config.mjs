// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import js from '@eslint/js';

const globals = {
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
	requestAnimationFrame: 'readonly',
};

const rules = {
	// Code quality
	'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
	'no-console': 'off', // Allow console for CLI/debugging
	'prefer-const': 'warn',

	// Style (relaxed for existing codebase)
	'indent': ['warn', 2],
	'quotes': ['warn', 'single', { avoidEscape: true }],
	'semi': ['warn', 'always'],

	// Best practices
	'eqeqeq': ['warn', 'smart'],
	'no-var': 'warn',
	'no-useless-escape': 'warn',
};

const ignores = ['node_modules/**', 'test-docusaurus-site/**', 'test-results/**'];

export default [
	js.configs.recommended,
	{
		files: ['**/*.js', '**/*.mjs'],
		ignores,
		languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals },
		rules,
	},
	{
		files: ['**/*.cjs'],
		ignores,
		languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals },
		rules,
	},
	...storybook.configs["flat/recommended"],
];
