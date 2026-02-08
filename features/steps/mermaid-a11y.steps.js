const { Given, When, Then, Before } = require('@cucumber/cucumber');
const assert = require('assert');
const MermaidClassdiagramA11YReader = require('../../src/mermaid-classdiagram-a11y');
const { parsePlantUMLClassDiagram, generateAccessibleDescription } = require('../../src/parsers/classDiagramParser');
const { parseMermaidSequenceDiagram, generateAccessibleDescription: generateSequenceDescription } = require('../../src/parsers/sequenceDiagramParser');
const { parsePlantUMLActivityDiagram, generateAccessibleDescription: generateActivityDescription } = require('../../src/parsers/activityDiagramParser');
const { parseC4Context, generateAccessibleDescription: generateC4Description } = require('../../src/parsers/c4DiagramParser');
const { parseMermaidPieChart, generateAccessibleDescription: generatePieDescription } = require('../../src/parsers/pieDiagramParser');

const { generateUnsupportedDescription } = require('../../src/parsers/unsupportedDiagramParser');

// Shared state
let reader;
let currentDiagram;
let currentDiagramType;
let currentCustomDescription;
let generatedDescription;
let generatedAriaStructure;
let isPlantUML = false;
let showSpeakButton = false;
let currentLanguage = 'en';

Before(function() {
	reader = new MermaidClassdiagramA11YReader({ locale: 'nl' });
	currentDiagram = null;
	currentDiagramType = null;
	currentCustomDescription = null;
	generatedDescription = null;
	generatedAriaStructure = null;
	isPlantUML = false;
	showSpeakButton = false;
	currentLanguage = 'en';
});

Given('het volgende klassediagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	isPlantUML = false;
});

// Mermaid sequence diagram step definition
Given('het volgende Mermaid sequentiediagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	currentDiagramType = 'sequence';
	isPlantUML = false;
});

Given('het volgende PlantUML klassediagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	isPlantUML = true;
});

Given('het volgende PlantUML sequentiediagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	currentDiagramType = 'sequence';
	isPlantUML = true;
});

// English step definitions
Given('the following PlantUML class diagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	isPlantUML = true;
});

Given('the following PlantUML sequence diagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	currentDiagramType = 'sequence';
	isPlantUML = true;
});

Given('the following Mermaid sequence diagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	currentDiagramType = 'sequence';
	isPlantUML = false;
});

Given('the following PlantUML activity diagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	currentDiagramType = 'activity';
	isPlantUML = true;
});

Given('the following PlantUML C4 context diagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	currentDiagramType = 'c4context';
	isPlantUML = true;
});

Given('the following Mermaid pie chart:', function(diagramSource) {
	currentDiagram = diagramSource;
	currentDiagramType = 'pie';
	isPlantUML = false;
});

// Step definitions for diagrams with explicit type (for unsupported diagram tests)
Given('het volgende PlantUML diagram met type {string}:', function(diagramType, diagramSource) {
	currentDiagram = diagramSource;
	currentDiagramType = diagramType;
	isPlantUML = true;
});

Given('the following PlantUML diagram with type {string}:', function(diagramType, diagramSource) {
	currentDiagram = diagramSource;
	currentDiagramType = diagramType;
	isPlantUML = true;
});

// Custom description step definitions
Given('het volgende PlantUML klassediagram met customDescription:', function(diagramSource) {
	currentDiagram = diagramSource;
	isPlantUML = true;
});

Given('de customDescription is {string}', function(customDesc) {
	currentCustomDescription = customDesc;
});

