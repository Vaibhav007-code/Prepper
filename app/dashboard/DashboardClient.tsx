'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getXPProgress } from '@/lib/seed'
import { Profile, Subject } from '@/lib/supabase/types'
import { format, eachDayOfInterval, subDays, isToday } from 'date-fns'

interface Props {
  profile: Profile | null
  displayName: string
  subjects: Pick<Subject, 'id' | 'title' | 'color' | 'icon' | 'order_index' | 'total_topics'>[]
  completedBySubject: Record<string, number>
  sessions: { session_date: string; xp_earned: number; topics_completed: number }[]
  totalCompleted: number
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function getHeatLevel(count: number): string {
  if (!count) return '0'
  if (count < 3) return '1'
  if (count < 6) return '2'
  if (count < 10) return '3'
  return '4'
}

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const from = n
    const start = performance.now()
    const dur = 420
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(from + (value - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <>{n.toLocaleString()}</>
}

export default function DashboardClient({
  profile, displayName, subjects, completedBySubject, sessions, totalCompleted,
}: Props) {
  const [seeding, setSeeding] = useState(subjects.length === 0)
  const [schemaError, setSchemaError] = useState(false)
  const [seedErrorMsg, setSeedErrorMsg] = useState('')
  const xpData = getXPProgress(profile?.total_xp ?? 0)

  useEffect(() => {
    if (subjects.length === 0) {
      fetch('/api/seed', { method: 'POST' })
        .then(res => res.json())
        .then((result) => {
          if (result.error) {
            setSeedErrorMsg(result.error)
            setSchemaError(true)
            setSeeding(false)
          } else {
            setSeeding(false)
            window.location.reload()
          }
        })
        .catch((err) => {
          setSeedErrorMsg(err.message ?? 'Network error')
          setSchemaError(true)
          setSeeding(false)
        })
    }
  }, [subjects.length])

  const today  = new Date()
  const start  = subDays(today, 89)
  const days   = eachDayOfInterval({ start, end: today })
  const sessionMap: Record<string, number> = {}
  for (const s of sessions) sessionMap[s.session_date] = s.topics_completed

  const totalTopics    = subjects.reduce((a, s) => a + s.total_topics, 0)
  const overallProgress = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0
  const totalXP  = profile?.total_xp ?? 0
  const streak   = profile?.current_streak ?? 0

  /* ── Loading / error states ─────────────────────────── */
  if (seeding) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 20,
    }}>
      <div className="grade-seal" style={{ width: 52, height: 52, fontSize: 26 }}>W</div>
      <div style={{ textAlign: 'center' }}>
        <div className="display" style={{ fontSize: 19, fontWeight: 500, marginBottom: 8 }}>
          Setting up your curriculum
        </div>
        <div className="eyebrow">Seeding all 12 subjects…</div>
      </div>
    </div>
  )

  if (schemaError) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 20, padding: 32,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div className="display" style={{ fontSize: 24, fontWeight: 500, marginBottom: 10 }}>
          Seed failed
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
          Could not write curriculum data. This usually means the{' '}
          <code className="mono" style={{ background: 'var(--surface-elevated)', padding: '2px 6px', fontSize: 12 }}>
            SUPABASE_SERVICE_ROLE_KEY
          </code>{' '}
          is missing from{' '}
          <code className="mono" style={{ background: 'var(--surface-elevated)', padding: '2px 6px', fontSize: 12 }}>
            .env.local
          </code>.
        </div>
        {seedErrorMsg && (
          <div
            className="mono"
            style={{
              fontSize: 12, color: 'var(--text-faint)',
              background: 'var(--surface-elevated)', padding: '10px 14px',
              marginBottom: 20, wordBreak: 'break-all',
              border: '1px solid var(--border)', textAlign: 'left',
            }}
          >
            {seedErrorMsg}
          </div>
        )}
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    </div>
  )

  /* ── Main dashboard ─────────────────────────────────── */
  return (
    <div>
      {/* Page header */}
      <div className="page-header" style={{ paddingBottom: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Good {getGreeting()}
            </div>
            <h1 className="page-title">
              {displayName.split(' ')[0]}&apos;s log
            </h1>
            <p className="page-subtitle">
              Winter Arc in progress — stay consistent, stay sharp.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
            {streak > 0 && (
              <div className="streak-badge">{streak} day streak</div>
            )}
            <Link href="/dashboard/subjects" className="btn btn-primary btn-sm">
              Study now
            </Link>
          </div>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Stats — ledger table ────────────────────── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Level</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>
              <CountUp value={xpData.level} />
            </div>
            <div className="stat-label">Current level</div>
          </div>

          <div className="stat-card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>XP</div>
            <div className="stat-value"><CountUp value={totalXP} /></div>
            <div className="stat-label">Total earned</div>
          </div>

          <div className="stat-card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Done</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              <CountUp value={totalCompleted} />
            </div>
            <div className="stat-label">Topics complete</div>
          </div>

          <div className="stat-card">
            <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--signal)' }}>Streak</div>
            <div className="stat-value" style={{ color: 'var(--signal)' }}>
              <CountUp value={streak} />
            </div>
            <div className="stat-label">Day streak</div>
          </div>
        </div>

        {/* ── Progress cards row ──────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

          {/* Overall progress */}
          <div className="card">
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 18,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                  Overall progress
                </div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                  {totalCompleted} of {totalTopics} topics
                </div>
              </div>
              <div className="display" style={{ fontSize: 28, fontWeight: 500, color: 'var(--accent)' }}>
                {overallProgress}%
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>Sep 2025</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>Target: Dec 31</span>
            </div>
          </div>

          {/* XP / level */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div className="grade-seal" style={{ width: 42, height: 42, fontSize: 22 }}>
                {xpData.level}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                  Level {xpData.level}
                </div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                  {xpData.currentXP.toLocaleString()} / {xpData.nextLevelXP.toLocaleString()} xp
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>To next</div>
                <div className="mono" style={{ fontSize: 15, color: 'var(--accent)' }}>
                  {xpData.progress}%
                </div>
              </div>
            </div>
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${xpData.progress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                Lv {xpData.level}
              </span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                Lv {xpData.level + 1}
              </span>
            </div>
          </div>
        </div>

        {/* ── Activity heatmap ────────────────────────── */}
        <div className="card">
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                Activity
              </div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                Last 90 days
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="eyebrow">Less</span>
              {(['0', '1', '2', '3', '4'] as const).map(l => (
                <div key={l} className="heatmap-cell" data-level={l} style={{ animation: 'none' }} />
              ))}
              <span className="eyebrow">More</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {days.map((day, i) => {
              const key   = format(day, 'yyyy-MM-dd')
              const count = sessionMap[key] ?? 0
              const isT   = isToday(day)
              return (
                <div
                  key={key}
                  className="heatmap-cell"
                  data-level={getHeatLevel(count)}
                  title={`${format(day, 'MMM d')}: ${count} topics`}
                  style={{
                    animationDelay: `${Math.min(i, 40) * 8}ms`,
                    outline:       isT ? '1px solid var(--accent)' : undefined,
                    outlineOffset: isT ? 1 : undefined,
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* ── Subjects mini-grid ──────────────────────── */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 14,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                Subjects
              </div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                {subjects.length} subjects · {totalTopics} total topics
              </div>
            </div>
            <Link
              href="/dashboard/subjects"
              className="mono"
              style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}
            >
              View all —
            </Link>
          </div>

          {/* 3-column grid on desktop; auto-fills smaller */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {subjects.map(s => {
              const done = completedBySubject[s.id] ?? 0
              const pct  = s.total_topics > 0 ? Math.round((done / s.total_topics) * 100) : 0
              const isComplete = pct === 100
              return (
                <Link key={s.id} href={`/dashboard/subjects/${s.id}`} className="subject-card">
                  <div style={{
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', marginBottom: 10,
                  }}>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {s.title.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="mono" style={{
                      fontSize: 12,
                      color: isComplete ? 'var(--success)' : 'var(--accent)',
                    }}>
                      {pct}%
                    </div>
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 500, color: 'var(--text)',
                    marginBottom: 10, lineHeight: 1.3,
                  }}>
                    {s.title}
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: isComplete ? 'var(--success)' : 'var(--accent)',
                      }}
                    />
                  </div>
                  <div className="mono" style={{
                    fontSize: 11, color: 'var(--text-faint)',
                    marginTop: 8, textAlign: 'right',
                  }}>
                    {done}/{s.total_topics}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
