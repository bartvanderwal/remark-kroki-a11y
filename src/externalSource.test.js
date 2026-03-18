import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

let remarkKrokiA11y;

beforeAll(async () => {
  const module = await import('./index.js');
  remarkKrokiA11y = module.default ?? module;
});

describe('external source via src meta attribute', () => {
  it('loads local .puml source relative to the markdown file', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remark-kroki-a11y-src-relative-'));
    const docsDir = path.join(tempDir, 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(path.join(docsDir, 'diagram.puml'), 'class Order\nOrder --> Customer\n', 'utf8');

    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="plantuml" imgTitle="External source" src="./diagram.puml"',
          value: 'should be replaced',
        },
      ],
    };

    const transformer = remarkKrokiA11y({
      skipKrokiRender: true,
      showSource: true,
      showA11yDescription: false,
      languages: ['kroki'],
    });

    transformer(tree, { path: path.join(docsDir, 'page.md') });

    const htmlNode = tree.children.find((node) => node.type === 'html');
    const codeNode = tree.children.find((node) => node.type === 'code');

    // Source panel must show expanded file content, not internal wrappers.
    expect(htmlNode.value).toContain('class Order');
    expect(htmlNode.value).toContain('Order --&gt; Customer');
    expect(htmlNode.value).not.toContain('@startuml');
    expect(htmlNode.value).not.toContain('!include');

    // Render path may still be normalized to a full PlantUML document.
    expect(codeNode.value).toContain('@startuml');
    expect(codeNode.value).toContain('class Order');
    expect(codeNode.meta).not.toContain('src=');
  });

  it('throws when src is used with a non-PlantUML imgType', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="mermaid" imgTitle="Wrong type" src="./diagram.mmd"',
          value: '',
        },
      ],
    };

    const transformer = remarkKrokiA11y({
      skipKrokiRender: true,
      showSource: true,
      showA11yDescription: false,
      languages: ['kroki'],
    });

    expect(() => transformer(tree, {}))
      .toThrow(/only supported for imgType="plantuml"/i);
  });

  it('throws when src does not end with .puml', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="plantuml" imgTitle="Wrong extension" src="./diagram.txt"',
          value: '',
        },
      ],
    };

    const transformer = remarkKrokiA11y({
      skipKrokiRender: true,
      showSource: true,
      showA11yDescription: false,
      languages: ['kroki'],
    });

    expect(() => transformer(tree, {}))
      .toThrow(/must point to a \.puml file/i);
  });

  it('throws when src file does not exist', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remark-kroki-a11y-src-missing-'));
    const docsDir = path.join(tempDir, 'docs');
    fs.mkdirSync(docsDir, { recursive: true });

    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="plantuml" imgTitle="Missing file" src="./missing.puml"',
          value: '',
        },
      ],
    };

    const transformer = remarkKrokiA11y({
      skipKrokiRender: true,
      showSource: true,
      showA11yDescription: false,
      languages: ['kroki'],
    });

    expect(() => transformer(tree, { path: path.join(docsDir, 'page.md') }))
      .toThrow(/was not found/i);
  });

  it('throws when src file is empty', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remark-kroki-a11y-src-empty-'));
    const docsDir = path.join(tempDir, 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(path.join(docsDir, 'empty.puml'), ' \n', 'utf8');

    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="plantuml" imgTitle="Empty file" src="./empty.puml"',
          value: '',
        },
      ],
    };

    const transformer = remarkKrokiA11y({
      skipKrokiRender: true,
      showSource: true,
      showA11yDescription: false,
      languages: ['kroki'],
    });

    expect(() => transformer(tree, { path: path.join(docsDir, 'page.md') }))
      .toThrow(/empty \.puml/i);
  });
});
