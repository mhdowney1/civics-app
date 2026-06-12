import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { CATEGORIES } from '@/lib/types'
import {
  QUESTIONS,
  STARRED_QUESTIONS,
  TOTAL_QUESTIONS,
} from '@/lib/questions'
import { getServerProgress } from '@/lib/server-progress'
import { isPaid } from '@/lib/server-access'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard · US Civics Study' }

export default async function DashboardPage() {
  const { userId } = await auth()
  const [user, progress, paid] = await Promise.all([
    currentUser(),
    getServerProgress(),
    userId ? isPaid(userId) : Promise.resolve(false),
  ])

  const byId = new Map(progress.map((p) => [p.questionId, p]))
  const studied = progress.filter((p) => p.status !== 'unseen').length
  const confident = progress.filter((p) => p.status === 'confident').length
  const needsPractice = progress.filter(
    (p) => p.status === 'needs_practice',
  ).length
  const unseen = TOTAL_QUESTIONS - confident - needsPractice
  const weakCount = QUESTIONS.filter(
    (q) => byId.get(q.id)?.status === 'needs_practice',
  ).length

  const firstName = user?.firstName ?? user?.username ?? 'there'

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">
            Welcome back
          </p>
          {paid && (
            <span className="inline-flex items-center gap-1 rounded-full border border-confident/30 bg-confident/10 px-2.5 py-0.5 text-xs font-medium text-confident">
              ✓ Full access
            </span>
          )}
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Hi, {firstName}.
        </h1>
        <p className="mt-3 text-muted">
          {studied} of {TOTAL_QUESTIONS} questions studied so far. Keep going.
        </p>
      </div>

      <section className="mb-10 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Confident" value={confident} color="text-confident" />
        <Stat
          label="Needs practice"
          value={needsPractice}
          color="text-needs-practice"
        />
        <Stat label="Not studied" value={unseen} color="text-unseen" />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-xl font-semibold">Study modes</h2>
        <div className="flex flex-col gap-4">
          <StudyCard
            href="/study"
            title="All 128 questions"
            description="Practice the full set in random order."
            badge={`${TOTAL_QUESTIONS} questions`}
          />
          <StudyCard
            href="/study?mode=starred"
            title="Starred only (65/20 rule)"
            description="Study the 20 starred questions for the 65/20 special consideration."
            badge={`${STARRED_QUESTIONS.length} questions`}
          />
          <StudyCard
            href="/study?mode=weak"
            title="Needs practice"
            description="Re-drill the questions you marked as needs more practice."
            badge={`${weakCount} questions`}
            disabled={weakCount === 0}
          />
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 font-display text-lg font-semibold">By category</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map((c) => {
            const total = QUESTIONS.filter((q) => q.category === c).length
            return (
              <Link
                key={c}
                href={`/study?category=${encodeURIComponent(c)}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition hover:border-confident/40"
              >
                <span className="text-sm">{c}</span>
                <span className="text-xs text-muted group-hover:text-foreground">
                  {total}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <Link
          href="/test"
          className="flex w-full items-center justify-center rounded-2xl border border-confident/40 bg-confident/10 px-6 py-5 font-display text-lg font-semibold text-confident transition hover:bg-confident/15"
        >
          Start mock test →
        </Link>
        <p className="mt-2 text-center text-xs text-muted">
          20 random questions, oral-style. Pass with 12+.
        </p>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-5 text-center">
      <div className={`font-display text-3xl font-semibold ${color}`}>
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  )
}

function StudyCard({
  href,
  title,
  description,
  badge,
  disabled,
}: {
  href: string
  title: string
  description: string
  badge: string
  disabled?: boolean
}) {
  const content = (
    <div
      className={`flex items-center justify-between rounded-2xl border bg-card px-5 py-4 transition ${
        disabled
          ? 'cursor-not-allowed border-border opacity-50'
          : 'border-border hover:border-confident/40'
      }`}
    >
      <div className="min-w-0 pr-4">
        <div className="font-display text-base font-semibold">{title}</div>
        <div className="mt-1 text-sm text-muted">{description}</div>
      </div>
      <span className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted">
        {badge}
      </span>
    </div>
  )
  if (disabled) return content
  return <Link href={href}>{content}</Link>
}
