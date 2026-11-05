import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { buildCurriculum } from './data/curriculum.js'
import { loadProgress, makeWordKey, saveProgress } from './lib/storage.js'
import { filterByScope } from './lib/study.js'
import Home from './components/Home.jsx'
import ClassScreen from './components/ClassScreen.jsx'
import StudyScreen from './components/StudyScreen.jsx'
import Session from './components/Session.jsx'

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [route, setRoute] = useState({ name: 'home' })

  useEffect(() => saveProgress(progress), [progress])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route])

  const classes = useMemo(() => buildCurriculum(), [])

  function goHome() {
    setRoute({ name: 'home' })
  }

  function recordAnswer(word, correct) {
    const key = makeWordKey(word)
    setProgress((previous) => {
      const entry = previous[key] || { right: 0, wrong: 0, box: 0, seen: 0 }
      return {
        ...previous,
        [key]: {
          right: entry.right + (correct ? 1 : 0),
          wrong: entry.wrong + (correct ? 0 : 1),
          seen: entry.seen + 1,
          box: correct ? Math.min(5, entry.box + 1) : 0,
          lastSeen: Date.now(),
        },
      }
    })
  }

  function startSession(config) {
    const cls = classes.find((item) => item.id === config.classId)
    if (!cls) return

    const units = cls.units.filter((unit) => config.unitIds.includes(unit.id))
    const allWords = units.flatMap((unit) => unit.words)
    const pool =
      config.sectionId && config.sectionId !== 'all'
        ? allWords.filter((word) => word.sectionId === config.sectionId)
        : allWords
    const words = filterByScope(pool, config.scope, progress)
    if (words.length === 0) return

    const baseTitle = units.length === 1 ? units[0].label : `Cała klasa ${cls.short}`

    setRoute({
      ...config,
      name: 'session',
      words,
      allWords,
      title: config.sectionLabel ? `${baseTitle} · ${config.sectionLabel}` : baseTitle,
      classTitle: cls.label,
    })
  }

  function renderScreen() {
    if (route.name === 'session') {
      return (
        <Session
          classTitle={route.classTitle}
          title={route.title}
          direction={route.direction}
          mode={route.mode}
          count={route.count}
          words={route.words}
          allWords={route.allWords}
          onAnswer={recordAnswer}
          onExit={() =>
            setRoute({
              name: 'setup',
              classId: route.classId,
              unitIds: route.unitIds,
              sectionId: route.sectionId || 'all',
            })
          }
        />
      )
    }

    if (route.name === 'class') {
      const cls = classes.find((item) => item.id === route.classId)
      if (cls) {
        return (
          <ClassScreen
            cls={cls}
            progress={progress}
            onBack={goHome}
            onOpenSetup={(classId, unitIds) => setRoute({ name: 'setup', classId, unitIds })}
          />
        )
      }
    }

    if (route.name === 'setup') {
      const cls = classes.find((item) => item.id === route.classId)
      const units = cls
        ? cls.units.filter((unit) => route.unitIds.includes(unit.id))
        : []

      if (cls && units.length > 0) {
        return (
          <StudyScreen
            key={`${cls.id}-${route.unitIds.join(',')}-${route.sectionId || 'all'}`}
            cls={cls}
            units={units}
            progress={progress}
            initialSection={route.sectionId || 'all'}
            onBack={() => setRoute({ name: 'class', classId: cls.id })}
            onStart={startSession}
          />
        )
      }
    }

    return (
      <Home
        classes={classes}
        progress={progress}
        onOpenClass={(classId) => setRoute({ name: 'class', classId })}
      />
    )
  }

  const showChrome = route.name !== 'session'

  return (
    <div className="app">
      {showChrome && (
        <header className="topbar">
          <div className="topbar-inner">
            <button className="brand" onClick={goHome}>
              <span className="brand-badge">Aa</span>
              <span className="brand-text">
                Angielski
                <small>od podstaw</small>
              </span>
            </button>
            <nav className="topnav">
              <button
                type="button"
                className={route.classId === 'klasa-6' ? 'active' : ''}
                onClick={() => setRoute({ name: 'class', classId: 'klasa-6' })}
              >
                Klasa 6
              </button>
            </nav>
          </div>
        </header>
      )}

      <main className={showChrome ? 'container' : 'session-wrap'}>{renderScreen()}</main>

      {showChrome && (
        <footer className="site-footer">
          Angielski od podstaw · słówka z podręcznika, postępy zapisują się w przeglądarce
        </footer>
      )}
    </div>
  )
}
