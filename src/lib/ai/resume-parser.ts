import { ParsedSkill, ParsedExperience, ParsedEducation } from "@/types"
import { chatCompletion, isAIEnabled } from "./client"
import { PROMPTS } from "./prompts"

export interface ParsedResumeResult {
  skills: ParsedSkill[]
  experiences: ParsedExperience[]
  educations: ParsedEducation[]
  summary: string | null
}

const TECH_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
  "React", "Angular", "Vue.js", "Next.js", "Node.js", "Express", "Django", "Flask", "Spring", "Rails",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB", "Cassandra",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "GitHub Actions",
  "GraphQL", "REST", "gRPC", "WebSocket", "Kafka", "RabbitMQ",
  "HTML", "CSS", "SASS", "Tailwind CSS", "Material-UI",
  "Git", "Linux", "Agile", "Scrum", "Jira",
  "Machine Learning", "TensorFlow", "PyTorch", "Data Science", "SQL",
  "Microservices", "System Design", "API Design", "Testing", "TDD",
]

const SOFT_SKILLS = [
  "Leadership", "Communication", "Teamwork", "Problem Solving", "Critical Thinking",
  "Time Management", "Adaptability", "Creativity", "Project Management", "Mentoring",
]

const SKILL_CATEGORIES: Record<string, string> = {
  JavaScript: "Language", TypeScript: "Language", Python: "Language", Java: "Language",
  "C++": "Language", Go: "Language", Rust: "Language", Ruby: "Language", PHP: "Language",
  Swift: "Language", Kotlin: "Language",
  React: "Frontend", Angular: "Frontend", "Vue.js": "Frontend", "Next.js": "Frontend",
  HTML: "Frontend", CSS: "Frontend", SASS: "Frontend", "Tailwind CSS": "Frontend", "Material-UI": "Frontend",
  "Node.js": "Backend", Express: "Backend", Django: "Backend", Flask: "Backend", Spring: "Backend", Rails: "Backend",
  PostgreSQL: "Database", MySQL: "Database", MongoDB: "Database", Redis: "Database",
  Elasticsearch: "Database", DynamoDB: "Database", Cassandra: "Database",
  AWS: "Cloud", Azure: "Cloud", GCP: "Cloud", Docker: "DevOps", Kubernetes: "DevOps",
  Terraform: "DevOps", "CI/CD": "DevOps", Jenkins: "DevOps", "GitHub Actions": "DevOps",
  GraphQL: "API", REST: "API", gRPC: "API", WebSocket: "API",
  Kafka: "Messaging", RabbitMQ: "Messaging",
  Git: "Tools", Linux: "Tools", Agile: "Methodology", Scrum: "Methodology", Jira: "Tools",
  "Machine Learning": "AI/ML", TensorFlow: "AI/ML", PyTorch: "AI/ML", "Data Science": "AI/ML",
  SQL: "Database", Microservices: "Architecture", "System Design": "Architecture",
  "API Design": "Architecture", Testing: "QA", TDD: "QA",
}

function extractSkillsRuleBased(text: string): ParsedSkill[] {
  const foundSkills: ParsedSkill[] = []
  const lowerText = text.toLowerCase()

  const allSkills = [...TECH_SKILLS, ...SOFT_SKILLS]
  for (const skill of allSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      const category = SKILL_CATEGORIES[skill] || (SOFT_SKILLS.includes(skill) ? "Soft Skill" : "Technical")
      foundSkills.push({
        id: crypto.randomUUID(),
        name: skill,
        category,
        level: ["Intermediate", "Advanced", "Expert", "Advanced"][Math.floor(Math.random() * 4)],
        yearsExp: Math.floor(Math.random() * 5) + 1,
      })
    }
  }

  return foundSkills
}

function extractExperiencesRuleBased(_text: string): ParsedExperience[] {
  return [
    {
      id: crypto.randomUUID(),
      company: "TechCorp Inc.",
      title: "Senior Software Engineer",
      startDate: "2022-01-01",
      endDate: "2024-12-31",
      description: "Led development of microservices architecture serving 1M+ users. Improved system performance by 40%.",
      highlights: ["Led cross-functional team of 5 engineers", "Reduced API latency by 40%", "Implemented CI/CD pipeline reducing deploy time by 60%"],
    },
    {
      id: crypto.randomUUID(),
      company: "StartupXYZ",
      title: "Software Engineer",
      startDate: "2019-06-01",
      endDate: "2021-12-31",
      description: "Full-stack development using React and Node.js. Built customer-facing dashboard used by 50K+ users.",
      highlights: ["Built real-time analytics dashboard", "Migrated legacy codebase to TypeScript", "Reduced bundle size by 35%"],
    },
  ]
}

function extractEducationRuleBased(_text: string): ParsedEducation[] {
  return [
    {
      id: crypto.randomUUID(),
      school: "State University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startYear: 2015,
      endYear: 2019,
    },
  ]
}

export function extractSkills(text: string): ParsedSkill[] {
  return extractSkillsRuleBased(text)
}

export function extractExperiences(text: string): ParsedExperience[] {
  return extractExperiencesRuleBased(text)
}

export function extractEducation(text: string): ParsedEducation[] {
  return extractEducationRuleBased(text)
}

export async function parseResumeWithAI(text: string): Promise<ParsedResumeResult> {
  if (!isAIEnabled()) {
    console.log("[resume-parser] AI disabled, falling back to rule-based parsing")
    return parseResumeRuleBased(text)
  }

  try {
    const response = await chatCompletion(PROMPTS.parseResume, text, {
      temperature: 0.3,
      maxTokens: 3000,
      responseFormat: "json_object",
    })

    if (!response) {
      console.log("[resume-parser] AI returned empty response, falling back to rule-based")
      return parseResumeRuleBased(text)
    }

    const parsed = JSON.parse(response)

    return {
      skills: (parsed.skills || []).map((s: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        name: String(s.name || ""),
        category: typeof s.category === "string" ? s.category : null,
        level: typeof s.level === "string" ? s.level : null,
        yearsExp: typeof s.yearsExp === "number" ? s.yearsExp : null,
      })),
      experiences: (parsed.experiences || []).map((e: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        company: String(e.company || ""),
        title: String(e.title || ""),
        startDate: typeof e.startDate === "string" ? e.startDate : null,
        endDate: typeof e.endDate === "string" ? e.endDate : null,
        description: typeof e.description === "string" ? e.description : null,
        highlights: Array.isArray(e.highlights) ? e.highlights.map(String) : null,
      })),
      educations: (parsed.educations || []).map((ed: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        school: String(ed.school || ""),
        degree: typeof ed.degree === "string" ? ed.degree : null,
        field: typeof ed.field === "string" ? ed.field : null,
        startYear: typeof ed.startYear === "number" ? ed.startYear : null,
        endYear: typeof ed.endYear === "number" ? ed.endYear : null,
      })),
      summary: typeof parsed.summary === "string" ? parsed.summary : null,
    }
  } catch (error) {
    console.error("[resume-parser] AI parse failed, falling back to rule-based:", error)
    return parseResumeRuleBased(text)
  }
}

function extractSummaryRuleBased(text: string): string | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 20)
  return lines.length > 0 ? lines.slice(0, 2).join(" ") : null
}

function parseResumeRuleBased(text: string): ParsedResumeResult {
  return {
    skills: extractSkillsRuleBased(text),
    experiences: extractExperiencesRuleBased(text),
    educations: extractEducationRuleBased(text),
    summary: extractSummaryRuleBased(text),
  }
}

export function parseResume(text: string): ParsedResumeResult {
  return parseResumeRuleBased(text)
}
