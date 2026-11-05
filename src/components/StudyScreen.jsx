import { useMemo, useState } from 'react'
import { filterByScope, isMastered } from '../lib/study.js'
import { makeWordKey } from '../lib/storage.js'
import { plural, wordsLabel } from '../lib/plural.js'
import { IconArrow, IconBack, IconSearch } from './icons.jsx'
import SpeakButton from './SpeakButton.jsx'

const MODES = [
  { id: 'flashcards', label: 'Fiszki', hint: 'Odwracasz kartę i oceniasz, czy znasz słówko.' },
  { id: 'quiz', label: 'Test wyboru', hint: 'Wybierasz poprawną odpowiedź z czterech.' },
  { id: 'typing', label: 'Pisanie', hint: 'Wpisujesz tłumaczenie z klawiatury.' },
]

const DIRECTIONS = [
  { id: 'en-pl', label: 'EN → PL' },
  { id: 'pl-en', label: 'PL → EN' },
  { id: 'mix', label: 'Mieszany' },
]

function Mastery({ entry }) {
  const level = !entry ? 0 : entry.box >= 3 ? 3 : entry.box >= 1 ? 2 : 1
  const title = level === 3 ? 'Opanowane' : level >= 1 ? 'W trakcie nauki' : 'Nowe słówko'

  return (
    <span className={`mastery ${level === 3 ? 'is-mastered' : ''}`} title={title} aria-label={title}>
      {[1, 2, 3].map((dot) => (
        <span key={dot} className={`m-dot ${dot <= level ? 'on' : ''}`} />
      ))}
    </span>
  )
}

