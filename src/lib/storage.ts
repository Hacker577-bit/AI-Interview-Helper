/**
 * Local file storage service.
 * NOTE: For Vercel/serverless deployment, replace with Supabase Storage or S3.
 * Vercel's filesystem is ephemeral and read-only in production.
 */

import { writeFile, readFile, mkdir, unlink } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

async function ensureUploadDir() {
  try { await mkdir(UPLOAD_DIR, { recursive: true }) } catch {}
}

export async function saveFile(file: File, prefix: string): Promise<{ url: string; filepath: string }> {
  await ensureUploadDir()
  const ext = file.name.split(".").pop() || "bin"
  const filename = `${prefix}-${uuidv4()}.${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)
  return {
    url: `/api/files/${filename}`,
    filepath,
  }
}

export async function getFile(filename: string): Promise<Buffer | null> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename)
    if (!filepath.startsWith(UPLOAD_DIR)) return null
    return await readFile(filepath)
  } catch {
    return null
  }
}

export async function deleteFile(filename: string): Promise<boolean> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename)
    if (!filepath.startsWith(UPLOAD_DIR)) return false
    await unlink(filepath)
    return true
  } catch {
    return false
  }
}

// Supabase storage adapter for production
export async function saveFileToSupabase(file: File, prefix: string): Promise<{ url: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Fall back to local storage
    return saveFile(file, prefix)
  }

  // For now, just use local storage with a note
  console.log("Supabase storage integration pending - using local storage")
  return saveFile(file, prefix)
}
