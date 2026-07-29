export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const type = file.type
  const name = file.name.toLowerCase()

  if (type === "text/plain" || name.endsWith(".txt")) {
    return buffer.toString("utf-8")
  }

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return extractPdfText(buffer)
  }

  if (type.includes("wordprocessingml") || name.endsWith(".docx")) {
    return extractDocxText(buffer)
  }

  return buffer.toString("utf-8")
}

function extractPdfText(buffer: Buffer): string {
  const content = buffer.toString("latin1")
  const textParts: string[] = []

  const btRegex = /BT\s*([\s\S]*?)\s*ET/g
  let match
  while ((match = btRegex.exec(content)) !== null) {
    const block = match[1]
    const tjRegex = /\(([^)]*)\)\s*Tj/g
    let tjMatch
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(tjMatch[1])
    }
  }

  if (textParts.length === 0) {
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g
    while ((match = streamRegex.exec(content)) !== null) {
      const streamContent = match[1]
      const readable = streamContent.replace(/[^\x20-\x7E\x0A\x0D]/g, " ").replace(/\s+/g, " ").trim()
      if (readable.length > 50) textParts.push(readable)
    }
  }

  return textParts.join("\n") || "[PDF content could not be extracted - please upload as text]"
}

function extractDocxText(buffer: Buffer): string {
  try {
    const content = buffer.toString("utf-8")
    const tagRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g
    const textParts: string[] = []
    let match
    while ((match = tagRegex.exec(content)) !== null) {
      textParts.push(match[1])
    }
    return textParts.join(" ") || "[DOCX content could not be extracted - please upload as text]"
  } catch {
    return "[DOCX parsing failed - please upload as text]"
  }
}
