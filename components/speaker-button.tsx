'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const audioCache = new Map<string, string>()

export function SpeakerButton({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const speak = useCallback(async () => {
    if (state === 'loading') return

    if (state === 'playing') {
      audioRef.current?.pause()
      audioRef.current = null
      setState('idle')
      return
    }

    setState('loading')
    try {
      let url = audioCache.get(text)
      if (!url) {
        const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`)
        if (!res.ok) throw new Error('tts failed')
        const blob = await res.blob()
        url = URL.createObjectURL(blob)
        audioCache.set(text, url)
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setState('idle')
      audio.onerror = () => setState('idle')
      setState('playing')
      await audio.play()
    } catch {
      // Fallback to browser TTS if ElevenLabs is unavailable
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text)
        u.rate = 0.95
        u.lang = 'en-US'
        u.onend = () => setState('idle')
        u.onerror = () => setState('idle')
        setState('playing')
        window.speechSynthesis.speak(u)
      } else {
        setState('idle')
      }
    }
  }, [text, state])

  return (
    <button
      type="button"
      onClick={() => void speak()}
      aria-label="Read question aloud"
      className={`rounded-full border border-border bg-background p-2 text-muted transition hover:text-foreground ${
        state === 'playing' ? 'animate-pulse-soft text-confident' : ''
      }`}
    >
      {state === 'loading' ? (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M11 5 6 9H2v6h4l5 4z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  )
}
