import { isMastered } from '../lib/study.js'
import { makeWordKey } from '../lib/storage.js'
import { plural, unitsLabel, wordsLabel } from '../lib/plural.js'
import { IconArrow, IconBack } from './icons.jsx'

export default function ClassScreen({ cls, progress, onBack, onOpenSetup }) {
  const units = cls.units.map((unit, index) => {
    const mastered = unit.words.filter((word) => isMastered(progress[makeWordKey(word)])).length
    return {
      unit,
      index,
      mastered,
      percent: unit.words.length ? Math.round((mastered / unit.words.length) * 100) : 0,
    }
  })

  const unitsWithWords = units.filter((item) => item.unit.words.length > 0)
  const totalWords = unitsWithWords.reduce((sum, item) => sum + item.unit.words.length, 0)
  const totalMastered = unitsWithWords.reduce((sum, item) => sum + item.mastered, 0)

  return (
    <>
      <header className="page-head">
        <button className="back" onClick={onBack}>
          <IconBack />
          Wszystkie klasy
        </button>
        <h1>{cls.label}</h1>
        <p className="page-sub">
          {totalWords > 0
            ? `${unitsLabel(unitsWithWords.length)} · ${wordsLabel(totalWords)}`
            : 'Materiał w przygotowaniu.'}
        </p>
        {totalWords > 0 && (
          <div className="page-stats">
            <span className="chip">
              <strong>{totalMastered}</strong> opanowanych
            </span>
            <span className="chip">
              <strong>{totalWords - totalMastered}</strong> do powtórki
            </span>
          </div>
        )}
      </header>

      {totalWords > 0 ? (
        <>
          <div className="class-cta">
            <div>
              <h2>Cała klasa w jednej sesji</h2>
              <p>
                {wordsLabel(totalWords)} ze wszystkich działów — świetne przed sprawdzianem.
              </p>
            </div>
            <button
              className="btn"
              onClick={() => onOpenSetup(cls.id, unitsWithWords.map((item) => item.unit.id))}
            >
              Ucz się z całej klasy
              <IconArrow />
            </button>
          </div>

          <div className="unit-grid">
            {units.map(({ unit, index, mastered, percent }) => (
              <button
                key={unit.id}
                className={`unit-card ${unit.words.length ? 'has-words' : ''}`}
                disabled={unit.words.length === 0}
                onClick={() => onOpenSetup(cls.id, [unit.id])}
              >
                <span className="unit-num">{index + 1}</span>
                <span className="unit-info">
                  <span className="unit-title">{unit.label}</span>
                  {unit.title && <span className="unit-sub">{unit.title}</span>}
                  <span className="unit-meta">
                    {unit.words.length
                      ? `${plural(unit.sections.length, 'część', 'części', 'części')} · ${wordsLabel(unit.words.length)} · ${mastered} ${plural(mastered, 'opanowane', 'opanowane', 'opanowanych')}`
                      : 'Materiał w przygotowaniu'}
                  </span>
                  {unit.words.length > 0 && (
                    <span className="progress-track small">
                      <span style={{ width: `${percent}%` }} />
                    </span>
                  )}
                </span>
                <span className="unit-arrow">
                  <IconArrow />
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state panel">
          <h2>Materiał w przygotowaniu</h2>
          <p>
            Słówka z podręcznika dla klasy {cls.short} pojawią się tutaj. Na razie
            dostępna jest klasa 6.
          </p>
        </div>
      )}
    </>
  )
}
