import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [
    { data: profile },
    { data: subjects },
    { data: progressRows },
    { data: sessions },
    { data: topicCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subjects').select('id, title, color, icon, order_index, total_topics').order('order_index'),
    supabase.from('user_progress').select('topic_id, status').eq('user_id', user.id),
    supabase.from('daily_sessions').select('session_date, xp_earned, topics_completed').eq('user_id', user.id).order('session_date', { ascending: false }).limit(90),
    supabase.from('topics').select('id, subject_id'),
  ])

  // Compute per-subject completion
  const completedBySubject: Record<string, number> = {}
  for (const p of (progressRows ?? [])) {
    if (p.status === 'completed') {
      // we need topic→subject mapping
    }
  }

  const topicSubjectMap: Record<string, string> = {}
  for (const t of (topicCount ?? [])) topicSubjectMap[t.id] = t.subject_id
  for (const p of (progressRows ?? [])) {
    if (p.status === 'completed') {
      const sid = topicSubjectMap[p.topic_id]
      if (sid) completedBySubject[sid] = (completedBySubject[sid] ?? 0) + 1
    }
  }

  return (
    <DashboardClient
      profile={profile}
      subjects={subjects ?? []}
      completedBySubject={completedBySubject}
      sessions={sessions ?? []}
      totalCompleted={Object.values(completedBySubject).reduce((a, b) => a + b, 0)}
    />
  )
}
