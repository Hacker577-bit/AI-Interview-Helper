import OpenAI from "openai"

const GROQ_BASE_URL = "https://api.groq.com/openai/v1"
const GROK_BASE_URL = "https://api.x.ai/v1"
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"
const DEFAULT_GROK_MODEL = "grok-3-mini"
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini"

let openaiClient: OpenAI | null = null
let grokClient: OpenAI | null = null
let groqClient: OpenAI | null = null

function resolveEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]
    if (value && value !== "") return value
  }
  return undefined
}

function getGroqApiKey(): string | undefined {
  return resolveEnv("GROQ_API_KEY")
}

function getGrokApiKey(): string | undefined {
  return resolveEnv("GROK_API_KEY", "XAI_API_KEY")
}

function getOpenAIKey(): string | undefined {
  return resolveEnv("OPENAI_API_KEY")
}

export type AIProvider = "groq" | "grok" | "openai" | null

export function getAIProvider(): AIProvider {
  if (getGroqApiKey()) return "groq"
  if (getGrokApiKey()) return "grok"
  if (getOpenAIKey()) return "openai"
  return null
}

export function isAIEnabled(): boolean {
  return getAIProvider() !== null
}

function getGroqClient(): OpenAI | null {
  const apiKey = getGroqApiKey()
  if (!apiKey) return null
  if (groqClient) return groqClient
  groqClient = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL })
  return groqClient
}

function getGrokClient(): OpenAI | null {
  const apiKey = getGrokApiKey()
  if (!apiKey) return null
  if (grokClient) return grokClient
  grokClient = new OpenAI({ apiKey, baseURL: GROK_BASE_URL })
  return grokClient
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = getOpenAIKey()
  if (!apiKey) return null
  if (openaiClient) return openaiClient
  openaiClient = new OpenAI({ apiKey })
  return openaiClient
}

export function getAIClient(): OpenAI | null {
  return getGroqClient() || getGrokClient() || getOpenAIClient()
}

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
    responseFormat?: "text" | "json_object"
  }
): Promise<string | null> {
  const provider = getAIProvider()
  const client = getAIClient()
  if (!provider || !client) return null

  try {
    const model =
      options?.model ||
      (provider === "groq"
        ? DEFAULT_GROQ_MODEL
        : provider === "grok"
          ? DEFAULT_GROK_MODEL
          : DEFAULT_OPENAI_MODEL)

    const response = await client.chat.completions.create({
      model,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      response_format: options?.responseFormat
        ? { type: options.responseFormat }
        : undefined,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    })
    return response.choices[0]?.message?.content || null
  } catch (error) {
    console.error("AI chat completion error:", error)
    return null
  }
}
