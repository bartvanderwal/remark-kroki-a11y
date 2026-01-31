const { Given, When, Then, Before } = require('@cucumber/cucumber');
const assert = require('assert');
const MermaidClassdiagramA11YReader = require('../../src/mermaid-classdiagram-a11y');
const { parsePlantUMLClassDiagram, generateAccessibleDescription } = require('../../src/parsers/classDiagramParser');

// Shared state
let reader;
let currentDiagram;
let generatedDescription;
let generatedAriaStructure;
let isPlantUML = false;

Before(function() {
	reader = new MermaidClassdiagramA11YReader({ locale: 'nl' });
	currentDiagram = null;
	generatedDescription = null;
	generatedAriaStructure = null;
	isPlantUML = false;
});

Given('het volgende klassediagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	isPlantUML = false;
});

Given('het volgende PlantUML klassediagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	isPlantUML = true;
});

// English step definitions
Given('the following PlantUML class diagram:', function(diagramSource) {
	currentDiagram = diagramSource;
	isPlantUML = true;
});

When('ik een beschrijving genereer', function() {
	if (isPlantUML) {
		const parsed = parsePlantUMLClassDiagram(currentDiagram);
		generatedDescription = generateAccessibleDescription(parsed, 'nl');
	} else {
		generatedDescription = reader.generateDescription(currentDiagram);
	}
});

When('I generate a description in English', function() {
	const parsed = parsePlantUMLClassDiagram(currentDiagram);
	generatedDescription = generateAccessibleDescription(parsed, 'en');
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
	const firstLine = (generatedDescription || '').split('\n')[0].trim();
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
	const firstLine = (generatedDescription || '').split('\n')[0].trim();
	const expected = (expectedDocString || '').trim();
	assert.strictEqual(
		firstLine,
		expected,
		`First line mismatch. Expected:\n${expected}\nBut got:\n${firstLine}`
	);
});
