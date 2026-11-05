import { makeWordKey } from './storage.js'

export const MASTERED_BOX = 3

export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function isMastered(entry) {
  return Boolean(entry && entry.box >= MASTERED_BOX)
}

export function filterByScope(words, scope, progress) {
  if (scope === 'difficult') {
    return words.filter((word) => {
      const entry = progress[makeWordKey(word)]
      return entry && entry.wrong > 0 && entry.box < MASTERED_BOX
    })
  }
  if (scope === 'new') {
    return words.filter((word) => !progress[makeWordKey(word)])
  }
  return words
}

export function makeQuestions(words, direction, count) {
  const pool = shuffle(words)
  const picked = count && count > 0 ? pool.slice(0, count) : pool
  return picked.map((word) => ({
    word,
    dir:
      direction === 'mix'
        ? Math.random() < 0.5
          ? 'en-pl'
          : 'pl-en'
        : direction,
  }))
}

export function promptOf(question) {
  return question.dir === 'en-pl' ? question.word.en : question.word.pl
}

export function answerOf(question) {
  return question.dir === 'en-pl' ? question.word.pl : question.word.en
}

function fieldFor(direction) {
  return direction === 'en-pl' ? 'pl' : 'en'
}

export function buildOptions(word, direction, pool) {
  const field = fieldFor(direction)
  const correct = word[field]
  const normalize = (value) => String(value).toLowerCase().trim()
  const used = new Set([normalize(correct)])
  const options = []

  for (const candidate of shuffle(pool)) {
    if (candidate === word) continue
    const value = candidate[field]
    if (!value) continue
    const key = normalize(value)
    if (used.has(key)) continue
    if (normalize(candidate[field === 'pl' ? 'en' : 'pl']) === normalize(word[field === 'pl' ? 'en' : 'pl'])) {
      continue
    }
    used.add(key)
    options.push(value)
    if (options.length === 3) break
  }

  return shuffle([correct, ...options])
}

const DIACRITICS = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
}

function simplify(value) {
  return String(value)
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[.,!?;:"'`]/g, '')
    .replace(/[ąćęłńóśźż]/g, (char) => DIACRITICS[char] || char)
    .replace(/\s+/g, ' ')
    .trim()
}

function stripArticle(value) {
  return value.replace(/^(to|a|an|the)\s+/, '')
}

export function splitAnswers(answer) {
  return String(answer)
    .split(/\s*[/;]\s*|,\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function checkTyping(input, answer) {
  const typed = simplify(input)
  if (!typed) return false

  return [String(answer), ...splitAnswers(answer)].some((variant) => {
    const expected = simplify(variant)
    if (!expected) return false
    if (expected === typed) return true
    return stripArticle(expected) === stripArticle(typed)
  })
}
