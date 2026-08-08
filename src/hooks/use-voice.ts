"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speak as speakText,
  stopSpeaking as cancelSpeech,
  type SpeechRecognitionLike,
} from "@/lib/speech"

interface UseVoiceOptions {
  lang?: string
  onTranscriptChange?: (text: string) => void
}

export function useVoice({ lang = "en-US", onTranscriptChange }: UseVoiceOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef("")
  const interimRef = useRef("")
  const listeningRef = useRef(false)
  const onTranscriptChangeRef = useRef(onTranscriptChange)
  onTranscriptChangeRef.current = onTranscriptChange

  const ttsSupported = isSpeechSynthesisSupported()
  const sttSupported = isSpeechRecognitionSupported()

  const pushTranscript = useCallback(() => {
    const merged = `${finalRef.current}${interimRef.current ? ` ${interimRef.current}` : ""}`.trim()
    setTranscript(merged)
    onTranscriptChangeRef.current?.(merged)
  }, [])

  const speak = useCallback((text: string) => {
    if (!text.trim()) return
    setIsSpeaking(true)
    speakText(text, {
      onEnd: () => setIsSpeaking(false),
      onError: (message) => {
        setIsSpeaking(false)
        setError(message || "Speech playback failed")
      },
    })
  }, [])

  const stopSpeaking = useCallback(() => {
    cancelSpeech()
    setIsSpeaking(false)
  }, [])

  const startListening = useCallback(() => {
    if (listeningRef.current) return

    const recognition = createSpeechRecognition()
    if (!recognition) {
      setError("Speech recognition is not supported in this browser.")
      return
    }
    recognition.lang = lang

    recognition.onstart = () => {
      listeningRef.current = true
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalRef.current += `${result[0].transcript} `
        } else {
          interim += result[0].transcript
        }
      }
      interimRef.current = interim
      setInterimTranscript(interim.trim())
      pushTranscript()
    }

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return
      setError(`Speech recognition error: ${event.error}`)
    }

    recognition.onend = () => {
      listeningRef.current = false
      setIsListening(false)
      interimRef.current = ""
      setInterimTranscript("")
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      // already started
    }
  }, [lang, pushTranscript])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && listeningRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // noop
      }
    }
    listeningRef.current = false
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    finalRef.current = ""
    interimRef.current = ""
    setTranscript("")
    setInterimTranscript("")
  }, [])

  const stopAll = useCallback(() => {
    cancelListening()
    cancelSpeech()
    setIsSpeaking(false)
  }, [cancelListening])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // noop
        }
      }
      cancelSpeech()
    }
  }, [])

  return {
    ttsSupported,
    sttSupported,
    isSpeaking,
    isListening,
    transcript,
    interimTranscript,
    error,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript,
    stopAll,
  }
}
