import { visit } from 'unist-util-visit';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function splitAcceptedAnswers(text) {
  const placeholder = '__ESCAPED_SLASH__';
  const normalized = text.replace(/\\\//g, placeholder);
  return normalized
    .split(/\s+\/\s+/)
    .map((part) => part.replace(new RegExp(placeholder, 'g'), '/').trim())
    .filter(Boolean);
}

function parseMetaFlags(meta) {
  const metaText = String(meta || '');
  return {
    debug: /\bdebug\s*=\s*true\b/i.test(metaText),
  };
}

function shuffleArray(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function orderOptionsForRendering(options) {
  if (!options || options.length <= 1) return options || [];

  const forced = options.filter((o) => Number.isInteger(o.forcedOrder));
  const unforced = options.filter((o) => !Number.isInteger(o.forcedOrder));

  // Default: randomize all options when no forced positions are provided.
  if (forced.length === 0) {
    return shuffleArray(options);
  }

  // If forced positions exist, keep those positions fixed and randomize the rest.
  const total = options.length;
  const slots = new Array(total).fill(null);
  const forcedSorted = [...forced].sort((a, b) => {
    if (a.forcedOrder !== b.forcedOrder) return a.forcedOrder - b.forcedOrder;
    return 0;
  });

  forcedSorted.forEach((opt) => {
    const preferred = Math.max(0, Math.min(total - 1, opt.forcedOrder - 1));
    if (slots[preferred] === null) {
      slots[preferred] = opt;
      return;
    }
    for (let i = preferred + 1; i < total; i += 1) {
      if (slots[i] === null) {
        slots[i] = opt;
        return;
      }
    }
    for (let i = preferred - 1; i >= 0; i -= 1) {
      if (slots[i] === null) {
        slots[i] = opt;
        return;
      }
    }
  });

  const randomizedUnforced = shuffleArray(unforced);
  let unforcedIndex = 0;
  for (let i = 0; i < total; i += 1) {
    if (slots[i] !== null) continue;
    slots[i] = randomizedUnforced[unforcedIndex];
    unforcedIndex += 1;
  }

  return slots.filter(Boolean);
}

function finalizeQuestion(current, warnings, index) {
  if (!current) return null;

  const question = {
    id: `q${index + 1}`,
    prompt: [current.prompt, ...current.promptLines].filter(Boolean).join('\n').trim(),
    questionType: 'single',
    options: [],
    acceptedAnswers: [],
    maxLength: null,
    hint: current.hint || null,
  };

  if (current.options.length > 0 && current.acceptedAnswers.length > 0) {
    warnings.push(
      `Question ${index + 1}: cannot mix options and open-answer syntax. Treating as options question.`
    );
    current.acceptedAnswers = [];
    current.maxLength = null;
  }

  if (current.options.length > 0) {
    const markerKinds = new Set(current.options.map((o) => o.markerKind));
    if (markerKinds.size > 1) {
      warnings.push(
        `Question ${index + 1}: mixed marker styles '( )' and '[ ]' are not allowed.`
      );
    }

    const preferredKind = current.options[0].markerKind;
    question.questionType = preferredKind === 'square' ? 'multiple' : 'single';

    const sortedOptions = [...current.options].sort((a, b) => {
      const ao = a.forcedOrder === null ? Number.MAX_SAFE_INTEGER : a.forcedOrder;
      const bo = b.forcedOrder === null ? Number.MAX_SAFE_INTEGER : b.forcedOrder;
      if (ao !== bo) return ao - bo;
      return a.index - b.index;
    });

    if (question.questionType === 'single' && !sortedOptions.some((o) => o.isCorrect)) {
      sortedOptions[0].isCorrect = true;
      warnings.push(
        `Question ${index + 1}: no '(x)' found for single-choice question; first option set as correct.`
      );
    }

    if (question.questionType === 'multiple' && !sortedOptions.some((o) => o.isCorrect)) {
      warnings.push(
        `Question ${index + 1}: no '[x]' found for multi-choice question; at least one correct option is recommended.`
      );
    }

    question.options = sortedOptions.map((o) => ({
      text: o.text.trim(),
      isCorrect: o.isCorrect,
      forcedOrder: o.forcedOrder,
    }));
  } else if (current.acceptedAnswers.length > 0) {
    question.questionType = 'open_short';
    question.acceptedAnswers = [...current.acceptedAnswers];
    question.maxLength = current.maxLength;
  } else {
    warnings.push(`Question ${index + 1}: no answers found.`);
  }

  return question;
}

function parseQuizdown(source) {
  const lines = source.split(/\r?\n/);
  const warnings = [];
  const questions = [];

  let current = null;
  let currentOption = null;

  const pushCurrent = () => {
    const finalized = finalizeQuestion(current, warnings, questions.length);
    if (finalized) questions.push(finalized);
    current = null;
    currentOption = null;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      currentOption = null;
      return;
    }

    const questionMatch = trimmed.match(/^\?\s+(.+)$/);
    if (questionMatch) {
      if (current) pushCurrent();
      current = {
        prompt: questionMatch[1].trim(),
        promptLines: [],
        options: [],
        acceptedAnswers: [],
        maxLength: null,
        hint: null,
      };
      return;
    }

    if (!current) {
      warnings.push(`Ignoring content outside question: "${trimmed}"`);
      return;
    }

    const openAnswerMatch = trimmed.match(/^=\s+(.+)$/);
    if (openAnswerMatch) {
      const value = openAnswerMatch[1];
      const withMax = value.match(/^(.*?)(?:\s+~(\d+))?$/);
      const acceptedRaw = (withMax && withMax[1] ? withMax[1] : value).trim();
      current.acceptedAnswers = splitAcceptedAnswers(acceptedRaw);
      if (withMax && withMax[2]) {
        current.maxLength = Number.parseInt(withMax[2], 10);
      }
      currentOption = null;
      return;
    }

    const hintMatch = trimmed.match(/^!\s+(.+)$/);
    if (hintMatch) {
      current.hint = hintMatch[1].trim();
      currentOption = null;
      return;
    }

    const optionMatch = line.match(/^\s*-\s*(?:(\d+)\.\s*)?(\([ xX]\)|\[[ xX]\])\s*(.*)$/);
    if (optionMatch) {
      const forcedBeforeMarker = optionMatch[1]
        ? Number.parseInt(optionMatch[1], 10)
        : null;
      const marker = optionMatch[2];
      let text = optionMatch[3] || '';
      let forcedOrder = forcedBeforeMarker;

      // Also support "- ( ) 4. All of the above" style.
      if (forcedOrder === null) {
        const forcedAfterMarker = text.match(/^(\d+)\.\s+(.*)$/);
        if (forcedAfterMarker) {
          forcedOrder = Number.parseInt(forcedAfterMarker[1], 10);
          text = forcedAfterMarker[2];
        }
      }
      const markerKind = marker.startsWith('[') ? 'square' : 'round';
      const isCorrect = /x/i.test(marker);

      currentOption = {
        markerKind,
        isCorrect,
        forcedOrder,
        text,
        index: current.options.length,
      };
      current.options.push(currentOption);
      return;
    }

    // Continuation line for a multiline option body
    if (/^\s+/.test(rawLine) && currentOption) {
      currentOption.text += `\n${trimmed}`;
      return;
    }

    current.promptLines.push(trimmed);
    currentOption = null;
  });

  if (current) pushCurrent();

  return {
    version: '0.1.0-draft',
    questions,
    warnings,
  };
}

