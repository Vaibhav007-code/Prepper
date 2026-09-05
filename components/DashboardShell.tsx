'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { getXPProgress } from '@/lib/seed'
import { BarChart2, Flame, Trophy, Menu, LogOut, BookOpen, ClipboardList } from 'lucide-react'

const NAV_TOP = [
  { href: '/dashboard', label: 'Dashboard', Icon: BarChart2 },
  { href: '/dashboard/subjects', label: 'Subjects', Icon: BookOpen },
  { href: '/dashboard/problems', label: 'Problem Log', Icon: ClipboardList },
  { href: '/dashboard/leaderboard', label: 'Streak Board', Icon: Trophy },
]

interface Props { children: React.ReactNode; profile: Profile | null; user: User }

export default function DashboardShell({ children, profile, user }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const xpData = getXPProgress(profile?.total_xp ?? 0)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }} />}

      {/* Sidebar */}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Brand */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>Prepper</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Winter Arc</div>
            </div>
          </Link>
        </div>

        {/* Profile */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {(profile?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name ?? user.email?.split('@')[0]}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Level {xpData.level}</div>
            </div>
            <div className="level-badge" style={{ marginLeft: 'auto' }}>{xpData.level}</div>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpData.progress}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{xpData.currentXP} / {xpData.nextLevelXP} XP</span>
            {(profile?.current_streak ?? 0) > 0 && (
              <div className="streak-badge" style={{ padding: '1px 8px', fontSize: 11 }}>
                <Flame size={10} /> {profile?.current_streak}d
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          <div className="section-title" style={{ marginBottom: 4 }}>Menu</div>
          {NAV_TOP.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={`nav-item${pathname === href ? ' active' : ''}`} onClick={() => setOpen(false)}>
              <div className="nav-dot" />
              <Icon size={15} strokeWidth={2} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button id="sign-out-btn" className="nav-item" onClick={handleSignOut} style={{ color: 'var(--text-3)' }}>
            <LogOut size={15} strokeWidth={2} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Mobile topbar */}
        <div style={{ display: 'none', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)', position: 'sticky', top: 0, zIndex: 30, alignItems: 'center', justifyContent: 'space-between' }} className="mobile-topbar">
          <button id="mobile-menu-btn" className="btn btn-ghost btn-icon" onClick={() => setOpen(true)}><Menu size={18} /></button>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Prepper</span>
          <div className="streak-badge" style={{ fontSize: 11 }}><Flame size={10} />{profile?.current_streak ?? 0}</div>
        </div>
        <style>{`.mobile-topbar { display: none; } @media (max-width: 768px) { .mobile-topbar { display: flex !important; } }`}</style>
        {children}
      </div>
    </div>
  )
}
