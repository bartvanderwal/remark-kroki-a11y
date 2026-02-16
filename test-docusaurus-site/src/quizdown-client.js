function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function evaluateQuestion(questionEl) {
  const type = questionEl.dataset.questionType;
  const feedbackEl = questionEl.querySelector('.quizdown-question-feedback');
  if (!feedbackEl) return false;

  if (type === 'single' || type === 'multiple') {
    const inputs = Array.from(questionEl.querySelectorAll('.quizdown-option-input'));
    const checked = inputs.filter((i) => i.checked && !i.disabled);
    const correct = inputs.filter((i) => i.dataset.correct === 'true');
    const wrongChecked = checked.filter((i) => i.dataset.correct !== 'true');
    const missedCorrect = correct.filter((i) => !i.checked);

    const isCorrect =
      wrongChecked.length === 0 &&
      missedCorrect.length === 0 &&
      checked.length > 0;
    feedbackEl.textContent = isCorrect ? 'Correct.' : 'Incorrect.';
    questionEl.classList.toggle('quizdown-question-correct', isCorrect);
    questionEl.classList.toggle('quizdown-question-wrong', !isCorrect);
    return isCorrect;
  }

  if (type === 'open_short') {
    const input = questionEl.querySelector('.quizdown-open-input');
    if (!input) return false;
    const acceptedJson = decodeURIComponent(input.dataset.accepted || '%5B%5D');
    let accepted = [];
    try {
      accepted = JSON.parse(acceptedJson);
    } catch {
      accepted = [];
    }
    const value = normalizeText(input.value);
    const isCorrect = accepted.some((a) => normalizeText(a) === value);
    feedbackEl.textContent = isCorrect ? 'Correct.' : 'Incorrect.';
    questionEl.classList.toggle('quizdown-question-correct', isCorrect);
    questionEl.classList.toggle('quizdown-question-wrong', !isCorrect);
    return isCorrect;
  }

  return false;
}

function onStrikeToggleClick(btn) {
  const row = btn.closest('.quizdown-option-row');
  if (!row) return;
  const input = row.querySelector('.quizdown-option-input');
  const label = row.querySelector('.quizdown-option-label');
  const optionText = label ? label.textContent.trim() : 'option';
  if (!input) return;

  const struck = row.classList.toggle('quizdown-option-struck');
  if (struck) {
    input.checked = false;
    input.disabled = true;
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', `Restore option: ${optionText}`);
    btn.setAttribute('title', 'Restore option');
  } else {
    input.disabled = false;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', `Strike out option: ${optionText}`);
    btn.setAttribute('title', 'Strike out option');
  }
}

function onQuizSubmit(form, event) {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const questions = Array.from(form.querySelectorAll('.quizdown-question'));
  let correctCount = 0;
  questions.forEach((q) => {
    if (evaluateQuestion(q)) correctCount += 1;
  });

  const scoreEl = form.querySelector('.quizdown-score');
  if (scoreEl) {
    scoreEl.textContent = `Score: ${correctCount}/${questions.length}`;
  }
}

function onQuizReset(form) {
  form.reset();
  form.querySelectorAll('.quizdown-option-row').forEach((row) => {
    row.classList.remove('quizdown-option-struck');
    const input = row.querySelector('.quizdown-option-input');
    if (input) input.disabled = false;
    const btn = row.querySelector('.quizdown-strike-toggle');
    const label = row.querySelector('.quizdown-option-label');
    const optionText = label ? label.textContent.trim() : 'option';
    if (btn) {
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', `Strike out option: ${optionText}`);
      btn.setAttribute('title', 'Strike out option');
    }
  });
  form.querySelectorAll('.quizdown-question').forEach((q) => {
    q.classList.remove('quizdown-question-correct', 'quizdown-question-wrong');
    const feedback = q.querySelector('.quizdown-question-feedback');
    if (feedback) feedback.textContent = '';
  });
  const scoreEl = form.querySelector('.quizdown-score');
  if (scoreEl) scoreEl.textContent = '';

  form.querySelectorAll('.quizdown-hint-text').forEach((hint) => {
    hint.hidden = true;
  });
  form.querySelectorAll('.quizdown-hint-toggle').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Show hint';
  });
}

function onHintToggleClick(btn) {
  const targetId = btn.getAttribute('aria-controls');
  if (!targetId) return;
  const hint = document.getElementById(targetId);
  if (!hint) return;

  const expanded = btn.getAttribute('aria-expanded') === 'true';
  const nextExpanded = !expanded;
  btn.setAttribute('aria-expanded', nextExpanded ? 'true' : 'false');
  btn.textContent = nextExpanded ? 'Hide hint' : 'Show hint';
  hint.hidden = !nextExpanded;
}

function initQuizdownClient() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  if (window.__quizdownClientInitialized) return;
  window.__quizdownClientInitialized = true;

  document.addEventListener('click', (event) => {
    const strikeBtn = event.target.closest('.quizdown-strike-toggle');
    if (strikeBtn) {
      onStrikeToggleClick(strikeBtn);
      return;
    }

    const resetBtn = event.target.closest('.quizdown-reset-btn');
    if (resetBtn) {
      const form = resetBtn.closest('.quizdown-form');
      if (form) onQuizReset(form);
      return;
    }

    const hintBtn = event.target.closest('.quizdown-hint-toggle');
    if (hintBtn) {
      onHintToggleClick(hintBtn);
    }
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('.quizdown-form');
    if (!form) return;
    onQuizSubmit(form, event);
  });
}

initQuizdownClient();
