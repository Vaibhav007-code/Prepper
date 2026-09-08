'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { getXPProgress } from '@/lib/seed'

const NAV_TOP = [
  { href: '/dashboard',            label: 'Dashboard' },
  { href: '/dashboard/subjects',   label: 'Subjects' },
  { href: '/dashboard/problems',   label: 'Problem Log' },
  { href: '/dashboard/leaderboard',label: 'Streak Board' },
]

interface Props { children: React.ReactNode; profile: Profile | null; user: User }

export default function DashboardShell({ children, profile, user }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const xpData   = getXPProgress(profile?.total_xp ?? 0)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const initials = (profile?.full_name ?? user.email ?? 'U')[0].toUpperCase()
  const name     = profile?.full_name ?? user.email?.split('@')[0] ?? 'User'

  return (
    <div className="app-shell">
      {/* Overlay backdrop for mobile sidebar */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(11,10,8,0.78)',
            zIndex: 40,
            backdropFilter: 'blur(1px)',
          }}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className={`sidebar${open ? ' open' : ''}`}>

        {/* Brand */}
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid var(--border)' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div
              className="display"
              style={{ fontSize: 19, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.01em' }}
            >
              Prepper
            </div>
            <div className="eyebrow" style={{ marginTop: 5, letterSpacing: '0.06em' }}>
              Winter Arc
            </div>
          </Link>
        </div>

        {/* Profile + XP */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            {/* Avatar initial */}
            <div style={{
              width: 30, height: 30,
              border: '1px solid var(--border-strong)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500,
              color: 'var(--accent)', flexShrink: 0,
              background: 'var(--surface-elevated)',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 500, color: 'var(--text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {name}
              </div>
              <div
                className="mono"
                style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1, letterSpacing: '0.03em' }}
              >
                Level {xpData.level}
              </div>
            </div>
            {/* Grade seal */}
            <div className="grade-seal" style={{ fontSize: 15, minWidth: 30, height: 30 }}>
              {xpData.level}
            </div>
          </div>

          {/* XP bar */}
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpData.progress}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {xpData.currentXP.toLocaleString()} / {xpData.nextLevelXP.toLocaleString()} xp
            </span>
            {(profile?.current_streak ?? 0) > 0 && (
              <div className="streak-badge" style={{ padding: '1px 7px', fontSize: 11 }}>
                {profile?.current_streak}d
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '14px 8px', flex: 1 }}>
          <div className="section-title" style={{ marginBottom: 6 }}>Index</div>
          {NAV_TOP.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item${pathname === href ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <div className="nav-dot" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
          <button
            id="sign-out-btn"
            className="nav-item"
            onClick={handleSignOut}
            style={{ color: 'var(--text-faint)' }}
          >
            <div className="nav-dot" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────── */}
      <div className="main-content">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button
            id="mobile-menu-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => setOpen(true)}
          >
            ☰ Menu
          </button>
          <span className="display" style={{ fontSize: 15, fontWeight: 500 }}>
            Prepper
          </span>
          {(profile?.current_streak ?? 0) > 0 && (
            <div className="streak-badge" style={{ fontSize: 11, padding: '2px 8px' }}>
              {profile?.current_streak}d
            </div>
          )}
          {(profile?.current_streak ?? 0) === 0 && (
            <span style={{ width: 40 }} />
          )}
        </div>

        <div key={pathname} className="view-enter">
          {children}
        </div>
      </div>
    </div>
  )
}
