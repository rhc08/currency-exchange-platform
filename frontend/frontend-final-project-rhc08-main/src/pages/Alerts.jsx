import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { createAlert, getAlerts, deleteAlert } from '../services/alertsService'

export default function Alerts() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ threshold: '', direction: 'above' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    setMsg('')
    try {
      const data = await getAlerts()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      const status = err.response?.status
      if (status === 401) setError('Authentication required.')
      else if (status === 403) setError('Access forbidden.')
      else setError('Failed to load alerts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async () => {
    setError('')
    setMsg('')
    if (!form.threshold) {
      setError('Threshold is required.')
      return
    }
    try {
      await createAlert(form.threshold, form.direction)
      setMsg('Alert created.')
      setForm({ threshold: '', direction: 'above' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create alert.')
    }
  }

  const onDelete = async (id) => {
    setError('')
    setMsg('')
    try {
      await deleteAlert(id)
      setMsg('Alert deleted.')
      load()
    } catch {
      setError('Failed to delete alert.')
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Rate Alerts</h1>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          {loading ? <><span className="loading-spinner" /> Refreshing</> : '↻ Refresh'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}
      {msg && <div className="info-box">{msg}</div>}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-header">
          <div className="section-title">Create Alert</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div className="form-group">
            <label>Threshold (USD→LBP)</label>
            <input value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Direction</label>
            <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={onCreate}>+ Create</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><span className="loading-spinner" /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="info-box">No alerts yet.</div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Direction</th>
                  <th>Threshold</th>
                  <th style={{ width: 140 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td className="mono">{a.id}</td>
                    <td>{a.direction}</td>
                    <td className="mono">{Number(a.threshold).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => onDelete(a.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}