import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SYLLABUS, getTotalTopics } from '@/lib/syllabus-data'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  // Only allow authenticated users to trigger seed
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Use service-role client to bypass RLS
    const admin = createAdminClient()

    // Check if already seeded
    const { data: existing, error: checkError } = await admin
      .from('subjects')
      .select('id')
      .limit(1)

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ seeded: false, message: 'Already seeded' })
    }

    // Seed all subjects, phases, groups, topics
    for (const subject of SYLLABUS) {
      const totalTopics = getTotalTopics(subject)

      const { data: subjectData, error: subjectError } = await admin
        .from('subjects')
        .insert({
          code: subject.code,
          title: subject.title,
          description: subject.description,
          icon: subject.icon,
          color: subject.color,
          order_index: subject.order_index,
          total_topics: totalTopics,
        })
        .select()
        .single()

      if (subjectError || !subjectData) {
        console.error('Subject seed error:', subjectError)
        continue
      }

      for (const phase of subject.phases) {
        const { data: phaseData, error: phaseError } = await admin
          .from('phases')
          .insert({
            subject_id: subjectData.id,
            code: phase.code,
            title: phase.title,
            order_index: phase.order_index,
          })
          .select()
          .single()

        if (phaseError || !phaseData) continue

        for (const group of phase.groups) {
          const { data: groupData, error: groupError } = await admin
            .from('topic_groups')
            .insert({
              phase_id: phaseData.id,
              subject_id: subjectData.id,
              code: group.code,
              title: group.title,
              order_index: group.order_index,
            })
            .select()
            .single()

          if (groupError || !groupData) continue

          const topicRows = group.topics.map((title, i) => ({
            topic_group_id: groupData.id,
            subject_id: subjectData.id,
            title,
            order_index: i + 1,
            xp_reward: 10,
          }))

          await admin.from('topics').insert(topicRows)
        }
      }
    }

    return NextResponse.json({ seeded: true, message: 'Curriculum seeded successfully' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
