import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { answerOf, buildOptions, checkTyping, makeQuestions, promptOf } from '../lib/study.js'
import { plural } from '../lib/plural.js'
import { IconArrow, IconClose } from './icons.jsx'
import SpeakButton from './SpeakButton.jsx'

const MODE_LABEL = {
  flashcards: 'Fiszki',
  quiz: 'Test wyboru',
  typing: 'Pisanie',
}

const DIR_LABEL = {
  'en-pl': 'EN → PL',
  'pl-en': 'PL → EN',
  mix: 'Mieszany',
}

// Dłuższe tłumaczenia dostają mniejszy rozmiar czcionki, żeby mieściły się na karcie.
function textSizeClass(text) {
  const length = String(text).length
  if (length > 44) return ' is-very-long'
  if (length > 24) return ' is-long'
  return ''
}

export default function Session({
  classTitle,
  title,
  direction,
  mode,
  count,
  words,
  allWords,
  onAnswer,
  onExit,
}) {
  const [queue, setQueue] = useState(() => makeQuestions(words, direction, count))
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState([])
  const lock = useRef(false)

  useEffect(() => {
    lock.current = false
  }, [index])

  const total = queue.length
  const finished = index >= total
  const question = queue[index]

  function handleAnswer(correct) {
    if (lock.current || !question) return
    lock.current = true
    onAnswer(question.word, correct)
    setResults((previous) => [...previous, { ...question, correct }])
    setIndex((value) => value + 1)
  }

  function restart(list) {
    setQueue(makeQuestions(list, direction, null))
    setResults([])
    setIndex(0)
    lock.current = false
  }

  if (finished) {
    return (
      <div className="session">
        <Results
          results={results}
          onRepeatErrors={restart}
          onRestart={() => restart(words)}
          onExit={onExit}
        />
      </div>
    )
  }

  const percent = total ? Math.round((index / total) * 100) : 0

  return (
    <div className="session">
      <header className="session-top">
        <button className="icon-btn" onClick={onExit} aria-label="Zakończ sesję" title="Zakończ">
          <IconClose />
        </button>
        <div className="session-progress">
          <div className="session-meta">
            <b>{title}</b>
            <span>·</span>
            <span>{MODE_LABEL[mode]}</span>
            <span>·</span>
            <span>{DIR_LABEL[direction]}</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>
        <span className="session-count">
          {Math.min(index + 1, total)}/{total}
        </span>
      </header>

      {mode === 'flashcards' && (
        <FlashcardQuestion key={index} question={question} onAnswer={handleAnswer} />
      )}
      {mode === 'quiz' && (
        <QuizQuestion
          key={index}
          question={question}
          pool={allWords}
          onAnswer={handleAnswer}
        />
      )}
      {mode === 'typing' && (
        <TypingQuestion key={index} question={question} onAnswer={handleAnswer} />
      )}

      <p className="session-foot">{classTitle}</p>
    </div>
  )
}

