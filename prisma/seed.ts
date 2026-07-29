import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")
  console.log(`Database provider: ${process.env.DATABASE_URL?.startsWith("postgresql") ? "PostgreSQL" : "SQLite"}`)

  // Clean existing data (order matters for foreign keys)
  const tablenames = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_prisma%' AND name NOT LIKE 'sqlite_%'
  `.catch(() => [])

  if (tablenames.length > 0) {
    // SQLite cleanup
    for (const { name } of tablenames) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${name}"`)
      } catch (error) {
        console.log(`Could not delete from ${name}: ${error}`)
      }
    }
  } else {
    // PostgreSQL cleanup (using Prisma's deleteMany)
    await prisma.questionFeedback.deleteMany()
    await prisma.questionResponse.deleteMany()
    await prisma.interviewQuestion.deleteMany()
    await prisma.feedbackReport.deleteMany()
    await prisma.paymentRecord.deleteMany()
    await prisma.interviewSession.deleteMany()
    await prisma.parsedEducation.deleteMany()
    await prisma.parsedExperience.deleteMany()
    await prisma.parsedSkill.deleteMany()
    await prisma.resume.deleteMany()
    await prisma.learningPath.deleteMany()
    await prisma.skillAssessment.deleteMany()
    await prisma.user.deleteMany()
  }

  const password = await bcrypt.hash("password123", 12)

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@interviewai.com",
      password,
      name: "Alex Johnson",
      targetRole: "Senior Software Engineer",
      experienceLevel: "MID",
      planTier: "PRO",
    },
  })

  // Create a resume
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      fileName: "alex_johnson_resume.pdf",
      parsedText: "Senior Software Engineer with 5 years of experience in full-stack development...",
      isCurrent: true,
    },
  })

  // Add parsed skills
  await prisma.parsedSkill.createMany({
    data: [
      { resumeId: resume.id, name: "React", category: "Frontend", level: "Advanced", yearsExp: 4 },
      { resumeId: resume.id, name: "TypeScript", category: "Language", level: "Advanced", yearsExp: 3 },
      { resumeId: resume.id, name: "Node.js", category: "Backend", level: "Intermediate", yearsExp: 3 },
      { resumeId: resume.id, name: "PostgreSQL", category: "Database", level: "Intermediate", yearsExp: 2 },
      { resumeId: resume.id, name: "AWS", category: "Cloud", level: "Beginner", yearsExp: 1 },
      { resumeId: resume.id, name: "Python", category: "Language", level: "Intermediate", yearsExp: 2 },
    ],
  })

  // Add experiences
  await prisma.parsedExperience.createMany({
    data: [
      {
        resumeId: resume.id,
        company: "TechCorp Inc",
        title: "Software Engineer",
        startDate: new Date("2022-01-01"),
        endDate: new Date("2024-12-31"),
        description: "Built microservices architecture serving 1M+ users",
        highlights: JSON.stringify(["Led migration to TypeScript", "Reduced API latency by 40%", "Mentored 3 junior developers"]),
      },
      {
        resumeId: resume.id,
        company: "StartupXYZ",
        title: "Junior Developer",
        startDate: new Date("2019-06-01"),
        endDate: new Date("2021-12-31"),
        description: "Full-stack development with React and Node.js",
        highlights: JSON.stringify(["Built customer-facing dashboard", "Implemented CI/CD pipeline"]),
      },
    ],
  })

  // Add education
  await prisma.parsedEducation.createMany({
    data: [
      { resumeId: resume.id, school: "State University", degree: "BS", field: "Computer Science", startYear: 2015, endYear: 2019 },
    ],
  })

  // Create completed interview sessions with feedback
  const session1 = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      resumeId: resume.id,
      interviewType: "BEHAVIORAL",
      difficulty: "MID",
      mode: "TEXT",
      status: "COMPLETED",
      questionCount: 5,
      startedAt: new Date("2026-07-20T10:00:00Z"),
      endedAt: new Date("2026-07-20T10:25:00Z"),
    },
  })

  const questions1 = [
    { seq: 1, text: "Tell me about a time you had to deal with a difficult stakeholder.", type: "BEHAVIORAL", category: "Leadership" },
    { seq: 2, text: "Describe a project where you had to learn a new technology quickly.", type: "BEHAVIORAL", category: "Adaptability" },
    { seq: 3, text: "How do you handle conflicting priorities in a tight deadline?", type: "BEHAVIORAL", category: "Time Management" },
    { seq: 4, text: "Tell me about a time you made a mistake and how you handled it.", type: "BEHAVIORAL", category: "Accountability" },
    { seq: 5, text: "Where do you see yourself in 5 years?", type: "BEHAVIORAL", category: "Career Goals" },
  ]

  for (const q of questions1) {
    const question = await prisma.interviewQuestion.create({
      data: {
        sessionId: session1.id,
        sequenceNumber: q.seq,
        questionText: q.text,
        questionType: q.type,
        category: q.category,
        isAnswered: true,
      },
    })
    await prisma.questionResponse.create({
      data: {
        questionId: question.id,
        responseText: "In my previous role at TechCorp, I had to handle a situation where the product manager and engineering lead had conflicting priorities. I scheduled a meeting with both stakeholders, presented data on the trade-offs, and helped them reach a compromise that met both business and technical requirements. The project shipped on time with 95% of both parties' requirements met.",
        responseTimeMs: 45000,
        wordCount: 62,
      },
    })
  }

  // Feedback report for session 1
  await prisma.feedbackReport.create({
    data: {
      sessionId: session1.id,
      overallScore: 82,
      dimensionScores: JSON.stringify({ clarity: 8, relevance: 9, depth: 7, impact: 8, delivery: 9 }),
      strengths: JSON.stringify(["Strong use of STAR method", "Good quantifiable results", "Clear communication"]),
      weaknesses: JSON.stringify(["Could provide more context on team dynamics", "Some answers needed more specific metrics"]),
      summary: "Overall strong performance. You demonstrate good communication skills and provide concrete examples. Focus on adding more measurable outcomes to your stories.",
      rawAiOutput: "...",
    },
  })

  // Another session - TECHNICAL
  const session2 = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      resumeId: resume.id,
      interviewType: "TECHNICAL",
      difficulty: "SENIOR",
      mode: "TEXT",
      status: "COMPLETED",
      questionCount: 3,
      startedAt: new Date("2026-07-18T14:00:00Z"),
      endedAt: new Date("2026-07-18T14:30:00Z"),
    },
  })

  const questions2 = [
    { seq: 1, text: "Explain the differences between SQL and NoSQL databases and when you would choose each.", type: "TECHNICAL", category: "Databases" },
    { seq: 2, text: "How would you design a rate limiter for a REST API?", type: "TECHNICAL", category: "System Design" },
    { seq: 3, text: "Describe the React component lifecycle and how hooks changed the paradigm.", type: "TECHNICAL", category: "Frontend" },
  ]

  for (const q of questions2) {
    const question = await prisma.interviewQuestion.create({
      data: {
        sessionId: session2.id,
        sequenceNumber: q.seq,
        questionText: q.text,
        questionType: q.type,
        category: q.category,
        isAnswered: true,
      },
    })
    await prisma.questionResponse.create({
      data: {
        questionId: question.id,
        responseText: "SQL databases are relational and use structured schemas with ACID compliance, making them ideal for applications requiring data integrity like banking systems. NoSQL databases offer flexible schemas and horizontal scalability, better for big data and real-time applications. Choose SQL when data consistency is critical, NoSQL when you need to scale horizontally or handle unstructured data.",
        responseTimeMs: 38000,
        wordCount: 55,
      },
    })
  }

  await prisma.feedbackReport.create({
    data: {
      sessionId: session2.id,
      overallScore: 75,
      dimensionScores: JSON.stringify({ clarity: 7, relevance: 8, depth: 7, impact: 7, delivery: 8 }),
      strengths: JSON.stringify(["Good technical knowledge", "Clear system design thinking"]),
      weaknesses: JSON.stringify(["Could go deeper on trade-offs", "Add more real-world examples"]),
      summary: "Solid technical foundation. Your system design thinking is good but needs more practice articulating trade-offs.",
    },
  })

  // In-progress session
  await prisma.interviewSession.create({
    data: {
      userId: user.id,
      resumeId: resume.id,
      interviewType: "MIXED",
      difficulty: "MID",
      mode: "TEXT",
      status: "IN_PROGRESS",
      questionCount: 10,
      startedAt: new Date("2026-07-21T09:00:00Z"),
    },
  })

  // Skill assessment
  await prisma.skillAssessment.create({
    data: {
      userId: user.id,
      targetRole: "Senior Software Engineer",
      currentSkills: JSON.stringify(["React", "TypeScript", "Node.js", "PostgreSQL", "Git"]),
      targetSkills: JSON.stringify(["React", "TypeScript", "Node.js", "PostgreSQL", "System Design", "AWS", "Kubernetes", "Go", "GraphQL"]),
      gaps: JSON.stringify([
        { skill: "System Design", currentProficiency: 4, targetProficiency: 8, demandLevel: "HIGH", learningHours: 40 },
        { skill: "AWS", currentProficiency: 3, targetProficiency: 7, demandLevel: "HIGH", learningHours: 60 },
        { skill: "Kubernetes", currentProficiency: 0, targetProficiency: 6, demandLevel: "MEDIUM", learningHours: 50 },
        { skill: "Go", currentProficiency: 0, targetProficiency: 5, demandLevel: "LOW", learningHours: 30 },
        { skill: "GraphQL", currentProficiency: 0, targetProficiency: 5, demandLevel: "MEDIUM", learningHours: 20 },
      ]),
      recommendations: JSON.stringify(["Take 'System Design Interview' course", "AWS Solutions Architect certification path", "Build a side project with Go and GraphQL"]),
    },
  })

  // Learning path
  await prisma.learningPath.create({
    data: {
      userId: user.id,
      title: "Senior Engineer Interview Prep",
      goalRole: "Senior Software Engineer",
      progress: 35,
      items: JSON.stringify([
        { id: "1", title: "System Design Fundamentals", type: "COURSE", resourceUrl: "https://example.com/system-design", estimatedHours: 10, completed: true, week: 1 },
        { id: "2", title: "Design a URL Shortener", type: "PROJECT", resourceUrl: null, estimatedHours: 5, completed: true, week: 1 },
        { id: "3", title: "AWS Core Services Deep Dive", type: "COURSE", resourceUrl: "https://example.com/aws", estimatedHours: 15, completed: false, week: 2 },
        { id: "4", title: "Kubernetes Basics Workshop", type: "COURSE", resourceUrl: null, estimatedHours: 8, completed: false, week: 2 },
        { id: "5", title: "Build a Rate Limiter in Go", type: "PROJECT", resourceUrl: null, estimatedHours: 6, completed: false, week: 3 },
        { id: "6", title: "Behavioral Interview Practice", type: "PRACTICE", resourceUrl: null, estimatedHours: 3, completed: false, week: 3 },
        { id: "7", title: "GraphQL API Design", type: "READING", resourceUrl: "https://example.com/graphql", estimatedHours: 4, completed: false, week: 4 },
        { id: "8", title: "Mock System Design Interview", type: "PRACTICE", resourceUrl: null, estimatedHours: 2, completed: false, week: 4 },
      ]),
    },
  })

  console.log("Seed data created successfully!")
  console.log("Demo login: demo@interviewai.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