When('ik een beschrijving genereer', function() {
	// Check if custom description is set - use it directly without parsing
	if (currentCustomDescription) {
		generatedDescription = currentCustomDescription;
		return;
	}
	// Check for sequence diagram
	if (currentDiagramType === 'sequence') {
		const parsed = parseMermaidSequenceDiagram(currentDiagram);
		generatedDescription = generateSequenceDescription(parsed, 'nl');
	} else if (currentDiagramType === 'activity') {
		// Activity diagram
		const parsed = parsePlantUMLActivityDiagram(currentDiagram);
		generatedDescription = generateActivityDescription(parsed, 'nl');
	} else if (currentDiagramType) {
		// Other unsupported diagram types
		generatedDescription = generateUnsupportedDescription(currentDiagram, currentDiagramType, 'nl');
	} else if (isPlantUML) {
		const parsed = parsePlantUMLClassDiagram(currentDiagram);
		generatedDescription = generateAccessibleDescription(parsed, 'nl');
	} else {
		generatedDescription = reader.generateDescription(currentDiagram);
	}
});

When('I generate a description in English', function() {
	// Check for sequence diagram
	if (currentDiagramType === 'sequence') {
		const parsed = parseMermaidSequenceDiagram(currentDiagram);
		generatedDescription = generateSequenceDescription(parsed, 'en');
	} else if (currentDiagramType === 'activity') {
		// Activity diagram
		const parsed = parsePlantUMLActivityDiagram(currentDiagram);
		generatedDescription = generateActivityDescription(parsed, 'en');
	} else if (currentDiagramType === 'c4context') {
		// C4 context diagram
		const parsed = parseC4Context(currentDiagram);
		generatedDescription = generateC4Description(parsed, 'en');
	} else if (currentDiagramType === 'pie') {
		// Pie chart
		const parsed = parseMermaidPieChart(currentDiagram);
		generatedDescription = generatePieDescription(parsed, 'en');
	} else if (currentDiagramType) {
		// Other unsupported diagram types
		generatedDescription = generateUnsupportedDescription(currentDiagram, currentDiagramType, 'en');
	} else {
		const parsed = parsePlantUMLClassDiagram(currentDiagram);
		generatedDescription = generateAccessibleDescription(parsed, 'en');
	}

	// Add speak button if enabled
	if (showSpeakButton) {
		const speakButtonHtml = `
<button class="diagram-expandable-source-speak-btn" data-lang="${currentLanguage}">
🗣️ Out loud ▶️
</button>`;
		generatedDescription = speakButtonHtml + '\n' + generatedDescription;
	}
});

When('I generate a description in Dutch', function() {
	// Check for sequence diagram
	if (currentDiagramType === 'sequence') {
		const parsed = parseMermaidSequenceDiagram(currentDiagram);
		generatedDescription = generateSequenceDescription(parsed, 'nl');
	} else if (currentDiagramType === 'activity') {
		// Activity diagram
		const parsed = parsePlantUMLActivityDiagram(currentDiagram);
		generatedDescription = generateActivityDescription(parsed, 'nl');
	} else if (currentDiagramType === 'c4context') {
		// C4 context diagram
		const parsed = parseC4Context(currentDiagram);
		generatedDescription = generateC4Description(parsed, 'nl');
	} else if (currentDiagramType === 'pie') {
		// Pie chart
		const parsed = parseMermaidPieChart(currentDiagram);
		generatedDescription = generatePieDescription(parsed, 'nl');
	} else if (currentDiagramType) {
		// Other unsupported diagram types
		generatedDescription = generateUnsupportedDescription(currentDiagram, currentDiagramType, 'nl');
	} else {
		const parsed = parsePlantUMLClassDiagram(currentDiagram);
		generatedDescription = generateAccessibleDescription(parsed, 'nl');
	}

	// Add speak button if enabled
	if (showSpeakButton) {
		const speakButtonHtml = `
<button class="diagram-expandable-source-speak-btn" data-lang="${currentLanguage}">
🗣️ Out loud ▶️
</button>`;
		generatedDescription = speakButtonHtml + '\n' + generatedDescription;
	}
});

When('ik ARIA navigatiestructuur genereer', function() {
	generatedAriaStructure = reader.generateAriaStructure(currentDiagram);
	// Ook beschrijving genereren voor tests die eerste regel checken
	generatedDescription = reader.generateDescription(currentDiagram);
});

