import { createClient } from './supabase/client'
import { SYLLABUS, getTotalTopics } from './syllabus-data'

export async function seedCurriculum(): Promise<{ seeded: boolean; message: string } | { error: string }> {
  const supabase = createClient()

  // Check if already seeded — also catches schema-not-found
  const { data: existing, error: checkError } = await supabase.from('subjects').select('id').limit(1)
  if (checkError) {
    // PGRST205 = table not in schema cache (schema not applied yet)
    return { error: checkError.message }
  }
  if (existing && existing.length > 0) return { seeded: false, message: 'Already seeded' }

  for (const subject of SYLLABUS) {
    const totalTopics = getTotalTopics(subject)

    // Insert subject
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .insert({ code: subject.code, title: subject.title, description: subject.description, icon: subject.icon, color: subject.color, order_index: subject.order_index, total_topics: totalTopics })
      .select()
      .single()

    if (subjectError || !subjectData) {
      console.error('Subject seed error:', subjectError)
      if (subjectError?.code === 'PGRST205') return { error: subjectError.message }
      continue
    }

    for (const phase of subject.phases) {
      const { data: phaseData, error: phaseError } = await supabase
        .from('phases')
        .insert({ subject_id: subjectData.id, code: phase.code, title: phase.title, order_index: phase.order_index })
        .select()
        .single()

      if (phaseError || !phaseData) continue

      for (const group of phase.groups) {
        const { data: groupData, error: groupError } = await supabase
          .from('topic_groups')
          .insert({ phase_id: phaseData.id, subject_id: subjectData.id, code: group.code, title: group.title, order_index: group.order_index })
          .select()
          .single()

        if (groupError || !groupData) continue

        for (let i = 0; i < group.topics.length; i++) {
          await supabase.from('topics').insert({
            topic_group_id: groupData.id,
            subject_id: subjectData.id,
            title: group.topics[i],
            order_index: i + 1,
            xp_reward: 10,
          })
        }
      }
    }
  }

  return { seeded: true, message: 'Curriculum seeded successfully' }
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function getXPForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100
}

export function getXPProgress(xp: number): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
  const level = getLevelFromXP(xp)
  const prevLevelXP = Math.pow(level - 1, 2) * 100
  const nextLevelXP = Math.pow(level, 2) * 100
  const currentXP = xp - prevLevelXP
  const progress = Math.round((currentXP / (nextLevelXP - prevLevelXP)) * 100)
  return { level, currentXP, nextLevelXP: nextLevelXP - prevLevelXP, progress }
}
