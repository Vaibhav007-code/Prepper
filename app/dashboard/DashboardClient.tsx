'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getXPProgress } from '@/lib/seed'
import { Profile, Subject } from '@/lib/supabase/types'
import { Flame, BookOpen, TrendingUp, Zap, ChevronRight, Star, Activity, CheckCircle2, Layers } from 'lucide-react'
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

export default function DashboardClient({ profile, displayName, subjects, completedBySubject, sessions, totalCompleted }: Props) {
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

  // Heatmap — last 90 days
  const today = new Date()
  const start = subDays(today, 89)
  const days = eachDayOfInterval({ start, end: today })
  const sessionMap: Record<string, number> = {}
  for (const s of sessions) {
    sessionMap[s.session_date] = s.topics_completed
  }

  const totalTopics = subjects.reduce((a, s) => a + s.total_topics, 0)
  const overallProgress = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0
  const totalXP = profile?.total_xp ?? 0
  const streak = profile?.current_streak ?? 0

  if (seeding) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 20 }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
          <Zap size={28} color="white" />
        </div>
        <div style={{ position: 'absolute', inset: -4, borderRadius: 24, border: '2px solid rgba(99,102,241,0.3)', animation: 'pulse 2s infinite' }} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 6 }}>Setting up your curriculum…</div>
        <div style={{ fontSize: 14, color: 'var(--text-3)', textAlign: 'center' }}>Seeding all 12 subjects. Just a moment.</div>
      </div>
      <div style={{ width: 200, height: 4, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '60%', borderRadius: 99, background: 'linear-gradient(90deg, #6366f1, #a855f7)', animation: 'shimmer 1.5s infinite' }} />
      </div>
    </div>
  )

  if (schemaError) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 20, padding: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #ef4444, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(239,68,68,0.3)' }}>
        <Layers size={28} color="white" />
      </div>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Seed Failed</div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}>
          Could not write curriculum data to the database. This is usually because the{' '}
          <code style={{ background: 'var(--bg-3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 12 }}>SUPABASE_SERVICE_ROLE_KEY</code>{' '}
          is missing from your <code style={{ background: 'var(--bg-3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 12 }}>.env.local</code>.
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
          Get it from: <strong style={{ color: 'var(--accent-2)' }}>Supabase Dashboard → Project Settings → API → service_role key</strong>
          <br />Then add to <code style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>.env.local</code>:{' '}
          <code style={{ fontFamily: 'var(--mono)', fontSize: 12, background: 'var(--bg-3)', padding: '2px 8px', borderRadius: 4 }}>SUPABASE_SERVICE_ROLE_KEY=your_key_here</code>
        </div>
        {seedErrorMsg && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg-3)', padding: '8px 12px', borderRadius: 8, fontFamily: 'var(--mono)', marginBottom: 16, wordBreak: 'break-all' }}>
            {seedErrorMsg}
          </div>
        )}
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ margin: '0 auto' }}>
          Retry
        </button>
      </div>
    </div>
  )

  return (
    <div>
      {/* Page header with greeting */}
      <div className="page-header" style={{ paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Good {getGreeting()} 👋
            </div>
            <h1 className="page-title" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>
              {displayName.split(' ')[0]}&apos;s Dashboard
            </h1>
            <p className="page-subtitle" style={{ marginTop: 6 }}>Winter Arc in progress — stay consistent, stay sharp.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            {streak > 0 && (
              <div className="streak-badge" style={{ fontSize: 13 }}>
                <Flame size={14} /> {streak} day streak
              </div>
            )}
            <Link href="/dashboard/subjects" className="btn btn-primary btn-sm">
              <BookOpen size={14} /> Study Now
            </Link>
          </div>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Stat cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{ '--stat-glow': 'rgba(99,102,241,0.12)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={16} color="var(--accent-2)" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-2)', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(99,102,241,0.12)', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(99,102,241,0.2)' }}>Level</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--accent-2)' }}>{xpData.level}</div>
            <div className="stat-label">Current Level</div>
          </div>

          <div className="stat-card" style={{ '--stat-glow': 'rgba(245,158,11,0.12)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="var(--gold)" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(245,158,11,0.2)' }}>XP</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--gold)' }}>{totalXP.toLocaleString()}</div>
            <div className="stat-label">Total XP Earned</div>
          </div>

          <div className="stat-card" style={{ '--stat-glow': 'rgba(16,185,129,0.12)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="var(--green)" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(16,185,129,0.2)' }}>Done</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{totalCompleted}</div>
            <div className="stat-label">Topics Completed</div>
          </div>

          <div className="stat-card" style={{ '--stat-glow': 'rgba(239,68,68,0.1)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={16} color="var(--red)" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.08)', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(239,68,68,0.15)' }}>Streak</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--red)' }}>{streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        {/* Progress + Level row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

          {/* Overall Progress */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={16} color="var(--accent-2)" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Overall Progress</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{totalCompleted} of {totalTopics} topics</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 900, color: 'var(--accent-2)', letterSpacing: '-0.03em' }}>{overallProgress}%</div>
            </div>
            <div className="progress-track" style={{ height: 10, background: 'var(--bg-4)' }}>
              <div className="progress-fill" style={{
                width: `${overallProgress}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                boxShadow: '0 0 16px rgba(99,102,241,0.4)'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Start: Sep 2025</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Target: Dec 31</span>
            </div>
          </div>

          {/* XP Level Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent), #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 900, color: '#fff',
                flexShrink: 0, boxShadow: '0 0 20px var(--accent-glow)'
              }}>
                {xpData.level}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Level {xpData.level}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{xpData.currentXP} / {xpData.nextLevelXP} XP to next</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Progress</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-2)' }}>{xpData.progress}%</div>
              </div>
            </div>
            <div className="xp-track" style={{ height: 10, background: 'var(--bg-4)' }}>
              <div className="xp-fill" style={{ width: `${xpData.progress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Level {xpData.level}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Level {xpData.level + 1}</span>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={16} color="var(--accent-2)" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Activity Heatmap</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Last 90 days of study sessions</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Less</span>
              {['0', '1', '2', '3', '4'].map(l => <div key={l} className="heatmap-cell" data-level={l} />)}
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>More</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd')
              const count = sessionMap[key] ?? 0
              const isT = isToday(day)
              return (
                <div key={key} className="heatmap-cell" data-level={getHeatLevel(count)}
                  title={`${format(day, 'MMM d')}: ${count} topics`}
                  style={isT ? { outline: '2px solid var(--accent)', outlineOffset: 1 } : undefined} />
              )
            })}
          </div>
        </div>

        {/* Subjects grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={16} color="var(--accent-2)" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Subjects</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{subjects.length} subjects · {totalTopics} total topics</div>
              </div>
            </div>
            <Link href="/dashboard/subjects" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {subjects.map(s => {
              const done = completedBySubject[s.id] ?? 0
              const pct = s.total_topics > 0 ? Math.round((done / s.total_topics) * 100) : 0
              const isComplete = pct === 100
              return (
                <Link key={s.id} href={`/dashboard/subjects/${s.id}`} className="subject-card" style={{ '--c': s.color } as React.CSSProperties}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 11,
                      background: `${s.color}18`,
                      border: `1px solid ${s.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: s.color ?? 'var(--accent)', fontFamily: 'var(--mono)' }}>{s.title.slice(0, 3).toUpperCase()}</span>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: isComplete ? 'rgba(16,185,129,0.12)' : `${s.color}15`,
                      color: isComplete ? 'var(--green)' : (s.color ?? 'var(--accent)'),
                      border: `1px solid ${isComplete ? 'rgba(16,185,129,0.25)' : s.color + '30'}`,
                    }}>
                      {isComplete ? '✓ Done' : `${pct}%`}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>{done} / {s.total_topics} topics</div>
                  <div className="progress-track" style={{ height: 4, background: 'var(--bg-4)' }}>
                    <div className="progress-fill" style={{
                      width: `${pct}%`,
                      background: isComplete ? 'var(--green)' : (s.color ?? 'var(--accent)'),
                      boxShadow: pct > 0 ? `0 0 8px ${s.color ?? 'var(--accent)'}60` : 'none'
                    }} />
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
