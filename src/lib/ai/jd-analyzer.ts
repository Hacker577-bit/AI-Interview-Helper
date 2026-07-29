import { ParsedSkill } from "@/types"
import { chatCompletion, isAIEnabled } from "./client"
import { PROMPTS } from "./prompts"

export interface JDAnalysis {
  role: string
  requiredSkills: string[]
  preferredSkills: string[]
  experienceLevel: string
  keyResponsibilities: string[]
  matchingSkills: string[]
  missingSkills: string[]
  matchPercentage: number
}

const ROLE_PATTERNS: Record<string, { title: string; level: string }> = {
  "senior software engineer": { title: "Senior Software Engineer", level: "SENIOR" },
  "software engineer": { title: "Software Engineer", level: "MID" },
  "junior developer": { title: "Junior Developer", level: "ENTRY" },
  "staff engineer": { title: "Staff Engineer", level: "STAFF" },
  "tech lead": { title: "Tech Lead", level: "SENIOR" },
  "engineering manager": { title: "Engineering Manager", level: "STAFF" },
  "full stack": { title: "Full Stack Developer", level: "MID" },
  "frontend": { title: "Frontend Developer", level: "MID" },
  "backend": { title: "Backend Developer", level: "MID" },
  "devops": { title: "DevOps Engineer", level: "MID" },
  "data scientist": { title: "Data Scientist", level: "MID" },
  "product manager": { title: "Product Manager", level: "MID" },
}

const ALL_TECH_SKILLS = [
  "React", "TypeScript", "JavaScript", "Python", "Java", "Go", "Node.js",
  "PostgreSQL", "AWS", "Docker", "Kubernetes", "GraphQL", "REST", "Microservices",
  "System Design", "CI/CD", "Git", "Agile", "SQL", "MongoDB", "Redis",
  "Machine Learning", "TensorFlow", "Data Science", "Angular", "Vue.js",
]

function analyzeJDRuleBased(jdText: string, userSkills: ParsedSkill[]): JDAnalysis {
  const lowerJD = jdText.toLowerCase()

  let role = "Software Engineer"
  let experienceLevel = "MID"
  for (const [pattern, info] of Object.entries(ROLE_PATTERNS)) {
    if (lowerJD.includes(pattern)) {
      role = info.title
      experienceLevel = info.level
      break
    }
  }

  const requiredSkills: string[] = []
  for (const skill of ALL_TECH_SKILLS) {
    if (lowerJD.includes(skill.toLowerCase())) {
      requiredSkills.push(skill)
    }
  }

  const userSkillNames = userSkills.map(s => s.name)
  const matchingSkills = requiredSkills.filter(s => userSkillNames.includes(s))
  const missingSkills = requiredSkills.filter(s => !userSkillNames.includes(s))

  const matchPercentage = requiredSkills.length > 0
    ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
    : 50

  const responsibilities: string[] = []
  const lines = jdText.split("\n").filter(l => l.trim())
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed)) {
      responsibilities.push(trimmed.replace(/^[*-]\s*|^\d+\.\s*/, "").slice(0, 100))
    }
  }

  return {
    role,
    requiredSkills,
    preferredSkills: requiredSkills.slice(0, 3),
    experienceLevel,
    keyResponsibilities: responsibilities.slice(0, 5),
    matchingSkills,
    missingSkills,
    matchPercentage,
  }
}

export function analyzeJobDescription(jdText: string, userSkills: ParsedSkill[]): JDAnalysis {
  return analyzeJDRuleBased(jdText, userSkills)
}

export async function analyzeJobDescriptionWithAI(
  jdText: string,
  userSkills: ParsedSkill[]
): Promise<JDAnalysis> {
  if (!isAIEnabled()) {
    console.log("[jd-analyzer] AI disabled, falling back to rule-based analysis")
    return analyzeJDRuleBased(jdText, userSkills)
  }

  try {
    const skillsJson = userSkills.map(s => s.name)
    const userMessage = `Job description:\n${jdText}\n\nCandidate skills: ${JSON.stringify(skillsJson)}`

    const response = await chatCompletion(PROMPTS.analyzeJD, userMessage, {
      temperature: 0.4,
      maxTokens: 2000,
      responseFormat: "json_object",
    })

    if (!response) {
      console.log("[jd-analyzer] AI returned empty response, falling back to rule-based")
      return analyzeJDRuleBased(jdText, userSkills)
    }

    const parsed = JSON.parse(response)
    const userSkillNames = userSkills.map(s => s.name)
    const requiredSkills: string[] = Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills.map(String) : []
    const matchingSkills = requiredSkills.filter(s => userSkillNames.includes(s))
    const missingSkills = requiredSkills.filter(s => !userSkillNames.includes(s))

    const matchPercentage = requiredSkills.length > 0
      ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
      : 50

    return {
      role: typeof parsed.role === "string" ? parsed.role : "Software Engineer",
      requiredSkills,
      preferredSkills: Array.isArray(parsed.preferredSkills)
        ? parsed.preferredSkills.map(String)
        : requiredSkills.slice(0, 3),
      experienceLevel: typeof parsed.level === "string" ? parsed.level : "MID",
      keyResponsibilities: Array.isArray(parsed.responsibilities)
        ? parsed.responsibilities.map(String)
        : [],
      matchingSkills,
      missingSkills,
      matchPercentage,
    }
  } catch (error) {
    console.error("[jd-analyzer] AI analysis failed, falling back to rule-based:", error)
    return analyzeJDRuleBased(jdText, userSkills)
  }
}
