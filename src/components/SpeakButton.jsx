import { speak } from '../lib/speech.js'
import { IconSpeaker } from './icons.jsx'

export default function SpeakButton({ text, className = '' }) {
  return (
    <button
      type="button"
      className={`icon-btn speak ${className}`.trim()}
      title="Wymów po angielsku"
      aria-label={`Wymów: ${text}`}
      onClick={(event) => {
        event.stopPropagation()
        speak(text)
      }}
    >
      <IconSpeaker />
    </button>
  )
}
