'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode]         = useState<'login' | 'signup'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [message, setMessage]   = useState('')
  const supabase = createClient()
  const router   = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setMessage('')

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      })
      if (err) setError(err.message)
      else setMessage('Check your email to confirm your account.')
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) setError(err.message)
      else router.push('/dashboard')
    }

    setLoading(false)
  }

  function switchMode() {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError(''); setMessage('')
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">

        {/* Cover title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="eyebrow" style={{ marginBottom: 12, letterSpacing: '0.1em' }}>
            Winter Arc · 2025
          </div>
          <h1
            className="display"
            style={{
              fontSize: 40, fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              fontOpticalSizing: 'auto',
              lineHeight: 1,
            }}
          >
            Prepper
          </h1>
          <div
            style={{
              height: 1, background: 'var(--border)',
              margin: '18px auto 0', width: 40,
            }}
          />
          <p
            style={{
              fontSize: 13, color: 'var(--text-secondary)',
              marginTop: 16, fontStyle: 'italic',
              fontFamily: 'var(--display)',
              fontOpticalSizing: 'auto',
            }}
          >
            {mode === 'login' ? 'Continue the log.' : 'Open a new volume.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                className="input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: 13, color: 'var(--danger)',
                padding: '8px 12px',
                border: '1px solid var(--danger)',
                background: 'rgba(184,76,76,0.06)',
              }}
            >
              {error}
            </p>
          )}
          {message && (
            <p
              style={{
                fontSize: 13, color: 'var(--success)',
                padding: '8px 12px',
                border: '1px solid var(--success)',
                background: 'rgba(107,143,113,0.06)',
              }}
            >
              {message}
            </p>
          )}

          <button
            id="auth-submit"
            className="btn btn-primary w-full"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, height: 44, fontSize: 14 }}
          >
            {loading
              ? 'Working…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'
            }
          </button>
        </form>

        {/* Switch mode */}
        <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={switchMode}
            style={{
              color: 'var(--accent)', fontWeight: 500,
              background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'var(--font)',
              fontSize: 13,
              textDecoration: 'underline',
              textDecorationColor: 'var(--accent-deep)',
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
