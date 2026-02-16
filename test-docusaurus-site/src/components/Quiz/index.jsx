import React, { useMemo, useState } from 'react';
import styles from './styles.module.css';

export default function Quiz({ title = 'Beginner Quiz', questions = [] }) {
  const [selectedByQuestion, setSelectedByQuestion] = useState({});
  const [hintVisibleByQuestion, setHintVisibleByQuestion] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = useMemo(
    () => Object.keys(selectedByQuestion).length,
    [selectedByQuestion]
  );

  const score = useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce((sum, q, i) => {
      return sum + (selectedByQuestion[i] === q.correctIndex ? 1 : 0);
    }, 0);
  }, [questions, selectedByQuestion, submitted]);

  const onSelect = (qIndex, optionIndex) => {
    setSelectedByQuestion((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSubmitted(true);
  };

  const onReset = () => {
    setSelectedByQuestion({});
    setHintVisibleByQuestion({});
    setSubmitted(false);
  };

  if (!questions.length) {
    return null;
  }

  return (
    <section className={styles.quiz}>
      <h2>{title}</h2>
      <p className={styles.meta}>
        {answeredCount}/{questions.length} answered
      </p>

      <form onSubmit={onSubmit}>
        {questions.map((q, qIndex) => {
          const selected = selectedByQuestion[qIndex];
          const isAnswered = selected !== undefined;
          const isCorrect = submitted && selected === q.correctIndex;
          const isWrong = submitted && isAnswered && selected !== q.correctIndex;

          return (
            <fieldset className={styles.card} key={q.question}>
              <legend className={styles.question}>
                {qIndex + 1}. {q.question}
              </legend>

              <div className={styles.options}>
                {q.options.map((option, optionIndex) => {
                  const checked = selected === optionIndex;
                  const optionIsCorrect = optionIndex === q.correctIndex;
                  const optionIsSelectedWrong = submitted && checked && !optionIsCorrect;
                  const optionIsSelectedCorrect = submitted && checked && optionIsCorrect;
                  const optionIsMissedCorrect = submitted && !checked && optionIsCorrect;
                  const optionClassName = [
                    styles.option,
                    optionIsSelectedCorrect ? styles.optionSelectedCorrect : '',
                    optionIsSelectedWrong ? styles.optionSelectedWrong : '',
                    optionIsMissedCorrect ? styles.optionMissedCorrect : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <label className={optionClassName} key={`${qIndex}-${optionIndex}`}>
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        checked={checked}
                        required
                        onInvalid={(e) => {
                          e.currentTarget.setCustomValidity('Select an answer');
                        }}
                        onChange={(e) => {
                          onSelect(qIndex, optionIndex);
                          const form = e.currentTarget.form;
                          if (form) {
                            form
                              .querySelectorAll(`input[name="q-${qIndex}"]`)
                              .forEach((input) => input.setCustomValidity(''));
                          }
                        }}
                      />
                      <span>{option}</span>
                      {optionIsSelectedCorrect && <span className={styles.resultIcon}>✓</span>}
                      {optionIsSelectedWrong && <span className={styles.resultIcon}>✕</span>}
                    </label>
                  );
                })}
              </div>

              {submitted && (
                <p className={isCorrect ? styles.correct : styles.wrong}>
                  {isCorrect ? 'Correct.' : isWrong ? 'Incorrect.' : ''}
                </p>
              )}

              {q.explanation && (
                <div className={styles.hintBlock}>
                  <button
                    type="button"
                    className="button button--secondary button--sm"
                    onClick={() =>
                      setHintVisibleByQuestion((prev) => ({
                        ...prev,
                        [qIndex]: !prev[qIndex],
                      }))
                    }
                  >
                    {hintVisibleByQuestion[qIndex] ? 'Hide hint' : 'Show hint'}
                  </button>
                  {hintVisibleByQuestion[qIndex] && (
                    <p className={styles.hintText}>{q.explanation}</p>
                  )}
                </div>
              )}
            </fieldset>
          );
        })}

        <div className={styles.actions}>
          <button className="button button--primary" type="submit">
            Check answers
          </button>
          <button className="button button--secondary" type="button" onClick={onReset}>
            Reset
          </button>
        </div>
      </form>

      {submitted && (
        <p className={styles.score}>
          Score: {score}/{questions.length}
        </p>
      )}
    </section>
  );
}
