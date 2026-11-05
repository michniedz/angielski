import { CLASS_6_UNITS } from './klasa6.js'

// Buduje sekcje działu z danych podręcznika.
function buildSections(unitData) {
  return unitData.sections.map((section) => {
    const words = section.words.map(([en, pl]) => ({
      en,
      pl,
      sectionId: section.code,
    }))

    return {
      id: section.code,
      code: section.code,
      name: section.name,
      label: `${section.name} ${section.code}`,
      words,
    }
  })
}

function buildUnit(unitData) {
  const sections = buildSections(unitData)
  const words = sections.flatMap((section) =>
    section.words.map((word) => ({
      ...word,
      sectionId: section.id,
      sectionLabel: section.label,
    })),
  )

  return {
    id: `unit-${unitData.number}`,
    label: `Unit ${unitData.number}`,
    title: '',
    sections,
    words,
  }
}

export const CLASSES = [
  { id: 'klasa-1', label: 'Klasa 1', short: '1', units: [] },
  { id: 'klasa-2', label: 'Klasa 2', short: '2', units: [] },
  { id: 'klasa-3', label: 'Klasa 3', short: '3', units: [] },
  { id: 'klasa-4', label: 'Klasa 4', short: '4', units: [] },
  { id: 'klasa-5', label: 'Klasa 5', short: '5', units: [] },
  {
    id: 'klasa-6',
    label: 'Klasa 6',
    short: '6',
    units: CLASS_6_UNITS.map(buildUnit),
  },
  { id: 'klasa-7', label: 'Klasa 7', short: '7', units: [] },
  { id: 'klasa-8', label: 'Klasa 8', short: '8', units: [] },
]

// Dodaje do słówek informacje o klasie i dziale (potrzebne do klucza postępu).
export function buildCurriculum() {
  return CLASSES.map((cls) => ({
    ...cls,
    units: cls.units.map((unit) => {
      const withIds = (word) => ({
        ...word,
        classId: cls.id,
        unitId: unit.id,
      })

      return {
        ...unit,
        classId: cls.id,
        words: unit.words.map(withIds),
        sections: unit.sections.map((section) => ({
          ...section,
          words: section.words.map(withIds),
        })),
      }
    }),
  }))
}
