import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError } from "@/lib/api-helpers"

const TECH_KEYWORDS = [
  "React", "TypeScript", "JavaScript", "Python", "Node.js",
  "Next.js", "AWS", "Docker", "Kubernetes", "PostgreSQL",
  "MongoDB", "GraphQL", "REST", "SQL", "Java", "Go",
  "Rust", "C#", "Ruby", "PHP", "Swift", "Kotlin",
  "Flutter", "React Native", "Angular", "Vue.js", "Svelte",
  "Tailwind CSS", "Prisma", "Redis", "CI/CD", "Git",
  "Jenkins", "Terraform", "Azure", "GCP", "Figma",
  "Agile", "Scrum", "Jira", "Linux", "Bash",
]

const COMMON_COMPANIES = [
  "Google", "Meta", "Amazon", "Microsoft", "Apple",
  "Netflix", "Airbnb", "Uber", "Stripe", "Shopify",
  "Salesforce", "Adobe", "Spotify", "Twitter", "LinkedIn",
]

const SAMPLE_TITLES = [
  "Software Engineer", "Senior Software Engineer", "Full Stack Developer",
  "Frontend Developer", "Backend Developer", "DevOps Engineer",
  "Data Scientist", "Machine Learning Engineer", "Engineering Manager",
]

const SAMPLE_SCHOOLS = [
  "Stanford University", "MIT", "UC Berkeley",
  "Carnegie Mellon University", "Georgia Tech", "University of Washington",
]

const SAMPLE_DEGREES = [
  "Bachelor of Science in Computer Science",
  "Master of Science in Software Engineering",
  "Bachelor of Engineering in Information Technology",
  "Master of Computer Science",
]

const SAMPLE_FIELDS = [
  "Computer Science", "Software Engineering",
  "Information Technology", "Data Science",
]

function extractTechKeywords(text: string): string[] {
  const lowerText = text.toLowerCase()
  return TECH_KEYWORDS.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  )
}

function generateMockSkills(resumeText: string) {
  const extracted = extractTechKeywords(resumeText)
  const keywords = extracted.length >= 4 ? extracted : TECH_KEYWORDS.slice(0, 6)

  const categories: Record<string, string> = {
    React: "Frontend", TypeScript: "Language", JavaScript: "Language",
    Python: "Language", "Node.js": "Backend", AWS: "Cloud",
    Docker: "DevOps", Kubernetes: "DevOps", PostgreSQL: "Database",
    MongoDB: "Database", GraphQL: "API", REST: "API",
    SQL: "Database", Java: "Language", Go: "Language",
    Rust: "Language", "Tailwind CSS": "Frontend", Prisma: "ORM",
    Redis: "Infrastructure", "Next.js": "Framework", Git: "DevOps",
    Terraform: "DevOps", Azure: "Cloud", GCP: "Cloud",
    Jenkins: "CI/CD", "React Native": "Mobile", Angular: "Frontend",
    "Vue.js": "Frontend", Svelte: "Frontend", Figma: "Design",
    Flutter: "Mobile", Swift: "Mobile", Kotlin: "Mobile",
    PHP: "Language", Ruby: "Language", "C#": "Language",
    Linux: "Platform", Bash: "Scripting", Agile: "Process",
    Scrum: "Process", Jira: "Tools",
  }

  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"]

  return keywords.map((name, i) => ({
    name,
    category: categories[name] || "General",
    level: levels[i % levels.length],
    yearsExp: Math.floor(Math.random() * 8) + 1,
  }))
}

function generateMockExperiences(resumeText: string) {
  const extractedKeywords = extractTechKeywords(resumeText)
  const hasKeywords = extractedKeywords.length > 0

  const experience1 = {
    company: hasKeywords && Math.random() > 0.5 ? "Tech Corp" : COMMON_COMPANIES[0],
    title: hasKeywords && extractedKeywords.some((k) => ["Senior", "Manager"].some((s) => k.includes(s)))
      ? "Senior Software Engineer"
      : SAMPLE_TITLES[Math.floor(Math.random() * SAMPLE_TITLES.length)],
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 3),
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    description: "Led development of core platform features and mentored junior team members. Improved CI/CD pipeline reducing deployment time by 40%.",
    highlights: JSON.stringify([
      "Reduced page load time by 60% through code splitting and lazy loading",
      "Designed and implemented RESTful APIs serving 1M+ daily requests",
      "Introduced automated testing practices increasing code coverage to 85%",
    ]),
  }

  const experience2 = {
    company: COMMON_COMPANIES[Math.floor(Math.random() * COMMON_COMPANIES.length)],
    title: SAMPLE_TITLES[Math.floor(Math.random() * (SAMPLE_TITLES.length - 2))],
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 5),
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 3),
    description: "Collaborated on cross-functional teams to deliver customer-facing applications. Built scalable microservices architecture.",
    highlights: JSON.stringify([
      "Shipped 3 major product releases on schedule",
      "Built real-time data dashboard used by 500+ customers",
      "Migrated legacy monolith to microservices architecture",
    ]),
  }

  return [experience1, experience2]
}

function generateMockEducations(resumeText: string) {
  const school = SAMPLE_SCHOOLS[Math.floor(Math.random() * SAMPLE_SCHOOLS.length)]

  return [
    {
      school,
      degree: SAMPLE_DEGREES[Math.floor(Math.random() * SAMPLE_DEGREES.length)],
      field: SAMPLE_FIELDS[Math.floor(Math.random() * SAMPLE_FIELDS.length)],
      startYear: 2012 + Math.floor(Math.random() * 4),
      endYear: 2016 + Math.floor(Math.random() * 3),
    },
  ]
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resume = await prisma.resume.findUnique({
      where: { id: params.id },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    if (resume.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.parsedSkill.deleteMany({ where: { resumeId: resume.id } })
    await prisma.parsedExperience.deleteMany({ where: { resumeId: resume.id } })
    await prisma.parsedEducation.deleteMany({ where: { resumeId: resume.id } })

    const resumeText = resume.parsedText || ""
    const mockSkills = generateMockSkills(resumeText)
    const mockExperiences = generateMockExperiences(resumeText)
    const mockEducations = generateMockEducations(resumeText)

    await prisma.parsedSkill.createMany({
      data: mockSkills.map((skill) => ({
        resumeId: resume.id,
        ...skill,
      })),
    })

    await prisma.parsedExperience.createMany({
      data: mockExperiences.map((exp) => ({
        resumeId: resume.id,
        ...exp,
      })),
    })

    await prisma.parsedEducation.createMany({
      data: mockEducations.map((edu) => ({
        resumeId: resume.id,
        ...edu,
      })),
    })

    const updatedResume = await prisma.resume.findUnique({
      where: { id: resume.id },
      include: {
        skills: true,
        experiences: true,
        educations: true,
      },
    })

    if (!updatedResume) {
      return NextResponse.json({ error: "Failed to retrieve updated resume" }, { status: 500 })
    }

    const parsedExperiences = updatedResume.experiences.map(
      (exp: { highlights: string | null; [key: string]: unknown }) => ({
        ...exp,
        highlights: exp.highlights ? JSON.parse(exp.highlights) : null,
      })
    )

    const { experiences: _exp, ...restOfResume } = updatedResume

    return NextResponse.json({
      resume: {
        ...restOfResume,
        experiences: parsedExperiences,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
