"use client"

import { Loader2, Mic, MicOff, Square, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceControlsProps {
  isSpeaking: boolean
  isListening: boolean
  ttsSupported: boolean
  sttSupported: boolean
  interimTranscript: string
  error: string | null
  disabled?: boolean
  onSpeakQuestion: () => void
  onStopSpeaking: () => void
  onStartListening: () => void
  onStopListening: () => void
}

export function VoiceControls({
  isSpeaking,
  isListening,
  ttsSupported,
  sttSupported,
  interimTranscript,
  error,
  disabled = false,
  onSpeakQuestion,
  onStopSpeaking,
  onStartListening,
  onStopListening,
}: VoiceControlsProps) {
  const listeningDisabled = disabled || !sttSupported

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={isSpeaking ? onStopSpeaking : onSpeakQuestion}
          disabled={disabled || !ttsSupported}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
            isSpeaking
              ? "border-primary bg-primary/10 text-primary"
              : "bg-card hover:bg-accent",
            (disabled || !ttsSupported) && "cursor-not-allowed opacity-50"
          )}
        >
          {isSpeaking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Playing...
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              Play Question
            </>
          )}
        </button>

        <button
          type="button"
          onClick={isListening ? onStopListening : onStartListening}
          disabled={listeningDisabled}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all shadow-lg",
            isListening
              ? "bg-red-500 shadow-red-500/30 hover:bg-red-600"
              : "bg-gradient-to-r from-primary to-indigo-600 shadow-primary/30 hover:shadow-xl hover:shadow-primary/40",
            listeningDisabled && "cursor-not-allowed opacity-50"
          )}
        >
          {isListening ? (
            <>
              <Square className="h-4 w-4 fill-current" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Record Answer
            </>
          )}
        </button>

        {isListening && (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-red-500">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            Listening... speak your answer
          </span>
        )}

        {!sttSupported && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MicOff className="h-3.5 w-3.5" />
            Speech recognition not supported here. You can type your answer instead.
          </span>
        )}
      </div>

      {interimTranscript && (
        <p className="mt-3 rounded-md bg-background/70 px-3 py-2 text-sm italic text-muted-foreground">
          <span className="font-medium not-italic text-foreground">You said:</span> {interimTranscript}
          <span className="ml-1 animate-pulse text-primary">▊</span>
        </p>
      )}

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  )
}
