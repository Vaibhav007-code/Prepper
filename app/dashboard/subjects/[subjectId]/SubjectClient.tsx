'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Subject, Phase, TopicGroup, Topic } from '@/lib/supabase/types'
import Link from 'next/link'
import { format } from 'date-fns'

type Status = 'not_started' | 'in_progress' | 'completed' | 'reviewing'

interface Props {
  subject: Subject
  phases: Phase[]
  groups: TopicGroup[]
  topics: Topic[]
  progressMap: Record<string, string>
  userId: string
}

const STATUS_CYCLE: Status[] = ['not_started', 'in_progress', 'completed', 'reviewing']

function nextStatus(current: string | undefined): Status {
  const idx = STATUS_CYCLE.indexOf((current ?? 'not_started') as Status)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

function StatusMark({ status }: { status: string | undefined }) {
  if (status === 'completed') {
    return (
      <div className="topic-check done" aria-label="completed">
        <svg width="12" height="12" viewBox="0 0 16 16">
          <path className="check-path" d="M3 8.5l3.2 3.2L13 4.5" />
        </svg>
      </div>
    )
  }
  if (status === 'in_progress') return <div className="topic-check progress" aria-label="in progress" />
  if (status === 'reviewing')   return <div className="topic-check review"   aria-label="reviewing" />
  return <div className="topic-check" aria-label="not started" />
}

export default function SubjectClient({
  subject, phases, groups, topics, progressMap: initialMap, userId,
}: Props) {
  const [progressMap, setProgressMap] = useState<Record<string, string>>(initialMap)
  const [openPhases, setOpenPhases]   = useState<Set<string>>(new Set(phases.map(p => p.id)))
  const [loading, setLoading]         = useState<string | null>(null)
  const supabase = createClient()

  const totalTopics = topics.length
  const doneCount   = topics.filter(t => progressMap[t.id] === 'completed').length
  const pct         = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0

  async function toggleTopic(topicId: string, xpReward: number) {
    setLoading(topicId)
    const current = progressMap[topicId]
    const next    = nextStatus(current)
    const now     = new Date().toISOString()
    const today   = format(new Date(), 'yyyy-MM-dd')

    setProgressMap(m => ({ ...m, [topicId]: next }))

    const { error } = await supabase.from('user_progress').upsert({
      user_id: userId, topic_id: topicId, status: next,
      completed_at: next === 'completed' ? now : null
    }, { onConflict: 'user_id,topic_id' })

    if (!error && next === 'completed') {
      await supabase.rpc('award_xp', { p_user_id: userId, p_xp: xpReward })
      await supabase.from('daily_sessions').upsert({
        user_id: userId, session_date: today,
        topics_completed: 1, xp_earned: xpReward,
      }, { onConflict: 'user_id,session_date' })

      showXPPop(`▲ +${xpReward} XP`)
    } else if (!error && current === 'completed') {
      await supabase.rpc('award_xp', { p_user_id: userId, p_xp: -xpReward })
    }

    setLoading(null)
  }

  function showXPPop(text: string) {
    const el = document.createElement('div')
    el.className = 'xp-pop'
    el.textContent = text
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 900)
  }

  function togglePhase(phaseId: string) {
    setOpenPhases(s => {
      const n = new Set(s)
      if (n.has(phaseId)) n.delete(phaseId); else n.add(phaseId)
      return n
    })
  }

  const groupsByPhase  = phases.reduce((acc, phase) => {
    acc[phase.id] = groups.filter(g => g.phase_id === phase.id)
    return acc
  }, {} as Record<string, TopicGroup[]>)

  const topicsByGroup = groups.reduce((acc, g) => {
    acc[g.id] = topics.filter(t => t.topic_group_id === g.id)
    return acc
  }, {} as Record<string, Topic[]>)

  return (
    <div>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="page-header">
        <Link
          href="/dashboard/subjects"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            textDecoration: 'none', marginBottom: 20,
            fontFamily: 'var(--mono)', fontSize: 12,
            color: 'var(--text-faint)', letterSpacing: '0.02em',
          }}
        >
          ← All subjects
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          {/* Code badge */}
          <div
            className="mono"
            style={{
              fontSize: 13, color: 'var(--accent)',
              border: '1px solid var(--border)',
              padding: '8px 12px',
              background: 'var(--surface-elevated)',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}
          >
            {subject.code}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-title">{subject.title}</h1>
            <p
              className="mono"
              style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 6 }}
            >
              {doneCount} / {totalTopics} topics · {pct}% complete
            </p>
          </div>

          {/* Seal */}
          <div
            className="grade-seal"
            style={{ fontSize: 19, minWidth: 44, height: 44, marginLeft: 'auto', flexShrink: 0 }}
          >
            {pct}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-track" style={{ marginTop: 18 }}>
          <div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? 'var(--success)' : 'var(--accent)',
            }}
          />
        </div>
      </div>

      {/* ── Phases ─────────────────────────────────────── */}
      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {phases.map(phase => {
          const phaseGroups     = groupsByPhase[phase.id] ?? []
          const allPhaseTopics  = phaseGroups.flatMap(g => topicsByGroup[g.id] ?? [])
          const phaseDone       = allPhaseTopics.filter(t => progressMap[t.id] === 'completed').length
          const isOpen          = openPhases.has(phase.id)
          const phaseComplete   = allPhaseTopics.length > 0 && phaseDone === allPhaseTopics.length

          return (
            <div
              key={phase.id}
              className="card"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              {/* Phase header button */}
              <button
                onClick={() => togglePhase(phase.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '14px 20px',
                  background: isOpen ? 'var(--surface-elevated)' : 'none',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  borderBottom: isOpen ? '1px solid var(--border)' : 'none',
                  transition: 'background var(--dur-micro) var(--ease-out)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="eyebrow" style={{ color: 'var(--accent)' }}>
                    Phase {phase.code}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                    {phase.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="progress-track" style={{ width: 64 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${allPhaseTopics.length > 0 ? Math.round((phaseDone / allPhaseTopics.length) * 100) : 0}%`,
                        background: phaseComplete ? 'var(--success)' : 'var(--accent)',
                      }}
                    />
                  </div>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-faint)', minWidth: 36, textAlign: 'right' }}>
                    {phaseDone}/{allPhaseTopics.length}
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: 13, color: 'var(--text-faint)', width: 14, textAlign: 'center' }}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: '16px 16px 8px' }}>
                  {phaseGroups.map(group => {
                    const gTopics = topicsByGroup[group.id] ?? []
                    const gDone   = gTopics.filter(t => progressMap[t.id] === 'completed').length
                    return (
                      <div key={group.id} style={{ marginBottom: 20 }}>
                        {/* Group header */}
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 8px', marginBottom: 4,
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {group.code} — {group.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-track" style={{ width: 52 }}>
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${gTopics.length > 0 ? Math.round((gDone / gTopics.length) * 100) : 0}%`,
                                }}
                              />
                            </div>
                            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', minWidth: 30, textAlign: 'right' }}>
                              {gDone}/{gTopics.length}
                            </span>
                          </div>
                        </div>

                        {/* Topics */}
                        {gTopics.map(topic => {
                          const status = progressMap[topic.id]
                          return (
                            <div
                              key={topic.id}
                              className="topic-item"
                              onClick={() => loading !== topic.id && toggleTopic(topic.id, topic.xp_reward)}
                              style={{ opacity: loading === topic.id ? 0.55 : 1 }}
                            >
                              <StatusMark status={status} />
                              <span className={`topic-title${status === 'completed' ? ' done' : ''}`}>
                                {topic.title}
                              </span>
                              <span
                                className="mono"
                                style={{
                                  fontSize: 11, color: 'var(--accent-deep)',
                                  flexShrink: 0, textAlign: 'right',
                                }}
                              >
                                +{topic.xp_reward}xp
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