export default function StudyScreen({ cls, units, progress, initialSection = 'all', onBack, onStart }) {
  const [direction, setDirection] = useState('en-pl')
  const [mode, setMode] = useState('flashcards')
  const [section, setSection] = useState(initialSection)
  const [scope, setScope] = useState('all')
  const [count, setCount] = useState('10')
  const [query, setQuery] = useState('')

  const isSingleUnit = units.length === 1
  const words = useMemo(() => units.flatMap((unit) => unit.words), [units])
  const sections = isSingleUnit ? units[0].sections : []
  const activeSection = sections.find((item) => item.id === section) || null

  const sectionWords = useMemo(
    () => (section === 'all' ? words : words.filter((word) => word.sectionId === section)),
    [words, section],
  )
  const difficult = useMemo(
    () => filterByScope(sectionWords, 'difficult', progress),
    [sectionWords, progress],
  )
  const fresh = useMemo(
    () => filterByScope(sectionWords, 'new', progress),
    [sectionWords, progress],
  )
  const activeWords = useMemo(
    () => filterByScope(sectionWords, scope, progress),
    [sectionWords, scope, progress],
  )
  const mastered = sectionWords.filter((word) =>
    isMastered(progress[makeWordKey(word)]),
  ).length

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return sectionWords
    return sectionWords.filter(
      (word) =>
        word.en.toLowerCase().includes(needle) || word.pl.toLowerCase().includes(needle),
    )
  }, [sectionWords, query])

  const title = isSingleUnit ? units[0].label : `Cała klasa ${cls.short}`
  const subtitle = activeSection ? `${cls.label} · ${activeSection.label}` : cls.label
  const activeMode = MODES.find((item) => item.id === mode)

  const sessionCount =
    count === 'all' ? activeWords.length : Math.min(Number(count), activeWords.length)
  const canStart = activeWords.length > 0

  const scopes = [
    { id: 'all', label: `Wszystkie (${sectionWords.length})` },
    { id: 'difficult', label: `Trudne (${difficult.length})` },
    { id: 'new', label: `Nowe (${fresh.length})` },
  ]

  return (
    <>
      <header className="page-head study-head">
        <button className="back" onClick={onBack}>
          <IconBack />
          {cls.label}
        </button>
        <div className="page-title-row">
          <div>
            <h1>{title}</h1>
            <p className="page-sub">{subtitle}</p>
          </div>
        </div>
        <div className="page-stats">
          <span className="chip">
            <strong>{sectionWords.length}</strong>{' '}
            {plural(sectionWords.length, 'słówko', 'słówka', 'słów')}
          </span>
          <span className="chip">
            <strong>{mastered}</strong>{' '}
            {plural(mastered, 'opanowane', 'opanowane', 'opanowanych')}
          </span>
          <span className="chip">
            <strong>{difficult.length}</strong> do powtórki
          </span>
        </div>
      </header>

      <section className="setup panel">
        {sections.length > 0 && (
          <div className="section-field">
            <span className="field-label">Część działu</span>
            <div className="section-chips">
              <button
                type="button"
                className={`section-chip ${section === 'all' ? 'active' : ''}`}
                onClick={() => setSection('all')}
              >
                Wszystko <span className="count">{words.length}</span>
              </button>
              {sections.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`section-chip ${section === item.id ? 'active' : ''}`}
                  onClick={() => setSection(item.id)}
                >
                  <b>{item.code}</b> {item.name}
                  <span className="count">{item.words.length}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="setup-grid">
          <div className="field">
            <span className="field-label">Kierunek</span>
            <div className="segmented">
              {DIRECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={direction === item.id ? 'active' : ''}
                  onClick={() => setDirection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Tryb nauki</span>
            <div className="segmented">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={mode === item.id ? 'active' : ''}
                  onClick={() => setMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Zakres</span>
            <div className="segmented">
              {scopes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={scope === item.id ? 'active' : ''}
                  onClick={() => setScope(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Liczba pytań</span>
            <div className="segmented">
              {['10', '20', 'all'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={count === value ? 'active' : ''}
                  onClick={() => setCount(value)}
                >
                  {value === 'all' ? 'Wszystkie' : value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="setup-hint">{activeMode.hint}</p>

        <div className="start-row">
          <button
            className="btn primary big"
            disabled={!canStart}
            onClick={() =>
              onStart({
                classId: cls.id,
                unitIds: units.map((unit) => unit.id),
                direction,
                mode,
                scope,
                count: count === 'all' ? null : Number(count),
                sectionId: section,
                sectionLabel: activeSection ? activeSection.label : null,
              })
            }
          >
            {canStart
              ? `Zacznij naukę · ${sessionCount} ${plural(sessionCount, 'pytanie', 'pytania', 'pytań')}`
              : 'Brak słówek w tym zakresie'}
            {canStart && <IconArrow />}
          </button>
          <span className="start-note">
            {scope === 'difficult' && canStart
              ? 'Powtórka słówek, w których zdarzyły się błędy.'
              : scope === 'new' && canStart
                ? 'Tylko słówka, których jeszcze nie widziałeś.'
                : 'Postęp zapisuje się automatycznie w tej przeglądarce.'}
          </span>
        </div>
      </section>

      <section className="word-panel panel">
        <div className="word-head">
          <h2>Słówka</h2>
          <label className="search">
            <IconSearch />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj po angielsku lub polsku…"
              aria-label="Szukaj słówek"
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="list-empty">Brak słówek pasujących do wyszukiwania.</p>
        ) : (
          <div className="word-rows">
            {filtered.map((word) => (
              <div className="word-row" key={makeWordKey(word)}>
                {section === 'all' && (
                  <span className="section-code" title={word.sectionLabel}>
                    {word.sectionId}
                  </span>
                )}
                <div className="word-main">
                  <span className="word-en">{word.en}</span>
                  <span className="word-pl">{word.pl}</span>
                </div>
                <Mastery entry={progress[makeWordKey(word)]} />
                <SpeakButton text={word.en} />
              </div>
            ))}
          </div>
        )}
        <p className="hint word-count">
          {filtered.length === words.length
            ? `${wordsLabel(words.length)} w tym zestawie`
            : `${filtered.length} z ${sectionWords.length} słówek`}
        </p>
      </section>
    </>
  )
}
