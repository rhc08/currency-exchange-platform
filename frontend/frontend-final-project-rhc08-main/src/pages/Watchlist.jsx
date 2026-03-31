import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { addWatchlist, getWatchlist, deleteWatchlist } from '../services/watchlistService'

export default function Watchlist() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ direction: 'usd_to_lbp', threshold: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    setMsg('')
    try {
      const data = await getWatchlist()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      const status = err.response?.status
      if (status === 401) setError('Authentication required.')
      else if (status === 403) setError('Access forbidden.')
      else setError('Failed to load watchlist.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

const onAdd = async () => {
  setError('')
  setMsg('')

  const threshold = form.threshold === '' ? null : Number(form.threshold)

  const exists = items.some((item) => {
    const existingThreshold =
      item.threshold == null ? null : Number(item.threshold)

    return (
      item.direction === form.direction &&
      existingThreshold === threshold
    )
  })

  if (exists) {
    setError('This watchlist item already exists.')
    return
  }

  try {
    await addWatchlist(form.direction, threshold)
    setMsg('Added to watchlist.')
    setForm({ direction: 'usd_to_lbp', threshold: '' })
    load()
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to add.')
  }
}

  const onDelete = async (id) => {
    setError('')
    setMsg('')
    try {
      await deleteWatchlist(id)
      setMsg('Removed.')
      load()
    } catch {
      setError('Failed to remove.')
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Watchlist</h1>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          {loading ? <><span className="loading-spinner" /> Refreshing</> : '↻ Refresh'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}
      {msg && <div className="info-box">{msg}</div>}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-header">
          <div className="section-title">Add Watchlist Item</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div className="form-group">
            <label>Direction</label>
            <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
              <option value="usd_to_lbp">USD → LBP</option>
              <option value="lbp_to_usd">LBP → USD</option>
            </select>
          </div>

          <div className="form-group">
            <label>Threshold (optional)</label>
            <input value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
          </div>

          <button className="btn btn-primary" onClick={onAdd}>+ Add</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><span className="loading-spinner" /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="info-box">No watchlist items yet.</div>
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
                {items.map((w) => (
                  <tr key={w.id}>
                    <td className="mono">{w.id}</td>
                    <td>{w.direction}</td>
                    <td className="mono">{w.threshold == null ? '—' : Number(w.threshold).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => onDelete(w.id)}>Delete</button>
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