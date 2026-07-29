"use client"

import { useState, useRef, useCallback } from "react"
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Resume } from "@/types"

interface ResumeUploaderProps {
  onUploadComplete?: (resume: Resume) => void
}

export default function ResumeUploader({ onUploadComplete }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = useCallback((f: File): string | null => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    const allowedExtensions = [".pdf", ".docx", ".txt"]
    const extension = "." + f.name.split(".").pop()?.toLowerCase()

    if (!allowedTypes.includes(f.type) && !allowedExtensions.includes(extension)) {
      return "Invalid file type. Only PDF, DOCX, and TXT files are allowed"
    }
    if (f.size > 10 * 1024 * 1024) {
      return "File too large. Maximum size is 10MB"
    }
    return null
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile) return

    const validationError = validateFile(droppedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(droppedFile)
  }, [validateFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selectedFile)
  }, [validateFile])

  const handleUpload = useCallback(async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await res.json()
      setUploadedResume(data.resume)
      toast.success("Resume uploaded successfully")
      onUploadComplete?.(data.resume)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setError(message)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }, [file, onUploadComplete])

  const handleRemove = useCallback(() => {
    setFile(null)
    setError(null)
    setUploadedResume(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (uploadedResume) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Resume Uploaded
          </h3>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white p-4 dark:bg-background">
          <FileText className="h-8 w-8 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{uploadedResume.fileName}</p>
            <p className="text-sm text-muted-foreground">
              {uploadedResume.skills?.length || 0} skills detected
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="rounded-md p-1 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <p className="mt-3 text-sm text-green-700 dark:text-green-300">
          Resume uploaded successfully. You can now parse it to extract skills and experience.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          error && "border-destructive/50 bg-destructive/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <FileText className="h-12 w-12 text-primary" />
            <div className="text-center">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="mt-2 inline-flex items-center gap-1 rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
        ) : (
          <>
            <UploadCloud
              className={cn(
                "h-12 w-12 mb-4 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
            <p className="text-lg font-medium">
              Drag & drop your resume or click to browse
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports PDF, DOCX, and TXT files (max 10MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {file && !uploadedResume && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              Upload & Parse
            </>
          )}
        </button>
      )}
    </div>
  )
}
