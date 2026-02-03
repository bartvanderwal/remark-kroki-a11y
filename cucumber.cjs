module.exports = {
	default: {
		paths: ['features/**/*.feature'],
		require: ['features/steps/**/*.steps.js'],
		parallel: 0,
		format: ['progress', 'html:test-results/cucumber-report.html'],
		formatOptions: {
			snippetInterface: 'synchronous'
		}
	}
};
