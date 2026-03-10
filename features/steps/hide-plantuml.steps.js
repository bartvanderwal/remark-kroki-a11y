const { Given, When, Then, Before } = require('@cucumber/cucumber');
const assert = require('assert');
const remarkKrokiA11y = require('../../src/index.js');

let codeValue = '';
let renderedHtml = '';

Before(function() {
  codeValue = '';
  renderedHtml = '';
});

Given('a PlantUML kroki code block with hidePlantuml:', function(diagramSource) {
  codeValue = diagramSource;
});

When('I transform the code block with remark-kroki-a11y and speak button enabled', function() {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'code',
        lang: 'kroki',
        meta: 'imgType="plantuml" imgTitle="WordList class" lang="en" hidePlantuml',
        value: codeValue,
      },
    ],
  };

  const transform = remarkKrokiA11y({
    showSource: true,
    showA11yDescription: true,
    showSpeakButton: true,
    languages: ['kroki'],
    locale: 'en',
    // Avoid Kroki rendering in this test; we only validate a11y/source UI insertion behavior.
    skipKrokiRender: true,
  });

  transform(tree, {});

  renderedHtml = tree.children
    .filter((node) => node.type === 'html')
    .map((node) => node.value)
    .join('\n');
});

Then('the rendered controls should not contain source tab UI', function() {
  assert.ok(
    !renderedHtml.includes('diagram-expandable-source-tab-btn'),
    `Did not expect source tab UI, but found:\n${renderedHtml}`
  );
  assert.ok(
    !renderedHtml.includes('data-tab="source"'),
    `Did not expect source tab panel, but found:\n${renderedHtml}`
  );
});

Then('the rendered controls should contain a11y description UI', function() {
  assert.ok(
    renderedHtml.includes('diagram-a11y-description'),
    `Expected a11y description UI, but found:\n${renderedHtml}`
  );
});

Then('the rendered controls should contain a speak button', function() {
  assert.ok(
    renderedHtml.includes('diagram-expandable-source-speak-btn'),
    `Expected speak button, but found:\n${renderedHtml}`
  );
});
