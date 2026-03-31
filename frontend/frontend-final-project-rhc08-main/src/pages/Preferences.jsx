import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getPreferences, updatePreferences } from '../services/preferencesService'

export default function Preferences() {
  const [prefs, setPrefs] = useState(null)
  const [form, setForm] = useState({ default_hours: 72, default_bucket: 'hour' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    setMsg('')
    try {
      const data = await getPreferences()
      setPrefs(data)
      setForm({
        default_hours: data?.default_hours ?? 72,
        default_bucket: data?.default_bucket ?? 'hour',
      })
    } catch (err) {
      const status = err.response?.status
      if (status === 401) setError('Authentication required.')
      else if (status === 403) setError('Access forbidden.')
      else setError('Failed to load preferences.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSave = async () => {
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const data = await updatePreferences(Number(form.default_hours), form.default_bucket)
      setPrefs(data)
      setMsg('Preferences saved.')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save preferences.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Preferences</h1>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          {loading ? <><span className="loading-spinner" /> Refreshing</> : '↻ Refresh'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}
      {msg && <div className="info-box">{msg}</div>}

      {loading ? (
        <div className="loading-wrap"><span className="loading-spinner" /> Loading…</div>
      ) : (
        <div className="card">
          <div className="section-header">
            <div className="section-title">Default Graph Settings</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div className="form-group">
              <label>Default Hours</label>
              <input
                value={form.default_hours}
                onChange={(e) => setForm({ ...form, default_hours: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Default Bucket</label>
              <select
                value={form.default_bucket}
                onChange={(e) => setForm({ ...form, default_bucket: e.target.value })}
              >
                <option value="hour">Hour</option>
                <option value="day">Day</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={onSave} disabled={saving}>
              {saving ? <><span className="loading-spinner" /> Saving…</> : 'Save'}
            </button>
          </div>

          {prefs && (
            <div style={{ marginTop: 14, color: 'var(--text3)', fontSize: 13 }}>
              Current: {prefs.default_hours} hours, bucket = {prefs.default_bucket}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}