function renderQuizHtml(model, blockId) {
  const blocks = [];
  blocks.push(`<section class="quizdown-rendered" data-quizdown-id="${escapeHtml(blockId)}">`);
  blocks.push('<h3>Generated quiz (experimental)</h3>');
  blocks.push(
    '<p id="quizdown-strike-help" class="quizdown-assistive-note">Use the x button to temporarily strike out an option.</p>'
  );
  blocks.push(`<form class="quizdown-form" data-quizdown-form-id="${escapeHtml(blockId)}" novalidate>`);

  model.questions.forEach((q, i) => {
    blocks.push(`<fieldset class="quizdown-question" data-question-type="${escapeHtml(q.questionType)}">`);
    blocks.push(
      `<legend>${i + 1}. ${escapeHtml(q.prompt || '')}</legend>`
    );

    if (q.questionType === 'single' || q.questionType === 'multiple') {
      const inputType = q.questionType === 'multiple' ? 'checkbox' : 'radio';
      const inputName = `${blockId}-${q.id}`;
      blocks.push('<div class="quizdown-options">');
      const renderedOptions = orderOptionsForRendering(q.options || []);
      renderedOptions.forEach((opt, optionIndex) => {
        const inputId = `${blockId}-${q.id}-opt-${optionIndex + 1}`;
        const correctnessClass = opt.isCorrect
          ? 'quizdown-option-row quizdown-option-correct'
          : 'quizdown-option-row';
        blocks.push(`<div class="${correctnessClass}">`);
        blocks.push(
          `<input class="quizdown-option-input" id="${escapeHtml(inputId)}" type="${inputType}" name="${escapeHtml(inputName)}" data-correct="${opt.isCorrect ? 'true' : 'false'}"${
            q.questionType === 'single' ? ' required' : ''
          } />`
        );
        blocks.push(
          `<label class="quizdown-option-label" for="${escapeHtml(inputId)}">${escapeHtml(opt.text || '')}</label>`
        );
        blocks.push(
          `<button type="button" class="quizdown-strike-toggle" aria-pressed="false" aria-describedby="quizdown-strike-help" aria-label="Strike out option: ${escapeHtml(
            opt.text || ''
          )}" title="Strike out option">x</button>`
        );
        blocks.push('</div>');
      });
      blocks.push('</div>');
    } else if (q.questionType === 'open_short') {
      const maxLengthAttr =
        typeof q.maxLength === 'number' ? ` maxlength="${q.maxLength}"` : '';
      const accepted = encodeURIComponent(JSON.stringify(q.acceptedAnswers || []));
      blocks.push(
        `<input type="text" class="quizdown-open-input" placeholder="Type your answer"${maxLengthAttr} required data-accepted="${accepted}" />`
      );
      blocks.push('<p class="quizdown-open-note">Auto-graded short answer.</p>');
    } else {
      blocks.push('<p>Unsupported question type.</p>');
    }

    if (q.hint) {
      const hintId = `${blockId}-${q.id}-hint`;
      blocks.push(
        `<button type="button" class="quizdown-hint-toggle button button--secondary button--sm" aria-expanded="false" aria-controls="${escapeHtml(
          hintId
        )}">Show hint</button>`
      );
      blocks.push(
        `<p class="quizdown-hint-text" id="${escapeHtml(hintId)}" hidden>${escapeHtml(
          q.hint
        )}</p>`
      );
    }

    blocks.push('<p class="quizdown-question-feedback" aria-live="polite"></p>');
    blocks.push('</fieldset>');
  });

  blocks.push('<div class="quizdown-actions">');
  blocks.push('<button type="submit" class="button button--primary button--sm">Check answers</button>');
  blocks.push('<button type="button" class="button button--secondary button--sm quizdown-reset-btn">Reset</button>');
  blocks.push('</div>');
  blocks.push('<p class="quizdown-score" aria-live="polite"></p>');
  blocks.push('</form>');

  if (model.warnings && model.warnings.length > 0) {
    blocks.push('<div class="quizdown-warnings">');
    blocks.push('<strong>Parser warnings:</strong>');
    blocks.push('<ul>');
    model.warnings.forEach((w) => {
      blocks.push(`<li>${escapeHtml(w)}</li>`);
    });
    blocks.push('</ul>');
    blocks.push('</div>');
  }

  blocks.push('</section>');
  return blocks.join('\n');
}

