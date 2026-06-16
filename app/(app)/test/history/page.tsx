import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAllTests, type TestRun } from '@/lib/server-tests'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Test history · US Civics Study' }

const PASS_THRESHOLD = 12

export default async function TestHistoryPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const runs = await getAllTests()

  const passCount = runs.filter((r) => r.passed).length
  const bestScore = runs.length > 0 ? Math.max(...runs.map((r) => r.score)) : 0
  const avgScore =
    runs.length > 0
      ? Math.round((runs.reduce((s, r) => s + r.score, 0) / runs.length) * 10) / 10
      : 0

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Mock test
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            History
          </h1>
        </div>
        <Link
          href="/test"
          className="rounded-2xl border border-confident/40 bg-confident/10 px-4 py-2.5 font-display text-sm font-semibold text-confident transition hover:bg-confident/15"
        >
          Take test →
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="font-display text-lg font-semibold">No tests yet</p>
          <p className="mt-2 text-sm text-muted">
            Complete your first mock test to see results here.
          </p>
          <Link
            href="/test"
            className="mt-6 inline-block rounded-2xl border border-confident/40 bg-confident/10 px-6 py-3 font-display font-semibold text-confident transition hover:bg-confident/15"
          >
            Start mock test →
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-3 gap-3">
            <StatCard label="Tests taken" value={String(runs.length)} />
            <StatCard
              label="Pass rate"
              value={`${Math.round((passCount / runs.length) * 100)}%`}
            />
            <StatCard label="Best score" value={`${bestScore}/${runs[0]?.total ?? 20}`} />
          </div>

          <ScoreChart runs={runs} />

          <ul className="mt-6 space-y-2">
            {runs.map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
          </ul>
        </>
      )}

      <div className="mt-8">
        <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-5 text-center">
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</div>
    </div>
  )
}

function ScoreChart({ runs }: { runs: TestRun[] }) {
  const displayed = [...runs].reverse().slice(-10)
  const max = displayed[0]?.total ?? 20

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-4 text-xs uppercase tracking-wider text-muted">
        Score trend (last {displayed.length})
      </p>
      <div className="flex h-20 items-end gap-1.5">
        {displayed.map((run, i) => {
          const pct = (run.score / max) * 100
          const isPass = run.score >= PASS_THRESHOLD
          return (
            <div
              key={run.id}
              className="group relative flex flex-1 flex-col items-center justify-end"
            >
              <div
                className={`w-full rounded-t-md transition-all ${
                  isPass ? 'bg-confident/60' : 'bg-needs-practice/60'
                }`}
                style={{ height: `${pct}%` }}
              />
              <span className="absolute -top-5 hidden text-[10px] text-muted group-hover:block">
                {run.score}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        <span>Oldest</span>
        <span>Latest</span>
      </div>
    </div>
  )
}

function RunRow({ run }: { run: TestRun }) {
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(run.takenAt))

  return (
    <li className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm text-muted">{date}</span>
      <span className="font-display text-sm font-semibold">
        {run.score} / {run.total}
      </span>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          run.passed
            ? 'bg-confident/10 text-confident'
            : 'bg-needs-practice/10 text-needs-practice'
        }`}
      >
        {run.passed ? 'Pass' : 'Fail'}
      </span>
    </li>
  )
}
