// Dynamically set min-width for SVG diagrams based on dev-mode width
// Usage: include this script after diagram rendering

function setDiagramMinWidth(devWidthPx) {
  // Find all SVG diagrams with a specific class
  const diagrams = document.querySelectorAll('.class-diagram-svg');
  diagrams.forEach(svg => {
    svg.style.minWidth = devWidthPx + 'px';
  });
}

// Example: call setDiagramMinWidth(800) after rendering dev-mode diagram
// You can automate this by measuring the dev-mode SVG width:
function measureDevDiagramWidth() {
  const devDiagram = document.querySelector('.class-diagram-svg.dev-mode');
  if (devDiagram) {
    return devDiagram.getBBox().width;
  }
  return null;
}

// Usage example:
// const devWidth = measureDevDiagramWidth();
// if (devWidth) setDiagramMinWidth(devWidth);
