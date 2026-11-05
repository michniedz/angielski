export function plural(count, one, few, many) {
  const abs = Math.abs(count)
  if (abs === 1) return one

  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function wordsLabel(count) {
  return `${count} ${plural(count, 'słówko', 'słówka', 'słów')}`
}

export function unitsLabel(count) {
  return `${count} ${plural(count, 'dział', 'działy', 'działów')}`
}
