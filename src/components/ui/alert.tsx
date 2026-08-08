"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react"
import { useState } from "react"

const variants = {
  info: { icon: Info, bg: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300" },
  success: { icon: CheckCircle, bg: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300" },
  warning: { icon: AlertTriangle, bg: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300" },
  error: { icon: XCircle, bg: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300" },
}

interface AlertProps {
  variant?: keyof typeof variants
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  className?: string
}

export function Alert({ variant = "info", title, children, dismissible, className }: AlertProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const { icon: Icon, bg } = variants[variant]
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-4", bg, className)}>
      <Icon className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="flex-1">
        {title && <h5 className="font-medium mb-1">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className="shrink-0 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
