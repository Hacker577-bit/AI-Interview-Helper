import OpenAI from "openai"

let openaiClient: OpenAI | null = null

export function getAIClient(): OpenAI | null {
  if (openaiClient) return openaiClient
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === "") return null
  openaiClient = new OpenAI({ apiKey })
  return openaiClient
}

export function isAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== ""
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
  const client = getAIClient()
  if (!client) return null

  try {
    const response = await client.chat.completions.create({
      model: options?.model || "gpt-4o-mini",
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
