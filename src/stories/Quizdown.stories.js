import { userEvent, within, expect, waitFor } from 'storybook/test';
import '../../test-docusaurus-site/src/quizdown-client.js';
import '../../test-docusaurus-site/src/css/custom.css';
import { renderQuizHtml } from '../../test-docusaurus-site/src/remark/remark-quizdown.mjs';

const storyQuizModel = {
  version: '0.1.0-draft',
  questions: [
    {
      id: 'q1',
      prompt: 'Which diagram shows flow across phases?',
      questionType: 'single',
      options: [
        { text: 'Class diagram', isCorrect: false, forcedOrder: null },
        { text: 'Activity diagram', isCorrect: true, forcedOrder: null },
      ],
      hint: 'Hint: The article uses partitions for the three-phase overview.',
    },
    {
      id: 'q2',
      prompt: 'Which statements about sequence diagrams are correct?',
      questionType: 'multiple',
      options: [
        { text: 'They show interactions over time.', isCorrect: true, forcedOrder: null },
        { text: 'They replace all class diagrams.', isCorrect: false, forcedOrder: null },
        { text: 'They can show self-messages.', isCorrect: true, forcedOrder: null },
      ],
    },
    {
      id: 'q3',
      prompt: 'Name one participant from the Red Riding Hood sequence diagrams.',
      questionType: 'open_short',
      options: [],
      acceptedAnswers: ['wolf', 'little red', 'grandmother', 'huntsman'],
      maxLength: 20,
    },
  ],
  warnings: [],
};

const createQuizHtml = () => renderQuizHtml(storyQuizModel, 'story-quiz');

export default {
  title: 'General/Quizdown',
  tags: ['autodocs'],
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = createQuizHtml();
    return container;
  },
};

export const Default = {};

export const RequiredValidation = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Submit blocked when required questions are unanswered', async () => {
      const submit = canvas.getByRole('button', { name: /check answers/i });
      await userEvent.click(submit);
      const form = canvasElement.querySelector('.quizdown-form');
      expect(form.checkValidity()).toBe(false);
      const score = canvasElement.querySelector('.quizdown-score');
      expect(score.textContent).toBe('');
    });
  },
};

export const HintToggle = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Show and hide question hint on demand', async () => {
      const toggle = canvas.getByRole('button', { name: /show hint/i });
      const hint = canvasElement.querySelector('#q1-hint');
      expect(hint.hidden).toBe(true);
      await userEvent.click(toggle);
      await waitFor(() => expect(hint.hidden).toBe(false));
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await userEvent.click(toggle);
      await waitFor(() => expect(hint.hidden).toBe(true));
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

export const WrongThenRight = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Submit wrong answers', async () => {
      await userEvent.click(canvas.getByLabelText('Class diagram'));
      await userEvent.click(canvas.getByLabelText('They show interactions over time.'));
      await userEvent.type(canvas.getByPlaceholderText('Type your answer'), 'wolf');
      await userEvent.click(canvas.getByRole('button', { name: /check answers/i }));
      const q1 = canvasElement.querySelectorAll('.quizdown-question')[0];
      expect(q1.classList.contains('quizdown-question-wrong')).toBe(true);
      const score = canvasElement.querySelector('.quizdown-score');
      expect(score.textContent).toContain('Score: 2/3');
    });
    await step('Reset and submit correct answers', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /reset/i }));
      await userEvent.click(canvas.getByLabelText('Activity diagram'));
      await userEvent.click(canvas.getByLabelText('They show interactions over time.'));
      await userEvent.click(canvas.getByLabelText('They can show self-messages.'));
      await userEvent.type(canvas.getByPlaceholderText('Type your answer'), 'huntsman');
      await userEvent.click(canvas.getByRole('button', { name: /check answers/i }));
      const score = canvasElement.querySelector('.quizdown-score');
      expect(score.textContent).toContain('Score: 3/3');
    });
  },
};

export const StrikeOutOption = {
  play: async ({ canvasElement, step }) => {
    await step('Strike and restore an option', async () => {
      const strikeButtons = canvasElement.querySelectorAll('.quizdown-strike-toggle');
      const firstStrike = strikeButtons[0];
      const row = firstStrike.closest('.quizdown-option-row');
      const input = row.querySelector('.quizdown-option-input');
      expect(input.disabled).toBe(false);
      await userEvent.click(firstStrike);
      expect(row.classList.contains('quizdown-option-struck')).toBe(true);
      expect(input.disabled).toBe(true);
      await userEvent.click(firstStrike);
      expect(row.classList.contains('quizdown-option-struck')).toBe(false);
      expect(input.disabled).toBe(false);
    });
  },
};
