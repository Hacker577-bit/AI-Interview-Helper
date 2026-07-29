import { SkillGapAnalysis, SkillGap, ParsedSkill } from "@/types"
import { chatCompletion, isAIEnabled } from "./client"
import { PROMPTS } from "./prompts"

const ROLE_SKILL_REQUIREMENTS: Record<string, { skill: string; proficiency: number; demand: "HIGH" | "MEDIUM" | "LOW" }[]> = {
  "Frontend Developer": [
    { skill: "React", proficiency: 8, demand: "HIGH" },
    { skill: "TypeScript", proficiency: 7, demand: "HIGH" },
    { skill: "JavaScript", proficiency: 8, demand: "HIGH" },
    { skill: "CSS", proficiency: 7, demand: "MEDIUM" },
    { skill: "Next.js", proficiency: 6, demand: "MEDIUM" },
    { skill: "Testing", proficiency: 6, demand: "MEDIUM" },
    { skill: "GraphQL", proficiency: 5, demand: "LOW" },
    { skill: "Webpack", proficiency: 5, demand: "LOW" },
  ],
  "Backend Developer": [
    { skill: "Node.js", proficiency: 8, demand: "HIGH" },
    { skill: "Python", proficiency: 7, demand: "HIGH" },
    { skill: "PostgreSQL", proficiency: 7, demand: "HIGH" },
    { skill: "System Design", proficiency: 7, demand: "HIGH" },
    { skill: "AWS", proficiency: 6, demand: "MEDIUM" },
    { skill: "Docker", proficiency: 7, demand: "MEDIUM" },
    { skill: "Microservices", proficiency: 7, demand: "MEDIUM" },
    { skill: "Kubernetes", proficiency: 5, demand: "MEDIUM" },
  ],
  "Full Stack Developer": [
    { skill: "React", proficiency: 7, demand: "HIGH" },
    { skill: "Node.js", proficiency: 7, demand: "HIGH" },
    { skill: "TypeScript", proficiency: 7, demand: "HIGH" },
    { skill: "PostgreSQL", proficiency: 6, demand: "MEDIUM" },
    { skill: "AWS", proficiency: 5, demand: "MEDIUM" },
    { skill: "Docker", proficiency: 5, demand: "MEDIUM" },
    { skill: "GraphQL", proficiency: 5, demand: "LOW" },
    { skill: "CI/CD", proficiency: 5, demand: "MEDIUM" },
  ],
  "Data Scientist": [
    { skill: "Python", proficiency: 8, demand: "HIGH" },
    { skill: "SQL", proficiency: 7, demand: "HIGH" },
    { skill: "Machine Learning", proficiency: 7, demand: "HIGH" },
    { skill: "TensorFlow", proficiency: 6, demand: "MEDIUM" },
    { skill: "Statistics", proficiency: 7, demand: "MEDIUM" },
    { skill: "Data Visualization", proficiency: 6, demand: "MEDIUM" },
    { skill: "Spark", proficiency: 5, demand: "LOW" },
  ],
  "Senior Software Engineer": [
    { skill: "System Design", proficiency: 8, demand: "HIGH" },
    { skill: "Architecture", proficiency: 8, demand: "HIGH" },
    { skill: "Leadership", proficiency: 7, demand: "HIGH" },
    { skill: "Mentoring", proficiency: 6, demand: "MEDIUM" },
    { skill: "AWS", proficiency: 6, demand: "MEDIUM" },
    { skill: "Microservices", proficiency: 7, demand: "HIGH" },
    { skill: "Kubernetes", proficiency: 6, demand: "MEDIUM" },
    { skill: "Performance Optimization", proficiency: 6, demand: "MEDIUM" },
  ],
}

