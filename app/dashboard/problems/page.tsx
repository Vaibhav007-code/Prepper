import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProblemsClient from './ProblemsClient'

export default async function ProblemsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: problems } = await supabase.from('problem_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  return <ProblemsClient initialProblems={problems ?? []} userId={user.id} />
}
