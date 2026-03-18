import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let remarkKrokiA11y;

beforeAll(async () => {
  const module = await import('./index.js');
  remarkKrokiA11y = module.default ?? module;
});

describe('external source via src meta attribute', () => {
  it('converts src into a PlantUML include wrapper', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="plantuml" imgTitle="External source" src="diagram.puml"',
          value: 'this inline value should be replaced',
        },
      ],
    };

    const transformer = remarkKrokiA11y({
      skipKrokiRender: true,
      showSource: true,
      showA11yDescription: false,
      languages: ['kroki'],
    });

    transformer(tree, {});

    const codeNode = tree.children[0];
    expect(codeNode.value).toBe('@startuml\n!include diagram.puml\n@enduml\n');
    expect(codeNode.meta).not.toContain('src=');
  });

  it('throws a clear error when src is used with a non-PlantUML imgType', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="mermaid" imgTitle="Wrong type" src="diagram.mmd"',
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

  it('throws a clear error when src does not end with .puml', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="plantuml" imgTitle="Wrong ext" src="diagram.txt"',
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

  it('throws when validateSrcExists is enabled and file does not exist', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remark-kroki-a11y-include-missing-'));

    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="plantuml" imgTitle="Missing include" src="missing.puml"',
          value: '',
        },
      ],
    };

    const transformer = remarkKrokiA11y({
      skipKrokiRender: true,
      showSource: true,
      showA11yDescription: false,
      validateSrcExists: true,
      languages: ['kroki'],
      kroki: {
        includeSourceDir: tempDir,
      },
    });

    expect(() => transformer(tree, {}))
      .toThrow(/was not found in includeSourceDir/i);
  });

  it('throws when validateSrcContent is enabled and file is empty', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remark-kroki-a11y-include-empty-'));
    const emptyFile = path.join(tempDir, 'empty.puml');
    fs.writeFileSync(emptyFile, '\n', 'utf8');

    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'kroki',
          meta: 'imgType="plantuml" imgTitle="Empty include" src="empty.puml"',
          value: '',
        },
      ],
    };

    const transformer = remarkKrokiA11y({
      skipKrokiRender: true,
      showSource: true,
      showA11yDescription: false,
      validateSrcContent: true,
      languages: ['kroki'],
      kroki: {
        includeSourceDir: tempDir,
      },
    });

    expect(() => transformer(tree, {}))
      .toThrow(/points to an empty \.puml file/i);
  });
});
