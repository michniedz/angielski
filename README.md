# Angielski od podstaw

Aplikacja do nauki słówek angielskiego ze szkoły podstawowej.
Materiał dla klasy 6 pochodzi z podręcznika i jest podzielony na 8 działów
oraz części działu (Vocabulary, Grammar, Everyday English itd.).

Nauka działa w obie strony: **EN → PL**, **PL → EN** oraz w trybie **mieszanym**.

## Co potrafi

- **Fiszki** — odwracana karta, ocena „Umiem / Jeszcze nie”.
- **Test wyboru** — cztery odpowiedzi, natychmiastowa informacja o błędzie.
- **Pisanie** — wpisywanie tłumaczenia z pamięci (toleruje brak polskich znaków).
- **Wybór części działu** — np. tylko Vocabulary 6a albo cały dział.
- **Trzy zakresy powtórki** — wszystkie słówka, tylko trudne, tylko nowe.
- **Postępy** — zapisują się w przeglądarce (localStorage), osobno dla każdego słówka.
- **Wymowa** — przycisk głośnika czyta angielskie słowo (Web Speech API).

## Uruchomienie

```bash
cd frontend
npm install
npm run dev
```

Następnie otwórz adres wyświetlony w konsoli (zwykle `http://localhost:5173`).

Na Windowsie, jeśli PowerShell blokuje `npm`, użyj `npm.cmd run dev`.

Wersja produkcyjna:

```bash
npm run build
npm run preview
```

## Gdzie są dane

Całe słownictwo klasy 6 znajduje się w pliku `src/data/klasa6.js`
(8 działów, 71 części, 941 słówek). Każda część ma kod i nazwę, np.:

```js
{
  code: '6a',
  name: 'Vocabulary',
  words: [
    ['actually', 'właściwie'],
    ['beard', 'broda'],
  ],
}
```

Aby poprawić lub dodać słówko, wystarczy edytować odpowiednią parę
`[angielski, polski]` w tym pliku. `src/data/curriculum.js` automatycznie
buduje z niego działy, części i klucze postępu.

Postępy są zapisywane w `localStorage` pod kluczem
`angielski-app:progress:v2`. Klucz słówka zawiera klasę, dział, część działu
i angielskie słowo, więc to samo słowo w dwóch częściach nie koliduje.

## Struktura projektu

```text
src/
  App.jsx                 # routing ekranów i zapis postępów
  data/
    klasa6.js             # słówka klasy 6 z podziałem na części
    curriculum.js         # budowa klas, działów, części i kluczy
  lib/
    study.js              # losowanie pytań, dystraktory, sprawdzanie pisowni
    storage.js            # localStorage i klucze słówek
    plural.js             # polska odmiana (słówko / słówka / słów)
    speech.js             # wymowa
  components/
    Home.jsx, ClassScreen.jsx, StudyScreen.jsx
    Session.jsx           # fiszki, test, pisanie, wyniki
```

## Kolejne kroki

- dodanie słówek dla klas 1–5 i 7–8,
- ewentualny harmonogram powtórek (spaced repetition) i tryb „na czas”.
