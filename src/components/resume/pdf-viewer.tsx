"use client"
import { FileText, ExternalLink } from "lucide-react"

interface PdfViewerProps {
  fileUrl: string | null
  fileName: string
}

export function PdfViewer({ fileUrl, fileName }: PdfViewerProps) {
  if (!fileUrl) {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="font-medium">{fileName}</p>
          <p className="text-sm text-muted-foreground">File stored. Preview not available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">{fileName}</span>
        </div>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
          Open <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {fileUrl.endsWith(".pdf") ? (
        <iframe src={fileUrl} className="w-full h-[500px]" title={fileName} />
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3" />
          <p>Preview not available for this file type</p>
        </div>
      )}
    </div>
  )
}