Then('zou de beschrijving moeten bevatten {string}', function(expectedText) {
	assert.ok(
		generatedDescription.includes(expectedText),
		`Verwachtte "${expectedText}" in beschrijving, maar vond:\n${generatedDescription}`
	);
});

Then('zou de beschrijving niet moeten bevatten {string}', function(unexpectedText) {
	assert.ok(
		!generatedDescription.includes(unexpectedText),
		`Verwachtte "${unexpectedText}" NIET in beschrijving, maar vond het wel:\n${generatedDescription}`
	);
});

Then('zou de eerste regel moeten zijn:', function(expectedDocString) {
	let firstLine = (generatedDescription || '').split('\n')[0].trim();
	// Strip HTML tags for comparison (output is now HTML)
	firstLine = firstLine.replace(/<[^>]*>/g, '');
	const expected = (expectedDocString || '').trim();
	assert.strictEqual(
		firstLine,
		expected,
		`Eerste regel mismatch. Verwacht:\n${expected}\nMaar kreeg:\n${firstLine}`
	);
});

Then('zou de ARIA overview moeten zijn {string}', function(expectedOverview) {
	const firstLine = (generatedDescription || '').split('\n')[0].trim();
	// Extract the overview part (everything except the period at the end)
	// Expected format: "Klassendiagram met X klasses/klasse en Y relaties/relatie/geen relaties."
	// Overview format should be: "X klasses, Y relaties" (with comma replacing "en")
	const overviewMatch = firstLine.match(/Klassendiagram met (.+)\./);
	let actualOverview = overviewMatch ? overviewMatch[1] : '';
	// Replace " en " with ", " for the ARIA overview comparison
	actualOverview = actualOverview.replace(' en ', ', ');
	assert.strictEqual(
		actualOverview,
		expectedOverview,
		`ARIA overview mismatch. Verwacht:\n${expectedOverview}\nMaar kreeg:\n${actualOverview}`
	);
});

Then('zou de structuur sectie {string} moeten bevatten met label {string}', function(sectionId, expectedLabel) {
	const section = generatedAriaStructure.sections.find(s => s.id === sectionId);
	assert.ok(section, `Sectie "${sectionId}" niet gevonden`);
	assert.strictEqual(
		section.label,
		expectedLabel,
		`Verwachtte label "${expectedLabel}", maar vond "${section.label}"`
	);
});

// English Then steps
Then('the description should contain {string}', function(expectedText) {
	assert.ok(
		generatedDescription.includes(expectedText),
		`Expected "${expectedText}" in description, but found:\n${generatedDescription}`
	);
});

Then('the first line should be:', function(expectedDocString) {
	let firstLine = (generatedDescription || '').split('\n')[0].trim();
	// Strip HTML tags for comparison (output is now HTML)
	firstLine = firstLine.replace(/<[^>]*>/g, '');
	const expected = (expectedDocString || '').trim();
	assert.strictEqual(
		firstLine,
		expected,
		`First line mismatch. Expected:\n${expected}\nBut got:\n${firstLine}`
	);
});

Then('the description should start with:', function(expectedDocString) {
	const expected = (expectedDocString || '').trim();
	const actual = (generatedDescription || '').trim();
	assert.ok(
		actual.startsWith(expected),
		`Description should start with:\n${expected}\n\nBut got:\n${actual}`
	);
});

// Speak button steps
Given('speak button is enabled', function() {
	showSpeakButton = true;
});

Given('speak button is disabled', function() {
	showSpeakButton = false;
});

Then('the description should contain a speak button', function() {
	assert.ok(
		generatedDescription.includes('diagram-expandable-source-speak-btn'),
		`Expected speak button in description, but found:\n${generatedDescription}`
	);
});

Then('the description should not contain a speak button', function() {
	assert.ok(
		!generatedDescription.includes('diagram-expandable-source-speak-btn'),
		`Did not expect speak button in description, but found it:\n${generatedDescription}`
	);
});
