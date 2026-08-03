import { InterviewQuestion, FeedbackReport, DimensionScores } from "@/types"
import { chatCompletion, isAIEnabled } from "./client"
import { PROMPTS } from "./prompts"

const BEHAVIORAL_QUESTIONS = {
  ENTRY: [
    "Tell me about yourself and your background.",
    "Why are you interested in this role?",
    "Describe a time you worked on a team project.",
    "What are your greatest strengths?",
    "How do you handle feedback from supervisors?",
    "Tell me about a challenge you overcame in school or work.",
    "Where do you see yourself in 3 years?",
    "Why should we hire you for this position?",
  ],
  MID: [
    "Tell me about a time you had to deal with a difficult stakeholder or colleague.",
    "Describe a project where you had to learn a new technology or skill quickly.",
    "How do you handle conflicting priorities when everything seems urgent?",
    "Tell me about a time you made a mistake at work and how you handled it.",
    "Describe a situation where you had to influence a team decision.",
    "How do you stay updated with industry trends and new technologies?",
    "Tell me about a time you went above and beyond what was expected.",
    "Describe your approach to mentoring junior team members.",
  ],
  SENIOR: [
    "Describe a time you led a significant technical or organizational change.",
    "How do you balance technical debt against shipping new features?",
    "Tell me about a time you had to make a difficult decision with incomplete information.",
    "How do you build and maintain high-performing engineering teams?",
    "Describe a time you identified and resolved a systemic issue in your organization.",
    "How do you approach setting technical strategy for a team or organization?",
    "Tell me about a project that failed and what you learned from it.",
    "How do you handle disagreements with senior leadership about technical direction?",
  ],
  STAFF: [
    "How do you drive technical vision across multiple teams or an entire organization?",
    "Describe how you've influenced company-wide engineering culture.",
    "Tell me about a time you made a decision that was unpopular but correct.",
    "How do you approach make-vs-buy decisions for critical infrastructure?",
    "Describe your framework for evaluating technical investments and ROI.",
  ],
}

const TECHNICAL_QUESTIONS = {
  ENTRY: [
    "Explain the difference between a stack and a queue.",
    "What is the difference between HTTP GET and POST methods?",
    "Explain the concept of object-oriented programming.",
    "What is a database index and why is it important?",
    "Explain the difference between var, let, and const in JavaScript.",
    "What is version control and why do we use it?",
    "Explain the concept of RESTful APIs.",
    "What is the DOM and how does it relate to web development?",
  ],
  MID: [
    "Explain the difference between SQL and NoSQL databases. When would you choose each?",
    "How would you design a URL shortener service?",
    "Explain the React component lifecycle and how hooks changed the paradigm.",
    "What is the CAP theorem and how does it apply to distributed systems?",
    "How would you optimize a slow database query?",
    "Explain microservices architecture and its trade-offs.",
    "How would you implement authentication and authorization in a web application?",
    "Explain the concept of CORS and how to handle it.",
  ],
  SENIOR: [
    "Design a distributed message queue system from scratch.",
    "How would you architect a real-time collaborative editing system?",
    "Explain eventual consistency and how to handle it in distributed systems.",
    "Design a rate limiter for an API handling millions of requests per day.",
    "How would you approach migrating a monolith to microservices?",
    "Explain different caching strategies and their trade-offs in web applications.",
    "How would you design a system to detect and prevent fraud in real-time?",
    "Describe how you would implement horizontal scaling for a stateful application.",
  ],
  STAFF: [
    "Design a global CDN with real-time cache invalidation.",
    "How would you architect a system that guarantees exactly-once message delivery at scale?",
    "Design a fault-tolerant distributed database from first principles.",
    "How would you build a platform that serves both B2B and B2C with shared infrastructure?",
  ],
}

const CASE_STUDY_QUESTIONS = {
  ENTRY: [
    "How would you estimate the number of gas stations in New York City?",
    "A product's user engagement dropped 20% this month. Walk me through your investigation.",
    "How would you design a parking lot management system?",
    "Our app's load time increased by 3 seconds. How do you debug this?",
  ],
  MID: [
    "Estimate the bandwidth requirements for a video streaming service with 1M daily users.",
    "Our e-commerce platform is losing customers at checkout. Diagnose the problem.",
    "Design a notification system that handles 10M messages per minute.",
    "How would you prioritize a backlog of 200 feature requests with limited resources?",
  ],
  SENIOR: [
    "Our SaaS product has 40% monthly churn. Develop a retention strategy.",
    "Design the data model for a multi-tenant SaaS platform serving 10K organizations.",
    "How would you migrate a billion-row database with zero downtime?",
    "Our API response time p99 is 5 seconds. Create an optimization plan.",
  ],
  STAFF: [
    "Design a system to handle 100M concurrent users with sub-100ms latency.",
    "How would you evaluate the technical feasibility and ROI of building vs buying a core platform component?",
  ],
}

