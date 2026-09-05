'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProblemLog } from '@/lib/supabase/types'
import { Plus, ExternalLink, Trash2, X } from 'lucide-react'

interface Props {
  initialProblems: ProblemLog[]
  userId: string
}

const PLATFORMS = ['LeetCode', 'Codeforces', 'GFG', 'HackerRank', 'InterviewBit', 'Other']
const PATTERNS = ['Array', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Hashing', 'Linked List', 'Stack', 'Queue', 'Heap', 'Tree', 'Graph', 'BFS', 'DFS', 'DP', 'Backtracking', 'Greedy', 'Trie', 'Math', 'Other']

export default function ProblemsClient({ initialProblems, userId }: Props) {
  const [problems, setProblems] = useState<ProblemLog[]>(initialProblems)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [form, setForm] = useState({ title: '', platform: 'LeetCode', difficulty: 'medium', pattern: '', status: 'solved', time_taken_minutes: '', notes: '', url: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const filtered = filter === 'all' ? problems : problems.filter(p => p.difficulty === filter)
  const counts = { easy: problems.filter(p => p.difficulty === 'easy').length, medium: problems.filter(p => p.difficulty === 'medium').length, hard: problems.filter(p => p.difficulty === 'hard').length }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const { data } = await supabase.from('problem_log').insert({
      user_id: userId, title: form.title, platform: form.platform,
      difficulty: form.difficulty as 'easy' | 'medium' | 'hard',
      pattern: form.pattern || null, status: form.status as 'solved' | 'attempted' | 'revisit',
      time_taken_minutes: form.time_taken_minutes ? parseInt(form.time_taken_minutes) : null,
      notes: form.notes || null, url: form.url || null, solved_at: new Date().toISOString(),
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

  const diffColor = { easy: 'var(--green)', medium: 'var(--gold)', hard: 'var(--red)' }
  const statusColor = { solved: 'var(--green)', attempted: 'var(--gold)', revisit: 'var(--red)' }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Problem Log</h1>
            <p className="page-subtitle">{problems.length} problems tracked</p>
          </div>
          <button id="add-problem-btn" className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Log Problem
          </button>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent-2)' }}>{problems.length}</div><div className="stat-label">Total</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--green)' }}>{counts.easy}</div><div className="stat-label">Easy</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--gold)' }}>{counts.medium}</div><div className="stat-label">Medium</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--red)' }}>{counts.hard}</div><div className="stat-label">Hard</div></div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}
              style={{ textTransform: 'capitalize', minWidth: 64 }}>
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No problems yet. Log your first one!</div>}
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ padding: '14px 18px' }}>
              <div className="flex items-center gap-3">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{p.title}</span>
                    {p.url && <a href={p.url} target="_blank" rel="noreferrer"><ExternalLink size={12} color="var(--text-3)" /></a>}
                  </div>
                  <div className="flex items-center gap-2">
                    {p.difficulty && <span className="pill" style={{ background: `${diffColor[p.difficulty]}18`, color: diffColor[p.difficulty], border: `1px solid ${diffColor[p.difficulty]}33` }}>{p.difficulty}</span>}
                    {p.status && <span className="pill" style={{ background: `${statusColor[p.status]}18`, color: statusColor[p.status], border: `1px solid ${statusColor[p.status]}33` }}>{p.status}</span>}
                    {p.platform && <span className="pill pill-gray">{p.platform}</span>}
                    {p.pattern && <span className="pill pill-blue">{p.pattern}</span>}
                    {p.time_taken_minutes && <span className="text-xs text-faint">{p.time_taken_minutes}m</span>}
                  </div>
                  {p.notes && <div className="text-sm text-muted" style={{ marginTop: 6 }}>{p.notes}</div>}
                </div>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(p.id)} style={{ flexShrink: 0 }}>
                  <Trash2 size={14} color="var(--text-3)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: 17, fontWeight: 800 }}>Log a Problem</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label>Problem Title *</label><input id="prob-title" className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Two Sum" required /></div>
              <div className="grid-2">
                <div><label>Platform</label>
                  <select className="input" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} style={{ cursor: 'pointer' }}>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div><label>Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={{ cursor: 'pointer' }}>
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div><label>Status</label>
                  <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ cursor: 'pointer' }}>
                    <option value="solved">Solved</option><option value="attempted">Attempted</option><option value="revisit">Revisit</option>
                  </select>
                </div>
                <div><label>Pattern</label>
                  <select className="input" value={form.pattern} onChange={e => setForm(f => ({ ...f, pattern: e.target.value }))} style={{ cursor: 'pointer' }}>
                    <option value="">None</option>
                    {PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div><label>Time (minutes)</label><input className="input" type="number" min="1" value={form.time_taken_minutes} onChange={e => setForm(f => ({ ...f, time_taken_minutes: e.target.value }))} placeholder="30" /></div>
                <div><label>URL</label><input className="input" type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://leetcode.com/..." /></div>
              </div>
              <div><label>Notes</label><textarea className="input" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="What did you learn?" style={{ resize: 'vertical' }} /></div>
              <button id="save-problem-btn" className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Log Problem'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
