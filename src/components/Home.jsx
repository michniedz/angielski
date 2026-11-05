import { isMastered } from '../lib/study.js'
import { makeWordKey } from '../lib/storage.js'
import { unitsLabel, wordsLabel } from '../lib/plural.js'
import { IconArrow, IconCards, IconKeyboard, IconQuiz } from './icons.jsx'

function classStats(cls, progress) {
  const words = cls.units.flatMap((unit) => unit.words)
  const mastered = words.filter((word) => isMastered(progress[makeWordKey(word)])).length
  return {
    words: words.length,
    mastered,
    units: cls.units.filter((unit) => unit.words.length > 0).length,
  }
}

export default function Home({ classes, progress, onOpenClass }) {
  const stats = classes.map((cls) => ({ cls, ...classStats(cls, progress) }))
  const totalWords = stats.reduce((sum, item) => sum + item.words, 0)
  const totalMastered = stats.reduce((sum, item) => sum + item.mastered, 0)
  const readyClasses = stats.filter((item) => item.words > 0).length

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Nauka słówek · szkoła podstawowa</p>
          <h1>
            Angielski
            <br />
            <span className="mark">słowo po słowie.</span>
          </h1>
          <p className="lead">
            Fiszki, test wyboru i pisanie — w obie strony. Ucz się słówek z podręcznika,
            powtarzaj trudne i patrz, jak rośnie Twoja lista opanowanych słów.
          </p>
          <div className="hero-actions">
            <button className="btn primary big" onClick={() => onOpenClass('klasa-6')}>
              Zacznij od klasy 6
              <IconArrow />
            </button>
            <a className="btn ghost big" href="#klasy">
              Wybierz klasę
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>{totalWords}</strong>
              <span>słów w bazie</span>
            </div>
            <div className="stat">
              <strong>{totalMastered}</strong>
              <span>opanowanych</span>
            </div>
            <div className="stat">
              <strong>{readyClasses}/8</strong>
              <span>klas z materiałem</span>
            </div>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-card art-1">
            <span>holiday</span>
            <small>wakacje</small>
          </div>
          <div className="art-card art-2">
            <span>friend</span>
            <small>przyjaciel</small>
          </div>
          <div className="art-card art-3">
            <span>apple</span>
            <small>jabłko</small>
          </div>
        </div>
      </section>

      <div className="section-head" id="klasy">
        <div>
          <h2>Wybierz klasę</h2>
          <p>Materiał z podręcznika podzielony na działy.</p>
        </div>
      </div>

      <div className="class-grid">
        {stats.map(({ cls, words, mastered, units }) => {
          const empty = words === 0
          const percent = words ? Math.round((mastered / words) * 100) : 0

          return (
            <button
              key={cls.id}
              className={`class-card ${empty ? 'is-empty' : ''}`}
              onClick={() => onOpenClass(cls.id)}
            >
              <span className="class-num">{cls.short}</span>
              <span className="class-info">
                <span className="class-title">{cls.label}</span>
                <span className="class-meta">
                  {empty
                    ? 'Materiał w przygotowaniu'
                    : `${unitsLabel(units)} · ${wordsLabel(words)}`}
                </span>
                {!empty && (
                  <span className="progress-track small">
                    <span style={{ width: `${percent}%` }} />
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className="feature-row">
        <article className="feature">
          <span className="feature-icon">
            <IconCards />
          </span>
          <div>
            <h3>Fiszki</h3>
            <p>Odwróć kartę i oceń, czy znasz słówko.</p>
          </div>
        </article>
        <article className="feature">
          <span className="feature-icon">
            <IconQuiz />
          </span>
          <div>
            <h3>Test wyboru</h3>
            <p>Cztery odpowiedzi, jedna poprawna.</p>
          </div>
        </article>
        <article className="feature">
          <span className="feature-icon">
            <IconKeyboard />
          </span>
          <div>
            <h3>Pisanie</h3>
            <p>Wpisz tłumaczenie z pamięci.</p>
          </div>
        </article>
      </div>
    </>
  )
}
