import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Flame } from 'lucide-react'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profiles } = await supabase.from('profiles')
    .select('id, full_name, total_xp, current_streak, longest_streak, level')
    .order('current_streak', { ascending: false })
    .limit(20)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Streak Board</h1>
        <p className="page-subtitle">Who&apos;s keeping the streak alive?</p>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(profiles ?? []).map((p, i) => {
            const isMe = p.id === user.id
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div key={p.id} className="card" style={{ padding: '14px 18px', border: isMe ? '1px solid rgba(99,102,241,0.4)' : undefined, background: isMe ? 'rgba(99,102,241,0.05)' : undefined }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 28, fontSize: 16, textAlign: 'center', flexShrink: 0 }}>
                    {i < 3 ? medals[i] : <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 700 }}>#{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isMe ? 'var(--accent-2)' : 'var(--text)' }}>
                      {p.full_name ?? 'Anonymous'} {isMe && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>(you)</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Level {p.level} &bull; {p.total_xp} XP</div>
                  </div>
                  <div className="streak-badge">
                    <Flame size={12} /> {p.current_streak}d
                  </div>
                </div>
              </div>
            )
          })}
          {(profiles ?? []).length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
              No users yet. Be the first on the board!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