function FlashcardQuestion({ question, onAnswer }) {
  const [flipped, setFlipped] = useState(false)
  const isEn = question.dir === 'en-pl'
  const prompt = isEn ? question.word.en : question.word.pl
  const answer = isEn ? question.word.pl : question.word.en

  useEffect(() => {
    function onKey(event) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        setFlipped((value) => !value)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        onAnswer(true)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onAnswer(false)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAnswer])

  return (
    <div className="q-area">
      <p className="q-eyebrow">
        {isEn ? 'Przetłumacz na polski' : 'Przetłumacz na angielski'}
      </p>

      <div
        className={`flashcard ${flipped ? 'is-flipped' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={
          flipped
            ? `Odpowiedź: ${answer}. Kliknij, aby wrócić do pytania`
            : `Karta: ${prompt}. Kliknij, aby odwrócić`
        }
        onClick={() => setFlipped((value) => !value)}
      >
        <div className="flashcard-inner">
          <div className="flashcard-face front">
            <span className="lang-tag">{isEn ? 'Angielski' : 'Polski'}</span>
            <span className={`flashcard-word${textSizeClass(prompt)}`}>{prompt}</span>
            {isEn && <SpeakButton text={question.word.en} />}
            <span className="flashcard-hint">Kliknij, aby odwrócić</span>
          </div>
          <div className="flashcard-face back">
            <span className="lang-tag">{isEn ? 'Polski' : 'Angielski'}</span>
            <span className={`flashcard-word${textSizeClass(answer)}`}>{answer}</span>
            {!isEn && <SpeakButton text={question.word.en} />}
            <span className="flashcard-hint">{isEn ? question.word.en : question.word.pl}</span>
          </div>
        </div>
      </div>

      <div className="answer-row">
        <button className="btn ghost" onClick={() => onAnswer(false)}>
          Jeszcze nie
        </button>
        <button className="btn primary" onClick={() => onAnswer(true)}>
          Umiem
        </button>
      </div>
      <p className="kbd-hint">Spacja odwraca kartę · ← nie znam · → umiem</p>
    </div>
  )
}

function QuizQuestion({ question, pool, onAnswer }) {
  const options = useMemo(
    () => buildOptions(question.word, question.dir, pool),
    [question, pool],
  )
  const correct = answerOf(question)
  const [picked, setPicked] = useState(null)
  const done = useRef(false)
  const isEn = question.dir === 'en-pl'
  const isRight = picked === correct

  const next = useCallback(() => {
    if (!picked || done.current) return
    done.current = true
    onAnswer(isRight)
  }, [picked, isRight, onAnswer])

  useEffect(() => {
    function onKey(event) {
      if (picked) {
        if (event.key === 'Enter') {
          event.preventDefault()
          next()
        }
        return
      }

      const number = Number(event.key)
      if (number >= 1 && number <= options.length) {
        setPicked(options[number - 1])
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [picked, options, next])

  return (
    <div className="q-area">
      <p className="q-eyebrow">
        {isEn ? 'Wybierz polskie tłumaczenie' : 'Wybierz angielskie tłumaczenie'}
      </p>

      <div className="prompt-card">
        <span className="lang-tag">{isEn ? 'Angielski' : 'Polski'}</span>
        <div className={`prompt-word${textSizeClass(promptOf(question))}`}>{promptOf(question)}</div>
        {isEn && <SpeakButton text={question.word.en} />}
      </div>

      <div className="quiz-options">
        {options.map((option, optionIndex) => {
          let className = 'quiz-option'
          if (picked) {
            if (option === correct) className += ' is-correct'
            else if (option === picked) className += ' is-wrong'
            else className += ' is-dim'
          }

          return (
            <button
              key={option}
              type="button"
              className={className}
              disabled={Boolean(picked)}
              onClick={() => setPicked(option)}
            >
              <span className="key">{'ABCD'[optionIndex]}</span>
              <span>{option}</span>
            </button>
          )
        })}
      </div>

      {picked && (
        <div className={`feedback ${isRight ? 'ok' : 'bad'}`}>
          <span className="feedback-text">
            {isRight ? (
              'Dobrze!'
            ) : (
              <>
                Poprawna odpowiedź: <strong>{correct}</strong>
              </>
            )}
            <SpeakButton text={question.word.en} />
          </span>
          <button className="btn primary" onClick={next}>
            Dalej
            <IconArrow />
          </button>
        </div>
      )}
    </div>
  )
}

function TypingQuestion({ question, onAnswer }) {
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(null)
  const done = useRef(false)
  const isEn = question.dir === 'en-pl'
  const correct = answerOf(question)

  function submit(event) {
    event.preventDefault()
    if (checked) return
    setChecked(checkTyping(value, correct) ? 'ok' : 'bad')
  }

  function reveal() {
    if (!checked) setChecked('bad')
  }

  function next() {
    if (done.current) return
    done.current = true
    onAnswer(checked === 'ok')
  }

  return (
    <div className="q-area">
      <p className="q-eyebrow">{isEn ? 'Wpisz po polsku' : 'Wpisz po angielsku'}</p>

      <div className="prompt-card">
        <span className="lang-tag">{isEn ? 'Angielski' : 'Polski'}</span>
        <div className={`prompt-word${textSizeClass(promptOf(question))}`}>{promptOf(question)}</div>
        {isEn && <SpeakButton text={question.word.en} />}
      </div>

      <form className="typing-form" onSubmit={submit}>
        <div className="typing-row">
          <input
            className={`typing-input ${checked === 'ok' ? 'ok' : checked ? 'bad' : ''}`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={Boolean(checked)}
            autoFocus
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={isEn ? 'np. ciocia' : 'np. aunt'}
          />
          {!checked && (
            <button className="btn primary" type="submit" disabled={!value.trim()}>
              Sprawdź
            </button>
          )}
        </div>
      </form>

      {!checked && (
        <button className="link-btn" type="button" onClick={reveal}>
          Nie wiem — pokaż odpowiedź
        </button>
      )}

      {checked && (
        <div className={`feedback ${checked === 'ok' ? 'ok' : 'bad'}`}>
          <span className="feedback-text">
            {checked === 'ok' ? (
              'Dobrze!'
            ) : (
              <>
                Poprawna odpowiedź: <strong>{correct}</strong>
              </>
            )}
            <SpeakButton text={question.word.en} />
          </span>
          <button className="btn primary" onClick={next}>
            Dalej
            <IconArrow />
          </button>
        </div>
      )}
    </div>
  )
}

function Results({ results, onRepeatErrors, onRestart, onExit }) {
  const total = results.length
  const correct = results.filter((result) => result.correct).length
  const percent = total ? Math.round((correct / total) * 100) : 0
  const mistakes = results.filter((result) => !result.correct)

  const headline =
    percent === 100
      ? 'Perfekcyjnie!'
      : percent >= 80
        ? 'Świetna robota!'
        : percent >= 50
          ? 'Dobry początek'
          : 'Jeszcze chwilka'

  const message =
    percent === 100
      ? 'Wszystkie słówka z tej sesji poszły bez błędu.'
      : percent >= 80
        ? 'Zostało tylko kilka słówek do powtórzenia.'
        : percent >= 50
          ? 'Powtórka trudnych słówek zrobi różnicę.'
          : 'Nie stresuj się — każda powtórka coś dodaje.'

  return (
    <div className="results">
      <div
        className="score-ring"
        style={{ '--pct': percent }}
        role="img"
        aria-label={`Wynik ${percent} procent`}
      >
        <div>
          <strong>{percent}%</strong>
          <span>{correct} z {total}</span>
        </div>
      </div>

      <h1>{headline}</h1>
      <p>{message}</p>

      <div className="result-stats">
        <span className="chip">
          <strong>{correct}</strong>{' '}
          {plural(correct, 'poprawna odpowiedź', 'poprawne odpowiedzi', 'poprawnych odpowiedzi')}
        </span>
        <span className="chip">
          <strong>{total - correct}</strong>{' '}
          {plural(total - correct, 'błąd', 'błędy', 'błędów')}
        </span>
        <span className="chip">
          <strong>{total}</strong> {plural(total, 'pytanie', 'pytania', 'pytań')}
        </span>
      </div>

      {mistakes.length > 0 && (
        <div className="mistakes">
          <h2>Do powtórki</h2>
          {mistakes.map((mistake) => (
            <div className="mistake" key={`${mistake.word.en}-${mistake.dir}`}>
              <span className="mistake-en">{mistake.word.en}</span>
              <span className="mistake-pl">{mistake.word.pl}</span>
              <SpeakButton text={mistake.word.en} />
            </div>
          ))}
        </div>
      )}

      <div className="result-actions">
        {mistakes.length > 0 && (
          <button
            className="btn primary"
            onClick={() => onRepeatErrors(mistakes.map((mistake) => mistake.word))}
          >
            Powtórz błędy ({mistakes.length})
          </button>
        )}
        <button className="btn ghost" onClick={onRestart}>
          Jeszcze raz
        </button>
        <button className="btn subtle" onClick={onExit}>
          Wróć do działu
        </button>
      </div>
    </div>
  )
}
