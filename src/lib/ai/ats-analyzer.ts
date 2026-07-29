import { ATSAnalysis, ParsedSkill } from "@/types"
import { chatCompletion, isAIEnabled } from "./client"
import { PROMPTS } from "./prompts"

const KEYWORD_WEIGHTS: Record<string, number> = {
  leadership: 3, "team lead": 3, manager: 2, architect: 3,
  microservices: 2, cloud: 2, "machine learning": 3, AI: 3,
  agile: 1, scrum: 1, test: 1, CI: 1, CD: 1, deploy: 1,
  performance: 2, optimize: 2, scale: 2, security: 2,
  design: 1, develop: 1, implement: 1, maintain: 1,
}

function analyzeATSRuleBased(resumeText: string, skills: ParsedSkill[], _jobDescription?: string): ATSAnalysis {
  const lowerText = resumeText.toLowerCase()

  let keywordScore = 0
  let maxKeywordScore = 0
  const missingKeywords: string[] = []

  for (const [keyword, weight] of Object.entries(KEYWORD_WEIGHTS)) {
    maxKeywordScore += weight
    if (lowerText.includes(keyword)) {
      keywordScore += weight
    } else {
      missingKeywords.push(keyword)
    }
  }

  const keywordMatch = Math.round((keywordScore / maxKeywordScore) * 100)

  let formatScore = 70
  if (lowerText.includes("experience")) formatScore += 10
  if (lowerText.includes("education")) formatScore += 10
  if (lowerText.includes("skills")) formatScore += 10
  if (resumeText.length > 500) formatScore += 5
  if (resumeText.length > 1000) formatScore += 5
  formatScore = Math.min(formatScore, 100)

  const contentScore = Math.min(Math.round((skills.length / 15) * 100), 100)

  const overallScore = Math.round((keywordMatch * 0.4 + formatScore * 0.3 + contentScore * 0.3))

  const suggestions: string[] = []
  if (missingKeywords.length > 5) {
    suggestions.push("Add more industry-specific keywords to improve ATS matching")
  }
  if (skills.length < 8) {
    suggestions.push("List more technical skills - aim for at least 10-15 relevant skills")
  }
  if (resumeText.length < 800) {
    suggestions.push("Your resume seems brief. Add more detail to your experience descriptions")
  }
  if (formatScore < 80) {
    suggestions.push("Improve resume structure with clear sections for Experience, Education, and Skills")
  }
  suggestions.push("Quantify achievements with specific metrics (e.g., 'increased performance by 30%')")
  suggestions.push("Use action verbs to start each bullet point (Led, Built, Designed, Implemented)")

  return {
    overallScore,
    keywordMatch,
    formatScore,
    contentScore,
    missingKeywords: missingKeywords.slice(0, 8),
    suggestions,
  }
}

export function analyzeATS(resumeText: string, skills: ParsedSkill[], _jobDescription?: string): ATSAnalysis {
  return analyzeATSRuleBased(resumeText, skills, _jobDescription)
}

export async function analyzeATSWithAI(
  resumeText: string,
  skills: ParsedSkill[],
  jobDescription?: string
): Promise<ATSAnalysis> {
  if (!isAIEnabled()) {
    console.log("[ats-analyzer] AI disabled, falling back to rule-based analysis")
    return analyzeATSRuleBased(resumeText, skills, jobDescription)
  }

  try {
    const skillsJson = skills.map(s => s.name)
    let userMessage = `Resume text:\n${resumeText}\n\nSkills identified: ${JSON.stringify(skillsJson)}`

    if (jobDescription) {
      userMessage += `\n\nJob description:\n${jobDescription}`
    }

    const response = await chatCompletion(PROMPTS.analyzeATS, userMessage, {
      temperature: 0.4,
      maxTokens: 2000,
      responseFormat: "json_object",
    })

    if (!response) {
      console.log("[ats-analyzer] AI returned empty response, falling back to rule-based")
      return analyzeATSRuleBased(resumeText, skills, jobDescription)
    }

    const parsed = JSON.parse(response)

    return {
      overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : null,
      keywordMatch: typeof parsed.keywordMatch === "number" ? parsed.keywordMatch : null,
      formatScore: typeof parsed.formatScore === "number" ? parsed.formatScore : null,
      contentScore: typeof parsed.contentScore === "number" ? parsed.contentScore : null,
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.map(String) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
    }
  } catch (error) {
    console.error("[ats-analyzer] AI analysis failed, falling back to rule-based:", error)
    return analyzeATSRuleBased(resumeText, skills, jobDescription)
  }
}
