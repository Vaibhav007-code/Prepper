'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Subject, Phase, TopicGroup, Topic } from '@/lib/supabase/types'
import { ArrowLeft, ChevronDown, ChevronRight, Check, Clock, RefreshCw, Circle } from 'lucide-react'
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

function StatusIcon({ status }: { status: string | undefined }) {
  if (status === 'completed') return <div className="topic-check done"><Check size={11} color="white" strokeWidth={3} /></div>
  if (status === 'in_progress') return <div className="topic-check progress"><Clock size={10} color="var(--accent)" /></div>
  if (status === 'reviewing') return <div className="topic-check review"><RefreshCw size={10} color="var(--gold)" /></div>
  return <div className="topic-check"><Circle size={11} color="var(--text-3)" /></div>
}

export default function SubjectClient({ subject, phases, groups, topics, progressMap: initialMap, userId }: Props) {
  const [progressMap, setProgressMap] = useState<Record<string, string>>(initialMap)
  const [openPhases, setOpenPhases] = useState<Set<string>>(new Set(phases.map(p => p.id)))
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  const totalTopics = topics.length
  const doneCount = topics.filter(t => progressMap[t.id] === 'completed').length
  const pct = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0
  const subjectColor = subject.color ?? 'var(--accent)'

  async function toggleTopic(topicId: string, xpReward: number) {
    setLoading(topicId)
    const current = progressMap[topicId]
    const next = nextStatus(current)
    const now = new Date().toISOString()
    const today = format(new Date(), 'yyyy-MM-dd')

    setProgressMap(m => ({ ...m, [topicId]: next }))

    const { error } = await supabase.from('user_progress').upsert({
      user_id: userId, topic_id: topicId, status: next,
      completed_at: next === 'completed' ? now : null
    }, { onConflict: 'user_id,topic_id' })

    if (!error && next === 'completed') {
      // Award XP + update daily session
      await supabase.rpc('award_xp', { p_user_id: userId, p_xp: xpReward })
      await supabase.from('daily_sessions').upsert({
        user_id: userId, session_date: today,
        topics_completed: 1, xp_earned: xpReward,
      }, { onConflict: 'user_id,session_date' })

      // Show XP pop
      showXPPop(`+${xpReward} XP`)
    } else if (!error && current === 'completed') {
      // Deduct XP
      await supabase.rpc('award_xp', { p_user_id: userId, p_xp: -xpReward })
    }

    setLoading(null)
  }

  function showXPPop(text: string) {
    const el = document.createElement('div')
    el.className = 'xp-pop'
    el.textContent = text
    el.style.cssText = `bottom: 80px; right: 24px;`
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 900)
  }

  function togglePhase(phaseId: string) {
    setOpenPhases(s => {
      const n = new Set(s)
      if (n.has(phaseId)) n.delete(phaseId)
      else n.add(phaseId)
      return n
    })
  }

  const groupsByPhase = phases.reduce((acc, phase) => {
    acc[phase.id] = groups.filter(g => g.phase_id === phase.id)
    return acc
  }, {} as Record<string, TopicGroup[]>)

  const topicsByGroup = groups.reduce((acc, g) => {
    acc[g.id] = topics.filter(t => t.topic_group_id === g.id)
    return acc
  }, {} as Record<string, Topic[]>)

  return (
    <div>
      <div className="page-header">
        <Link href="/dashboard/subjects" className="flex items-center gap-2 text-sm text-muted" style={{ marginBottom: 12, textDecoration: 'none', width: 'fit-content' }}>
          <ArrowLeft size={14} /> All Subjects
        </Link>
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${subject.color}22`, border: `1px solid ${subject.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: subject.color ?? 'var(--accent)' }}>{subject.code}</span>
          </div>
          <div>
            <h1 className="page-title">{subject.title}</h1>
            <p className="page-subtitle text-sm">{doneCount} / {totalTopics} topics &bull; {pct}% complete</p>
          </div>
        </div>
        <div className="progress-track" style={{ height: 6, marginTop: 16 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: subject.color ?? 'var(--accent)' }} />
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {phases.map(phase => {
          const phaseGroups = groupsByPhase[phase.id] ?? []
          const allPhaseTopics = phaseGroups.flatMap(g => topicsByGroup[g.id] ?? [])
          const phaseDone = allPhaseTopics.filter(t => progressMap[t.id] === 'completed').length
          const isOpen = openPhases.has(phase.id)

          return (
            <div key={phase.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button onClick={() => togglePhase(phase.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ fontSize: 11, fontWeight: 800, color: subjectColor, background: `${subjectColor}18`, border: `1px solid ${subjectColor}33`, borderRadius: 6, padding: '2px 8px', letterSpacing: '0.05em' }}>
                    Phase {phase.code}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{phase.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{phaseDone}/{allPhaseTopics.length}</span>
                  {isOpen ? <ChevronDown size={15} color="var(--text-3)" /> : <ChevronRight size={15} color="var(--text-3)" />}
                </div>
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px 12px' }}>
                  {phaseGroups.map(group => {
                    const gTopics = topicsByGroup[group.id] ?? []
                    const gDone = gTopics.filter(t => progressMap[t.id] === 'completed').length
                    return (
                      <div key={group.id} style={{ marginBottom: 16 }}>
                        <div className="flex items-center justify-between" style={{ padding: '4px 8px', marginBottom: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{group.code} — {group.title}</div>
                          <div className="flex items-center gap-2">
                            <div className="progress-track" style={{ width: 60, height: 4 }}>
                              <div className="progress-fill" style={{ width: `${gTopics.length > 0 ? Math.round((gDone / gTopics.length) * 100) : 0}%`, background: subject.color ?? 'var(--accent)' }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{gDone}/{gTopics.length}</span>
                          </div>
                        </div>
                        {gTopics.map(topic => {
                          const status = progressMap[topic.id]
                          return (
                            <div key={topic.id} className="topic-item" onClick={() => loading !== topic.id && toggleTopic(topic.id, topic.xp_reward)}
                              style={{ opacity: loading === topic.id ? 0.6 : 1 }}>
                              <StatusIcon status={status} />
                              <span className={`topic-title${status === 'completed' ? ' done' : ''}`}>{topic.title}</span>
                              <span style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>+{topic.xp_reward}xp</span>
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
