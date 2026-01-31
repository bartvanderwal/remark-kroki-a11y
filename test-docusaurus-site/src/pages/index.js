import React from 'react';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <main>
      <h1>remark-kroki-a11y Test Site</h1>
      <p>This test site demonstrates the accessibility features of the remark-kroki-a11y plugin.</p>
      <h2>Quick Links</h2>
      <ul>
        <li><Link to="/docs/plantuml-class-diagrams-en">PlantUML Class Diagrams (English)</Link></li>
        <li><Link to="/docs/plantuml-class-diagrams-nl">PlantUML Klassendiagrammen (Nederlands)</Link></li>
        <li><Link to="/docs/domain-model-larman-vs-fowler">Domain Models: Larman vs Fowler (English)</Link></li>
        <li><Link to="/docs/domeinmodel-larman-vs-fowler">Domeinmodellen: Larman vs Fowler (Nederlands)</Link></li>
      </ul>
      <p>See the sidebar for more documentation and test pages.</p>
    </main>
  );
}
