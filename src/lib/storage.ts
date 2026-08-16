/**
 * Local file storage service.
 * NOTE: For Vercel/serverless deployment, replace with Supabase Storage or S3.
 * Vercel's filesystem is ephemeral and read-only in production.
 */

import { writeFile, readFile, mkdir, unlink } from "fs/promises"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

async function ensureUploadDir() {
  try { await mkdir(UPLOAD_DIR, { recursive: true }) } catch {}
}

export async function saveFile(file: File, prefix: string): Promise<{ url: string; filepath: string }> {
  await ensureUploadDir()
  const ext = file.name.split(".").pop() || "bin"
  const filename = `${prefix}-${crypto.randomUUID()}.${ext}`
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

// ponytail: local filesystem is ephemeral on Vercel. Upgrade path: replace saveFile calls
// with a @supabase/storage-js upload when NEXT_PUBLIC_SUPABASE_URL is set.
