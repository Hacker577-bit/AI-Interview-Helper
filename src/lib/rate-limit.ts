interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

setInterval(() => {
  const now = Date.now()
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (entry.resetAt < now) store.delete(key)
  })
}, 10 * 60 * 1000)

export function rateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number }
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return { success: true, remaining: options.maxRequests - 1, resetAt: now + options.windowMs }
  }

  if (entry.count >= options.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt }
}

export const rateLimiters = {
  auth: (identifier: string) => rateLimit(`auth:${identifier}`, { maxRequests: 10, windowMs: 60 * 1000 }),
  api: (identifier: string) => rateLimit(`api:${identifier}`, { maxRequests: 100, windowMs: 60 * 1000 }),
  ai: (identifier: string) => rateLimit(`ai:${identifier}`, { maxRequests: 20, windowMs: 60 * 1000 }),
  upload: (identifier: string) => rateLimit(`upload:${identifier}`, { maxRequests: 5, windowMs: 60 * 60 * 1000 }),
}

export function getRateLimitHeaders(result: ReturnType<typeof rateLimit>) {
  return {
    "X-RateLimit-Limit": String(result.remaining + (result.success ? 1 : 0)),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  }
}