function generateQuestionsRuleBased(
  interviewType: string,
  difficulty: string,
  count: number
): InterviewQuestion[] {
  const difficultyKey = difficulty as keyof typeof BEHAVIORAL_QUESTIONS
  let questionPool: string[] = []

  switch (interviewType) {
    case "BEHAVIORAL":
      questionPool = BEHAVIORAL_QUESTIONS[difficultyKey] || BEHAVIORAL_QUESTIONS.MID
      break
    case "TECHNICAL":
      questionPool = TECHNICAL_QUESTIONS[difficultyKey] || TECHNICAL_QUESTIONS.MID
      break
    case "CASE_STUDY":
      questionPool = CASE_STUDY_QUESTIONS[difficultyKey as keyof typeof CASE_STUDY_QUESTIONS] || CASE_STUDY_QUESTIONS.MID
      break
    case "MIXED":
    default:
      const behavioral = BEHAVIORAL_QUESTIONS[difficultyKey] || BEHAVIORAL_QUESTIONS.MID
      const technical = TECHNICAL_QUESTIONS[difficultyKey] || TECHNICAL_QUESTIONS.MID
      questionPool = [...behavioral, ...technical]
      questionPool.sort(() => Math.random() - 0.5)
      break
  }

  const selected: string[] = []
  for (let i = 0; i < Math.min(count, questionPool.length * 2); i++) {
    selected.push(questionPool[i % questionPool.length])
  }

  return selected.map((text, i) => ({
    id: crypto.randomUUID(),
    sessionId: "",
    sequenceNumber: i + 1,
    questionText: text,
    questionType: interviewType === "MIXED" ? (i % 2 === 0 ? "BEHAVIORAL" : "TECHNICAL") : interviewType,
    category: interviewType,
    isAnswered: false,
    responses: [],
  }))
}

function generateFollowUpRuleBased(previousQuestion: string, userAnswer: string): string | null {
  const answerLength = userAnswer.split(" ").length

  if (answerLength < 20) {
    return "Could you provide a more specific example with concrete details?"
  }

  if (userAnswer.toLowerCase().includes("team") || userAnswer.toLowerCase().includes("we ")) {
    return "What was your specific role and contribution in that situation?"
  }

  if (userAnswer.toLowerCase().includes("improved") || userAnswer.toLowerCase().includes("increased") || userAnswer.toLowerCase().includes("reduced")) {
    return "Can you quantify those results with specific metrics or percentages?"
  }

  if (userAnswer.toLowerCase().includes("challenge") || userAnswer.toLowerCase().includes("difficult") || userAnswer.toLowerCase().includes("problem")) {
    return "What was the most difficult aspect and how did you overcome it?"
  }

  return null
}

function extractJsonObject(response: string): Record<string, unknown> | null {
  const trimmed = response.trim()
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed
  } catch {
    // fall through to fence stripping
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenceMatch ? fenceMatch[1] : trimmed

  const objStart = candidate.indexOf("{")
  const objEnd = candidate.lastIndexOf("}")
  if (objStart !== -1 && objEnd > objStart) {
    try {
      const parsed = JSON.parse(candidate.slice(objStart, objEnd + 1))
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed
    } catch {
      // fall through
    }
  }
  return null
}

