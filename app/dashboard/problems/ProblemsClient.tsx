'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProblemLog } from '@/lib/supabase/types'

interface Props {
  initialProblems: ProblemLog[]
  userId: string
}

const PLATFORMS = ['LeetCode', 'Codeforces', 'GFG', 'HackerRank', 'InterviewBit', 'Other']
const PATTERNS  = ['Array', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Hashing', 'Linked List', 'Stack', 'Queue', 'Heap', 'Tree', 'Graph', 'BFS', 'DFS', 'DP', 'Backtracking', 'Greedy', 'Trie', 'Math', 'Other']

export default function ProblemsClient({ initialProblems, userId }: Props) {
  const [problems, setProblems] = useState<ProblemLog[]>(initialProblems)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]     = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [form, setForm]         = useState({
    title: '', platform: 'LeetCode', difficulty: 'medium',
    pattern: '', status: 'solved', time_taken_minutes: '', notes: '', url: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const filtered = filter === 'all' ? problems : problems.filter(p => p.difficulty === filter)
  const counts   = {
    easy:   problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard:   problems.filter(p => p.difficulty === 'hard').length,
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data } = await supabase.from('problem_log').insert({
      user_id: userId, title: form.title, platform: form.platform,
      difficulty: form.difficulty as 'easy' | 'medium' | 'hard',
      pattern: form.pattern || null, status: form.status as 'solved' | 'attempted' | 'revisit',
      time_taken_minutes: form.time_taken_minutes ? parseInt(form.time_taken_minutes) : null,
      notes: form.notes || null, url: form.url || null,
      solved_at: new Date().toISOString(),
    }).select().single()
    if (data) setProblems(p => [data, ...p])
    setShowForm(false)
    setForm({ title: '', platform: 'LeetCode', difficulty: 'medium', pattern: '', status: 'solved', time_taken_minutes: '', notes: '', url: '' })
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('problem_log').delete().eq('id', id)
    setProblems(p => p.filter(x => x.id !== id))
  }

  const diffColor   = { easy: 'var(--success)', medium: 'var(--text-secondary)', hard: 'var(--danger)' }
  const statusColor = { solved: 'var(--success)', attempted: 'var(--text-secondary)', revisit: 'var(--signal)' }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title">Problem log</h1>
            <p className="page-subtitle mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-faint)', marginTop: 6 }}>
              {problems.length} problems tracked
            </p>
          </div>
          <button id="add-problem-btn" className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            Log problem
          </button>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Stats ledger ───────────────────────────── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Total</div>
            <div className="stat-value">{problems.length}</div>
            <div className="stat-label">Problems logged</div>
          </div>
          <div className="stat-card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Easy</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{counts.easy}</div>
            <div className="stat-label">Solved</div>
          </div>
          <div className="stat-card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Medium</div>
            <div className="stat-value">{counts.medium}</div>
            <div className="stat-label">Solved</div>
          </div>
          <div className="stat-card">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Hard</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{counts.hard}</div>
            <div className="stat-label">Solved</div>
          </div>
        </div>

        {/* ── Filter buttons ─────────────────────────── */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-active' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}
              style={{ textTransform: 'capitalize', minWidth: 60, fontFamily: 'var(--mono)', letterSpacing: '0.03em', fontSize: 12 }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Problem list ───────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-faint)' }}>
              <div className="mono" style={{ fontSize: 12, marginBottom: 8 }}>No entries</div>
              <div style={{ fontSize: 14 }}>Log your first problem to start the record.</div>
            </div>
          )}

          {/* List header */}
          {filtered.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '8px 18px', gap: 12,
              borderBottom: '1px solid var(--border)',
            }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', flex: 1, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Problem</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 60, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Platform</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 56, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Diff</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 64, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Status</div>
              <div style={{ width: 64, flexShrink: 0 }} />
            </div>
          )}

          {filtered.map(p => (
            <div
              key={p.id}
              className="card"
              style={{ padding: '13px 18px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                      {p.title}
                    </span>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mono"
                        style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.03em' }}
                      >
                        ↗
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {p.difficulty && (
                      <span
                        className="pill"
                        style={{
                          color: diffColor[p.difficulty],
                          borderColor: diffColor[p.difficulty],
                        }}
                      >
                        {p.difficulty}
                      </span>
                    )}
                    {p.status && (
                      <span
                        className="pill"
                        style={{
                          color: statusColor[p.status],
                          borderColor: statusColor[p.status],
                        }}
                      >
                        {p.status}
                      </span>
                    )}
                    {p.platform && <span className="pill pill-gray">{p.platform}</span>}
                    {p.pattern  && <span className="pill pill-gray">{p.pattern}</span>}
                    {p.time_taken_minutes && (
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                        {p.time_taken_minutes}m
                      </span>
                    )}
                  </div>

                  {p.notes && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                      {p.notes}
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(p.id)}
                  style={{ flexShrink: 0, fontSize: 12, color: 'var(--text-faint)' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Log problem modal ──────────────────────────── */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(11,10,8,0.85)',
            zIndex: 100, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%', maxWidth: 480,
              maxHeight: '90vh', overflowY: 'auto',
              background: 'var(--surface-elevated)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="display" style={{ fontSize: 19, fontWeight: 500 }}>
                Log a problem
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
                Close
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label>Problem title *</label>
                <input
                  id="prob-title"
                  className="input"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Two Sum"
                  required
                />
              </div>

              <div className="grid-2">
                <div>
                  <label>Platform</label>
                  <select
                    className="input"
                    value={form.platform}
                    onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label>Difficulty</label>
                  <select
                    className="input"
                    value={form.difficulty}
                    onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label>Status</label>
                  <select
                    className="input"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="solved">Solved</option>
                    <option value="attempted">Attempted</option>
                    <option value="revisit">Revisit</option>
                  </select>
                </div>
                <div>
                  <label>Pattern</label>
                  <select
                    className="input"
                    value={form.pattern}
                    onChange={e => setForm(f => ({ ...f, pattern: e.target.value }))}
                  >
                    <option value="">None</option>
                    {PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label>Time (minutes)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={form.time_taken_minutes}
                    onChange={e => setForm(f => ({ ...f, time_taken_minutes: e.target.value }))}
                    placeholder="30"
                  />
                </div>
                <div>
                  <label>URL</label>
                  <input
                    className="input"
                    type="url"
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://leetcode.com/..."
                  />
                </div>
              </div>

              <div>
                <label>Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="What did you learn?"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                id="save-problem-btn"
                className="btn btn-primary"
                type="submit"
                disabled={saving}
                style={{ marginTop: 4 }}
              >
                {saving ? 'Saving…' : 'Log problem'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
