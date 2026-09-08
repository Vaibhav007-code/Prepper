import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SubjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: subjects }, { data: progress }, { data: topics }] = await Promise.all([
    supabase.from('subjects').select('*').order('order_index'),
    supabase.from('user_progress').select('topic_id, status').eq('user_id', user.id),
    supabase.from('topics').select('id, subject_id'),
  ])

  const topicSubjectMap: Record<string, string> = {}
  for (const t of (topics ?? [])) topicSubjectMap[t.id] = t.subject_id

  const completedBySubject: Record<string, number> = {}
  for (const p of (progress ?? [])) {
    if (p.status === 'completed') {
      const sid = topicSubjectMap[p.topic_id]
      if (sid) completedBySubject[sid] = (completedBySubject[sid] ?? 0) + 1
    }
  }

  const totalCompleted = Object.values(completedBySubject).reduce((a, b) => a + b, 0)
  const totalTopics    = (subjects ?? []).reduce((a, s) => a + s.total_topics, 0)
  const overallPct     = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subjects</h1>
        <p className="page-subtitle">Your complete Winter Arc curriculum.</p>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Summary row */}
        <div style={{
          display: 'flex', gap: 0,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, padding: '16px 20px', borderRight: '1px solid var(--border)' }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Subjects</div>
            <div className="display" style={{ fontSize: 24, fontWeight: 500, color: 'var(--text)' }}>
              {(subjects ?? []).length}
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px 20px', borderRight: '1px solid var(--border)' }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Total topics</div>
            <div className="display" style={{ fontSize: 24, fontWeight: 500, color: 'var(--text)' }}>
              {totalTopics}
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px 20px', borderRight: '1px solid var(--border)' }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Completed</div>
            <div className="display" style={{ fontSize: 24, fontWeight: 500, color: 'var(--success)' }}>
              {totalCompleted}
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px 20px' }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Overall</div>
            <div className="display" style={{ fontSize: 24, fontWeight: 500, color: 'var(--accent)' }}>
              {overallPct}%
            </div>
          </div>
        </div>

        {/* Ledger rows */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          background: 'var(--surface)',
        }}>
          {/* Header row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '10px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-elevated)',
          }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 56, flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Code</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', flex: 1, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Subject</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 96, flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Progress</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 56, textAlign: 'right', flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Topics</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 44, textAlign: 'right', flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pct</div>
          </div>

          {(subjects ?? []).map((s, idx) => {
            const done = completedBySubject[s.id] ?? 0
            const pct  = s.total_topics > 0 ? Math.round((done / s.total_topics) * 100) : 0
            const isComplete = pct === 100

            return (
              <Link
                key={s.id}
                href={`/dashboard/subjects/${s.id}`}
                className="subject-row"
                style={{ borderBottom: idx < (subjects ?? []).length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                {/* Code badge */}
                <div
                  className="mono"
                  style={{
                    fontSize: 11, letterSpacing: '0.04em',
                    color: 'var(--accent)',
                    border: '1px solid var(--border)',
                    padding: '3px 7px',
                    background: 'var(--surface-elevated)',
                    width: 56, flexShrink: 0, textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.code}
                </div>

                {/* Title + description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 500, color: 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {s.title}
                  </div>
                  {s.description && (
                    <div style={{
                      fontSize: 12, color: 'var(--text-faint)', marginTop: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {s.description}
                    </div>
                  )}
                </div>

                {/* Mini progress bar */}
                <div className="progress-track" style={{ width: 96, flexShrink: 0 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: isComplete ? 'var(--success)' : 'var(--accent)',
                    }}
                  />
                </div>

                {/* Topics count */}
                <div
                  className="mono"
                  style={{
                    fontSize: 12, color: 'var(--text-faint)',
                    width: 56, textAlign: 'right', flexShrink: 0,
                  }}
                >
                  {done}/{s.total_topics}
                </div>

                {/* Percentage */}
                <div
                  className="mono"
                  style={{
                    fontSize: 13, fontWeight: 500,
                    color: isComplete ? 'var(--success)' : 'var(--text-secondary)',
                    width: 44, textAlign: 'right', flexShrink: 0,
                  }}
                >
                  {pct}%
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
