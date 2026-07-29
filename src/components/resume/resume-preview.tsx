"use client"

import { useState } from "react"
import {
  ChevronDown,
  Code2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Resume, ParsedSkill, ParsedExperience, ParsedEducation } from "@/types"

interface ResumePreviewProps {
  resume: Resume
  onParsed?: (resume: Resume) => void
}

function SectionHeader({
  title,
  count,
  icon: Icon,
  isOpen,
  onToggle,
}: {
  title: string
  count: number
  icon: React.ElementType
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-semibold">{title}</span>
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
          {count}
        </span>
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
}

function SkillBadge({ skill }: { skill: ParsedSkill }) {
  return (
    <div className="group relative rounded-lg border bg-card px-3 py-2 transition-colors hover:border-primary/50 hover:shadow-sm">
      <p className="text-sm font-medium">{skill.name}</p>
      <div className="mt-1 flex items-center gap-2">
        {skill.category && (
          <span className="text-xs text-muted-foreground">{skill.category}</span>
        )}
        {skill.level && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-medium text-muted-foreground">
            {skill.level}
          </span>
        )}
        {skill.yearsExp != null && (
          <span className="text-xs text-muted-foreground">
            {skill.yearsExp}y
          </span>
        )}
      </div>
    </div>
  )
}

function ExperienceCard({ experience }: { experience: ParsedExperience }) {
  const highlights = experience.highlights

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold">{experience.title}</h4>
          <p className="text-sm text-primary">{experience.company}</p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
          {experience.startDate ? new Date(experience.startDate).getFullYear() : "N/A"}
          {" - "}
          {experience.endDate
            ? new Date(experience.endDate).getFullYear()
            : "Present"}
        </span>
      </div>
      {experience.description && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {experience.description}
        </p>
      )}
      {highlights && highlights.length > 0 && (
        <ul className="mt-2 space-y-1">
          {highlights.map((highlight, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EducationCard({ education }: { education: ParsedEducation }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h4 className="font-semibold">{education.school}</h4>
      <p className="text-sm text-muted-foreground">
        {education.degree}
        {education.field && ` in ${education.field}`}
      </p>
      {education.startYear && (
        <p className="mt-1 text-xs text-muted-foreground">
          {education.startYear}
          {education.endYear ? ` - ${education.endYear}` : " - Present"}
        </p>
      )}
    </div>
  )
}

export default function ResumePreview({ resume, onParsed }: ResumePreviewProps) {
  const [skillsOpen, setSkillsOpen] = useState(true)
  const [experienceOpen, setExperienceOpen] = useState(true)
  const [educationOpen, setEducationOpen] = useState(true)
  const [isParsing, setIsParsing] = useState(false)

  const hasSkills = resume.skills && resume.skills.length > 0

  const handleParse = async () => {
    setIsParsing(true)
    try {
      const res = await fetch(`/api/resume/${resume.id}/parse`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Parsing failed")
      }

      const data = await res.json()
      toast.success("Resume parsed successfully")
      onParsed?.(data.resume)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse resume"
      toast.error(message)
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <div className="space-y-4">
      {!hasSkills && (
        <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950">
          <Sparkles className="mx-auto h-8 w-8 text-amber-500" />
          <h3 className="mt-2 text-lg font-semibold text-amber-800 dark:text-amber-200">
            Resume not yet parsed
          </h3>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Extract skills, experience, and education from your resume using AI
          </p>
          <button
            onClick={handleParse}
            disabled={isParsing}
            className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700",
              isParsing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isParsing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Parse Resume
              </>
            )}
          </button>
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <SectionHeader
          title="Skills"
          count={resume.skills?.length || 0}
          icon={Code2}
          isOpen={skillsOpen}
          onToggle={() => setSkillsOpen(!skillsOpen)}
        />
        {skillsOpen && (
          <div className="px-4 pb-4">
            {resume.skills && resume.skills.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {resume.skills.map((skill) => (
                  <SkillBadge key={skill.id} skill={skill} />
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No skills extracted yet. Click &quot;Parse Resume&quot; above to analyze.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card">
        <SectionHeader
          title="Experience"
          count={resume.experiences?.length || 0}
          icon={Briefcase}
          isOpen={experienceOpen}
          onToggle={() => setExperienceOpen(!experienceOpen)}
        />
        {experienceOpen && (
          <div className="px-4 pb-4">
            {resume.experiences && resume.experiences.length > 0 ? (
              <div className="space-y-3">
                {resume.experiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No experience parsed yet.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card">
        <SectionHeader
          title="Education"
          count={resume.educations?.length || 0}
          icon={GraduationCap}
          isOpen={educationOpen}
          onToggle={() => setEducationOpen(!educationOpen)}
        />
        {educationOpen && (
          <div className="px-4 pb-4">
            {resume.educations && resume.educations.length > 0 ? (
              <div className="space-y-3">
                {resume.educations.map((edu) => (
                  <EducationCard key={edu.id} education={edu} />
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No education parsed yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