function generateFeedbackRuleBased(
  questions: { question: string; answer: string }[],
  interviewType: string
): FeedbackReport {
  let totalScore = 0
  const dimensionTotals = { clarity: 0, relevance: 0, depth: 0, impact: 0, delivery: 0 }
  const allStrengths: string[] = []
  const allWeaknesses: string[] = []

  for (const qa of questions) {
    const answerLen = qa.answer.split(" ").length
    const hasSpecifics = /(\d+%|\$\d+|increased|decreased|improved|reduced|led|built|designed|implemented)/i.test(qa.answer)
    const hasStructure = /(first|second|third|finally|firstly|additionally|moreover|in conclusion)/i.test(qa.answer)
    const hasReflection = /(learned|realized|understood|changed|adapted|grew)/i.test(qa.answer)

    let clarity = 5, relevance = 5, depth = 5, impact = 5, delivery = 5

    if (answerLen > 30) { clarity += 1; depth += 1 }
    if (answerLen > 60) { clarity += 1; depth += 2; delivery += 1 }
    if (hasStructure) { clarity += 1; delivery += 1 }
    if (hasSpecifics) { impact += 2; relevance += 1 }
    if (hasReflection) { depth += 2 }
    if (answerLen > 100) { depth += 1 }

    clarity += Math.floor(Math.random() * 3) - 1
    relevance += Math.floor(Math.random() * 3) - 1
    depth += Math.floor(Math.random() * 2) - 1
    impact += Math.floor(Math.random() * 2) - 1
    delivery += Math.floor(Math.random() * 2)

    clarity = Math.max(1, Math.min(10, clarity))
    relevance = Math.max(1, Math.min(10, relevance))
    depth = Math.max(1, Math.min(10, depth))
    impact = Math.max(1, Math.min(10, impact))
    delivery = Math.max(1, Math.min(10, delivery))

    const questionScore = (clarity + relevance + depth + impact + delivery) / 5
    totalScore += questionScore

    dimensionTotals.clarity += clarity
    dimensionTotals.relevance += relevance
    dimensionTotals.depth += depth
    dimensionTotals.impact += impact
    dimensionTotals.delivery += delivery

    if (questionScore >= 7) {
      allStrengths.push(`Strong answer structure for "${qa.question.slice(0, 50)}..."`)
    }
    if (questionScore < 6) {
      allWeaknesses.push(`Could improve answer for "${qa.question.slice(0, 50)}..."`)
    }
  }

  const n = questions.length || 1
  const avgScore = totalScore / n
  const finalDimensions: DimensionScores = {
    clarity: Math.round(dimensionTotals.clarity / n),
    relevance: Math.round(dimensionTotals.relevance / n),
    depth: Math.round(dimensionTotals.depth / n),
    impact: Math.round(dimensionTotals.impact / n),
    delivery: Math.round(dimensionTotals.delivery / n),
  }

  const strengths = allStrengths.slice(0, 3)
  const weaknesses = allWeaknesses.slice(0, 3)

  let summary = ""
  if (avgScore >= 8) {
    summary = "Excellent performance! Your answers were well-structured, detailed, and demonstrated strong communication skills. You effectively used specific examples and quantified your achievements."
  } else if (avgScore >= 6.5) {
    summary = "Good performance. Your answers showed understanding but could benefit from more specific examples and measurable outcomes. Focus on structuring responses using the STAR method (Situation, Task, Action, Result)."
  } else if (avgScore >= 5) {
    summary = "Adequate performance. Work on providing more depth in your answers. Include specific examples, quantify results, and structure your responses more clearly. Practice the STAR method for behavioral questions."
  } else {
    summary = "There's room for improvement. Focus on preparation - research common interview questions, prepare specific examples from your experience, and practice structuring your answers clearly."
  }

  if (interviewType === "TECHNICAL" || interviewType === "MIXED") {
    summary += " For technical questions, ensure you explain your reasoning process step by step."
  }

  return {
    id: crypto.randomUUID(),
    sessionId: "",
    overallScore: Math.round(avgScore * 10) / 10,
    dimensionScores: finalDimensions,
    strengths,
    weaknesses,
    summary,
    generatedAt: new Date().toISOString(),
  }
}

export function generateQuestions(
  interviewType: string,
  difficulty: string,
  count: number,
  resumeSkills?: string[],
  jdText?: string
): InterviewQuestion[] {
  return generateQuestionsRuleBased(interviewType, difficulty, count)
}

function extractJsonArray(response: string): Record<string, unknown>[] {
  const trimmed = response.trim()
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions
  } catch {
    // fall through to fence stripping
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenceMatch ? fenceMatch[1] : trimmed

  const arrayStart = candidate.indexOf("[")
  const arrayEnd = candidate.lastIndexOf("]")
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    try {
      const parsed = JSON.parse(candidate.slice(arrayStart, arrayEnd + 1))
      if (Array.isArray(parsed)) return parsed
    } catch {
      // fall through
    }
  }
  return []
}

export async function generateQuestionsWithAI(
  interviewType: string,
  difficulty: string,
  count: number,
  resumeSkills?: string[],
  jdText?: string
): Promise<InterviewQuestion[]> {
  if (!isAIEnabled()) {
    console.log("[interview-engine] AI disabled, falling back to rule-based question generation")
    return generateQuestionsRuleBased(interviewType, difficulty, count)
  }

  try {
    if (!jdText || jdText.trim() === "") {
      console.warn("[interview-engine] No job description provided - AI will use candidate skills only")
    }

    const contextParts: string[] = [
      `Interview type: ${interviewType}`,
      `Difficulty: ${difficulty}`,
      `Number of questions to generate: ${count}`,
    ]

    if (resumeSkills && resumeSkills.length > 0) {
      contextParts.push(`Candidate skills: ${resumeSkills.join(", ")}`)
    }
    if (jdText) {
      contextParts.push(
        `JOB DESCRIPTION (this is the primary source for all questions - every question MUST map to a requirement below):\n${jdText.slice(0, 8000)}`
      )
    }

    const userMessage = contextParts.join("\n")

    const response = await chatCompletion(PROMPTS.generateQuestions, userMessage, {
      temperature: 0.8,
      maxTokens: 3000,
      responseFormat: "json_object",
    })

    if (!response) {
      console.log("[interview-engine] AI returned empty response, falling back to rule-based")
      return generateQuestionsRuleBased(interviewType, difficulty, count)
    }

    const parsed = extractJsonArray(response)
    const questions = parsed

    return questions.slice(0, count).map((q: Record<string, unknown>, i: number) => ({
      id: crypto.randomUUID(),
      sessionId: "",
      sequenceNumber: i + 1,
      questionText: String(q.question || ""),
      questionType: typeof q.type === "string" ? q.type : interviewType,
      category: typeof q.category === "string" ? q.category : interviewType,
      isAnswered: false,
      responses: [],
    }))
  } catch (error) {
    console.error("[interview-engine] AI question generation failed, falling back to rule-based:", error)
    return generateQuestionsRuleBased(interviewType, difficulty, count)
  }
}

