import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subjects</h1>
        <p className="page-subtitle">Your complete Winter Arc curriculum.</p>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(subjects ?? []).map((s) => {
            const done = completedBySubject[s.id] ?? 0
            const pct = s.total_topics > 0 ? Math.round((done / s.total_topics) * 100) : 0
            return (
              <Link key={s.id} href={`/dashboard/subjects/${s.id}`} className="subject-card" style={{ '--c': s.color, padding: '16px 20px' } as React.CSSProperties}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}22`, border: `1px solid ${s.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: s.color ?? 'var(--accent)' }}>{s.code}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{s.title}</span>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? 'var(--green)' : s.color ?? 'var(--accent)' }}>{pct}%</span>
                        <ChevronRight size={14} color="var(--text-3)" />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>
                    <div className="progress-track" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: s.color ?? 'var(--accent)' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{done} / {s.total_topics} topics</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