function remarkQuizdown() {
  return (tree) => {
    let quizCounter = 0;
    visit(tree, 'code', (node) => {
      if (node.lang !== 'quiz' && node.lang !== 'quizz') return;

      const sourceText = node.value || '';
      const model = parseQuizdown(sourceText);
      const flags = parseMetaFlags(node.meta);
      const json = JSON.stringify(model, null, 2);
      quizCounter += 1;
      const blockId = `quizdown-${quizCounter}`;
      const renderedHtml = renderQuizHtml(model, blockId);

      node.type = 'html';
      node.value = renderedHtml;
      if (flags.debug) {
        node.value += '\n' + [
          '<div class="quizdown-debug">',
          '<p><strong>Quiz source text (experimental)</strong></p>',
          '<pre><code class="language-text">',
          escapeHtml(sourceText),
          '</code></pre>',
          '<p><strong>Parsed quiz model (experimental)</strong></p>',
          '<pre><code class="language-json">',
          escapeHtml(json),
          '</code></pre>',
          '</div>',
        ].join('\n');
      }
      delete node.lang;
      delete node.meta;
    });
  };
}

remarkQuizdown.parseQuizdown = parseQuizdown;
remarkQuizdown.renderQuizHtml = renderQuizHtml;

export { parseQuizdown, renderQuizHtml };
export default remarkQuizdown;
