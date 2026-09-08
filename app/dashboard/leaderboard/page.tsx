import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, total_xp, current_streak, longest_streak, level')
    .order('current_streak', { ascending: false })
    .limit(20)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Streak board</h1>
        <p className="page-subtitle">Who is keeping the streak alive?</p>
      </div>

      <div className="page-body">
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            background: 'var(--surface)',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '10px 20px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-elevated)',
            }}
          >
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 32, flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>#</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', flex: 1, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Name</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 80, textAlign: 'right', flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Level</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 80, textAlign: 'right', flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>XP</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--signal)', width: 64, textAlign: 'right', flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Streak</div>
          </div>

          {/* Rows */}
          {(profiles ?? []).length === 0 && (
            <div
              style={{
                textAlign: 'center', padding: 56,
                color: 'var(--text-faint)', fontSize: 14,
              }}
            >
              No users yet — be the first on the board.
            </div>
          )}

          {(profiles ?? []).map((p, i) => {
            const isMe       = p.id === user.id
            const isTop3     = i < 3
            const rankColor  = isTop3 ? 'var(--accent)' : 'var(--text-faint)'

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px',
                  borderBottom: i < (profiles ?? []).length - 1 ? '1px solid var(--border)' : 'none',
                  background: isMe ? 'rgba(201,165,78,0.04)' : 'transparent',
                  borderLeft: isMe ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'background var(--dur-micro)',
                }}
              >
                {/* Rank */}
                <div
                  className="mono"
                  style={{
                    width: 32, fontSize: 13, textAlign: 'right',
                    flexShrink: 0, color: rankColor, fontWeight: isTop3 ? 500 : 400,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14, fontWeight: 500,
                      color: isMe ? 'var(--accent)' : 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {p.full_name ?? 'Anonymous'}
                    {isMe && (
                      <span
                        className="mono"
                        style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 8 }}
                      >
                        you
                      </span>
                    )}
                  </div>
                </div>

                {/* Level */}
                <div
                  className="mono"
                  style={{
                    width: 80, textAlign: 'right', fontSize: 12,
                    color: 'var(--text-secondary)', flexShrink: 0,
                  }}
                >
                  Lv {p.level}
                </div>

                {/* XP */}
                <div
                  className="mono"
                  style={{
                    width: 80, textAlign: 'right', fontSize: 12,
                    color: 'var(--text-faint)', flexShrink: 0,
                  }}
                >
                  {(p.total_xp ?? 0).toLocaleString()}
                </div>

                {/* Streak */}
                <div style={{ width: 64, textAlign: 'right', flexShrink: 0 }}>
                  <div className="streak-badge" style={{ justifyContent: 'flex-end', display: 'inline-flex' }}>
                    {p.current_streak}d
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
