import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from '../services/notificationService'

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getNotifications()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      const status = err.response?.status
      if (status === 401) setError('Authentication required.')
      else if (status === 403) setError('Access forbidden.')
      else setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      load()
    } catch {
      setError('Failed to mark as read.')
    }
  }

  const onDelete = async (id) => {
    try {
      await deleteNotification(id)
      load()
    } catch {
      setError('Failed to delete notification.')
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Notifications</h1>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          {loading ? <><span className="loading-spinner" /> Refreshing</> : '↻ Refresh'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><span className="loading-spinner" /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="info-box">No notifications yet.</div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Time</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <span className={`tag ${n.is_read ? 'tag-completed' : 'tag-open'}`}>
                        {n.is_read ? 'Read' : 'New'}
                      </span>
                    </td>
                    <td className="mono">{n.title || '-'}</td>
                    <td style={{ color: 'var(--text2)' }}>{n.message || '-'}</td>
                    <td style={{ color: 'var(--text3)' }}>
                      {n.created_at ? new Date(n.created_at).toLocaleString() : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {!n.is_read && (
                          <button className="btn btn-secondary" onClick={() => onMarkRead(n.id)}>
                            Mark read
                          </button>
                        )}
                        <button className="btn btn-danger" onClick={() => onDelete(n.id)}>
                          Delete
                        </button>
                      </div>
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