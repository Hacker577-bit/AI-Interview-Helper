"use client"

// Minimal typings for the Web Speech API. SpeechRecognition is not part of
// lib.dom, so we declare the surface we use here.

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

export interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onstart: ((this: SpeechRecognitionLike, ev: Event) => void) | null
  onend: ((this: SpeechRecognitionLike, ev: Event) => void) | null
  onerror: ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEvent) => void) | null
  start(): void
  stop(): void
  abort(): void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null
  const w = window as WindowWithSpeechRecognition
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && getSpeechRecognitionConstructor() !== null
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices || voices.length === 0) return null

  const preferred = voices.find(
    (v) => /en[-_]US/i.test(v.lang) && /(natural|neural|online|premium|google us english)/i.test(v.name)
  )
  if (preferred) return preferred

  const enUS = voices.find((v) => /en[-_]US/i.test(v.lang))
  if (enUS) return enUS

  const en = voices.find((v) => /^en/i.test(v.lang))
  return en || voices[0]
}

export interface SpeakOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (message: string) => void
}

export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSynthesisSupported() || !text.trim()) return false

  const synth = window.speechSynthesis
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  const voice = pickVoice()
  if (voice) utterance.voice = voice
  utterance.rate = options.rate ?? 0.95
  utterance.pitch = options.pitch ?? 1
  utterance.volume = options.volume ?? 1
  if (options.lang) utterance.lang = options.lang
  utterance.onstart = () => options.onStart?.()
  utterance.onend = () => options.onEnd?.()
  utterance.onerror = (event) => {
    options.onError?.(event.error || "Speech synthesis failed")
  }

  synth.speak(utterance)
  return true
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
}

export function createSpeechRecognition(): SpeechRecognitionLike | null {
  const Ctor = getSpeechRecognitionConstructor()
  if (!Ctor) return null
  const recognition = new Ctor()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = "en-US"
  recognition.maxAlternatives = 1
  return recognition
}