export function generateFollowUp(previousQuestion: string, userAnswer: string): string | null {
  return generateFollowUpRuleBased(previousQuestion, userAnswer)
}

export async function generateFollowUpWithAI(
  previousQuestion: string,
  userAnswer: string
): Promise<string | null> {
  if (!isAIEnabled()) {
    console.log("[interview-engine] AI disabled, falling back to rule-based follow-up")
    return generateFollowUpRuleBased(previousQuestion, userAnswer)
  }

  try {
    const userMessage = `Previous question: "${previousQuestion}"\n\nCandidate answer: "${userAnswer}"`

    const response = await chatCompletion(PROMPTS.generateFollowUp, userMessage, {
      temperature: 0.7,
      maxTokens: 300,
    })

    if (!response) {
      console.log("[interview-engine] AI returned empty follow-up, falling back to rule-based")
      return generateFollowUpRuleBased(previousQuestion, userAnswer)
    }

    const trimmed = response.trim()
    if (trimmed === "NO_FOLLOW_UP" || trimmed === '"NO_FOLLOW_UP"') {
      return null
    }

    return trimmed.replace(/^["']|["']$/g, "")
  } catch (error) {
    console.error("[interview-engine] AI follow-up generation failed, falling back to rule-based:", error)
    return generateFollowUpRuleBased(previousQuestion, userAnswer)
  }
}

export function generateFeedback(
  questions: { question: string; answer: string }[],
  interviewType: string
): FeedbackReport {
  return generateFeedbackRuleBased(questions, interviewType)
}

export interface FeedbackContext {
  skills?: string[]
  jdText?: string
  difficulty?: string
}

export async function generateFeedbackWithAI(
  questions: { question: string; answer: string }[],
  interviewType: string,
  context?: FeedbackContext
): Promise<FeedbackReport> {
  if (!isAIEnabled()) {
    console.log("[interview-engine] AI disabled, falling back to rule-based feedback")
    return generateFeedbackRuleBased(questions, interviewType)
  }

  try {
    const qaText = questions
      .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
      .join("\n\n")

    const contextParts: string[] = [`Interview type: ${interviewType}`]
    if (context?.difficulty) contextParts.push(`Difficulty: ${context.difficulty}`)
    if (context?.skills && context.skills.length > 0) {
      contextParts.push(`Candidate skills: ${context.skills.join(", ")}`)
    }
    if (context?.jdText) {
      contextParts.push(`Target job description: ${context.jdText.slice(0, 3000)}`)
    }

    const userMessage = `${contextParts.join("\n")}\n\n${qaText}`

    const response = await chatCompletion(PROMPTS.generateFeedback, userMessage, {
      temperature: 0.5,
      maxTokens: 3000,
      responseFormat: "json_object",
    })

    if (!response) {
      console.log("[interview-engine] AI returned empty feedback, falling back to rule-based")
      return generateFeedbackRuleBased(questions, interviewType)
    }

    const parsed = extractJsonObject(response)
    if (!parsed) {
      console.log("[interview-engine] AI returned invalid feedback JSON, falling back to rule-based")
      return generateFeedbackRuleBased(questions, interviewType)
    }

    return {
      id: crypto.randomUUID(),
      sessionId: "",
      overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : null,
      dimensionScores:
        parsed.dimensionScores && typeof parsed.dimensionScores === "object"
          ? (parsed.dimensionScores as DimensionScores)
          : null,
      strengths: Array.isArray(parsed.strengths) ? (parsed.strengths as string[]) : null,
      weaknesses: Array.isArray(parsed.weaknesses) ? (parsed.weaknesses as string[]) : null,
      summary: typeof parsed.summary === "string" ? parsed.summary : null,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("[interview-engine] AI feedback generation failed, falling back to rule-based:", error)
    return generateFeedbackRuleBased(questions, interviewType)
  }
}
