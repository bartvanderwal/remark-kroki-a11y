import React from 'react';
import { extractPlantUmlBlocks } from './plantuml-examples-util';
import path from 'path';

// Replace with your actual PlantUML rendering component
// import { PlantUmlRenderer } from '../src/components/PlantUmlRenderer';

const examples = extractPlantUmlBlocks(
  path.join(__dirname, '../test-docusaurus-site/docs/plantuml-examples.md')
);

export default {
  title: 'PlantUML/Examples from Markdown',
};

export const AllExamples = () => (
  <div>
    {examples.map((ex, idx) => (
      <div key={idx} style={{ marginBottom: 32 }}>
        <h3>{ex.title}</h3>
        {/*
        <PlantUmlRenderer code={ex.code} meta={ex.meta} />
        */}
        <pre>{ex.code}</pre>
        <small>{ex.meta}</small>
      </div>
    ))}
  </div>
);