function analyzeSkillGapRuleBased(
  userSkills: ParsedSkill[],
  targetRole: string
): SkillGapAnalysis {
  const requirements = ROLE_SKILL_REQUIREMENTS[targetRole] || ROLE_SKILL_REQUIREMENTS["Full Stack Developer"]

  const userSkillMap = new Map<string, number>()
  for (const skill of userSkills) {
    const levelMap: Record<string, number> = { Beginner: 2, Intermediate: 5, Advanced: 8, Expert: 10 }
    userSkillMap.set(skill.name, levelMap[skill.level || "Beginner"] || 2)
  }

  const gaps: SkillGap[] = []
  for (const req of requirements) {
    const currentProficiency = userSkillMap.get(req.skill) || 0
    if (currentProficiency < req.proficiency) {
      const gap = req.proficiency - currentProficiency
      gaps.push({
        skill: req.skill,
        demandLevel: req.demand,
        currentProficiency,
        targetProficiency: req.proficiency,
        learningHours: gap * 10,
      })
    }
  }

  const totalLearningHours = gaps.reduce((sum, g) => sum + g.learningHours, 0)

  const recommendations = [
    `Focus on ${gaps[0]?.skill || "core skills"} first - highest demand, biggest gap`,
    `Allocate approximately ${totalLearningHours} hours for complete skill development`,
    "Practice with mock interviews targeting these specific skill areas",
    "Build portfolio projects demonstrating proficiency in missing skills",
  ]

  return {
    currentSkills: userSkills.map(s => s.name),
    targetSkills: requirements.map(r => r.skill),
    gaps: gaps.sort((a, b) => {
      const demandOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return demandOrder[b.demandLevel] - demandOrder[a.demandLevel]
    }),
    recommendations,
  }
}

export function analyzeSkillGap(
  userSkills: ParsedSkill[],
  targetRole: string
): SkillGapAnalysis {
  return analyzeSkillGapRuleBased(userSkills, targetRole)
}

export async function analyzeSkillGapWithAI(
  userSkills: ParsedSkill[],
  targetRole: string
): Promise<SkillGapAnalysis> {
  if (!isAIEnabled()) {
    console.log("[skill-gap] AI disabled, falling back to rule-based analysis")
    return analyzeSkillGapRuleBased(userSkills, targetRole)
  }

  try {
    const skillsJson = userSkills.map(s => ({
      name: s.name,
      level: s.level,
      yearsExp: s.yearsExp,
      category: s.category,
    }))

    const userMessage = `Target Role: ${targetRole}\n\nCandidate Skills: ${JSON.stringify(skillsJson)}`

    const response = await chatCompletion(PROMPTS.analyzeSkillGap, userMessage, {
      temperature: 0.5,
      maxTokens: 3000,
      responseFormat: "json_object",
    })

    if (!response) {
      console.log("[skill-gap] AI returned empty response, falling back to rule-based")
      return analyzeSkillGapRuleBased(userSkills, targetRole)
    }

    const parsed = JSON.parse(response)

    const gaps: SkillGap[] = (parsed.gaps || []).map((g: Record<string, unknown>) => ({
      skill: String(g.skill || ""),
      demandLevel: (g.demandLevel === "HIGH" || g.demandLevel === "MEDIUM" || g.demandLevel === "LOW")
        ? g.demandLevel as "HIGH" | "MEDIUM" | "LOW"
        : "MEDIUM",
      currentProficiency: typeof g.currentProficiency === "number" ? g.currentProficiency : 0,
      targetProficiency: typeof g.targetProficiency === "number" ? g.targetProficiency : 7,
      learningHours: typeof g.learningHours === "number" ? g.learningHours : 50,
    }))

    return {
      currentSkills: userSkills.map(s => s.name),
      targetSkills: (parsed.requiredSkills || parsed.targetSkills || []).map(String),
      gaps: gaps.sort((a, b) => {
        const demandOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        return demandOrder[b.demandLevel] - demandOrder[a.demandLevel]
      }),
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.map(String)
        : ["Focus on core skill gaps", "Allocate regular practice time"],
    }
  } catch (error) {
    console.error("[skill-gap] AI analysis failed, falling back to rule-based:", error)
    return analyzeSkillGapRuleBased(userSkills, targetRole)
  }
}
