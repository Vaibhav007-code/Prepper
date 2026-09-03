import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SubjectClient from './SubjectClient'

export default async function SubjectPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [
    { data: subject },
    { data: phases },
    { data: groups },
    { data: topics },
    { data: progress },
  ] = await Promise.all([
    supabase.from('subjects').select('*').eq('id', subjectId).single(),
    supabase.from('phases').select('*').eq('subject_id', subjectId).order('order_index'),
    supabase.from('topic_groups').select('*').eq('subject_id', subjectId).order('order_index'),
    supabase.from('topics').select('*').eq('subject_id', subjectId).order('order_index'),
    supabase.from('user_progress').select('*').eq('user_id', user.id),
  ])

  if (!subject) notFound()

  const progressMap: Record<string, string> = {}
  for (const p of (progress ?? [])) progressMap[p.topic_id] = p.status

  return (
    <SubjectClient
      subject={subject}
      phases={phases ?? []}
      groups={groups ?? []}
      topics={topics ?? []}
      progressMap={progressMap}
      userId={user.id}
    />
  )
}
