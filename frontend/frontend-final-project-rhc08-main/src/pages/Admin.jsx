import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import {
  getAdminReports,
  listUsers,
  updateUserStatus,
  getAdminAuditLogs,
  getRateQuality,
  triggerBackup,
  backupStatus,
  restoreBackup
} from '../services/adminService'

export default function Admin() {
  const [tab, setTab] = useState('reports') // reports | users | audit | quality | backup
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const [reports, setReports] = useState(null)
  const [users, setUsers] = useState([])
  const [audit, setAudit] = useState([])
  const [quality, setQuality] = useState(null)
  const [backupInfo, setBackupInfo] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    setMsg('')

    try {
      if (tab === 'reports') {
        const data = await getAdminReports()
        setReports(data)
      } else if (tab === 'users') {
        const data = await listUsers()
        setUsers(Array.isArray(data) ? data : [])
      } else if (tab === 'audit') {
        const data = await getAdminAuditLogs()
        setAudit(Array.isArray(data) ? data : [])
      } else if (tab === 'quality') {
        const data = await getRateQuality(100)
        setQuality(data)
      } else if (tab === 'backup') {
        try {
          const data = await backupStatus()
          setBackupInfo(data)
        } catch (e) {
          // could be 404 "No backup file found" — we show it nicely
          setBackupInfo(e.response?.data || { status: 'No backup file found' })
        }
      }
    } catch (err) {
      const status = err.response?.status
      if (status === 401) setError('Authentication required.')
      else if (status === 403) setError('Access forbidden (Admin only).')
      else setError('Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [tab])

  const onChangeStatus = async (id, status) => {
    setError('')
    setMsg('')
    try {
      await updateUserStatus(id, status)
      setMsg('User status updated.')
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status.')
    }
  }

  const onBackup = async () => {
    setError('')
    setMsg('')
    try {
      const res = await triggerBackup()
      setMsg(res.message || 'Backup completed.')
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Backup failed.')
    }
  }

  const onRestore = async () => {
    setError('')
    setMsg('')
    try {
      const res = await restoreBackup()
      setMsg(res.message || 'Restore completed.')
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Restore failed.')
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Admin Panel</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn ${tab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('reports')}>Reports</button>
          <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('users')}>Users</button>
          <button className={`btn ${tab === 'audit' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('audit')}>Audit</button>
          <button className={`btn ${tab === 'quality' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('quality')}>Rate Quality</button>
          <button className={`btn ${tab === 'backup' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('backup')}>Backup</button>

          <button className="btn btn-secondary" onClick={load} disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Refreshing</> : '↻ Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {msg && <div className="success-box">✓ {msg}</div>}

      {loading ? (
        <div className="loading-wrap"><span className="loading-spinner" /> Loading…</div>
      ) : (
        <>
          {/* REPORTS */}
          {tab === 'reports' && (
            <div className="card">
              <div className="section-header">
                <div className="section-title">System Reports</div>
              </div>
              {!reports ? (
                <div style={{ color: 'var(--text3)' }}>No data.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="stat-card">
                    <div className="stat-label">Total Transactions</div>
                    <div className="stat-value" style={{ fontSize: 22 }}>
                      {reports.total_transaction_volume?.transaction_count ?? '—'}
                    </div>
                    <div className="stat-sub">
                      USD: {reports.total_transaction_volume?.total_usd_amount ?? '—'} ·
                      LBP: {reports.total_transaction_volume?.total_lbp_amount ?? '—'}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">Marketplace</div>
                    <div className="stat-sub">
                      Total: {reports.marketplace_statistics?.total_offers ?? '—'} ·
                      Open: {reports.marketplace_statistics?.open_offers ?? '—'} ·
                      Completed: {reports.marketplace_statistics?.completed_offers ?? '—'} ·
                      Cancelled: {reports.marketplace_statistics?.cancelled_offers ?? '—'}
                    </div>
                  </div>

                  <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="section-header">
                      <div className="section-title">Most Active Users</div>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Transactions</th>
                            <th>Offers</th>
                            <th>Activity Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(reports.most_active_users || []).map((u) => (
                            <tr key={u.user_id}>
                              <td>{u.user_name} <span className="mono" style={{ color: 'var(--text3)' }}>#{u.user_id}</span></td>
                              <td className="mono">{u.transactions}</td>
                              <td className="mono">{u.offers}</td>
                              <td className="mono">{u.activity_score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="card">
              <div className="section-header">
                <div className="section-title">Users</div>
              </div>

              {users.length === 0 ? (
                <div style={{ color: 'var(--text3)' }}>No users.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th style={{ width: 260 }}>Change Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="mono">{u.id}</td>
                          <td>{u.user_name}</td>
                          <td><span className="tag tag-open">{u.role}</span></td>
                          <td><span className="tag tag-completed">{u.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button className="btn btn-secondary" onClick={() => onChangeStatus(u.id, 'ACTIVE')}>ACTIVE</button>
                              <button className="btn btn-secondary" onClick={() => onChangeStatus(u.id, 'SUSPENDED')}>SUSPEND</button>
                              <button className="btn btn-danger" onClick={() => onChangeStatus(u.id, 'BANNED')}>BAN</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* AUDIT */}
          {tab === 'audit' && (
            <div className="card">
              <div className="section-header">
                <div className="section-title">Audit Logs</div>
              </div>

              {audit.length === 0 ? (
                <div style={{ color: 'var(--text3)' }}>No audit logs.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>User</th>
                        <th>Event</th>
                        <th>Action</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit.slice(0, 200).map((x) => (
                        <tr key={x.id}>
                          <td style={{ color: 'var(--text3)' }}>{x.created_at ? new Date(x.created_at).toLocaleString() : '—'}</td>
                          <td className="mono">{x.user_id ?? '—'}</td>
                          <td>{x.event_type}</td>
                          <td>{x.action}</td>
                          <td style={{ color: 'var(--text3)' }}>{x.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RATE QUALITY */}
          {tab === 'quality' && (
            <div className="card">
              <div className="section-header">
                <div className="section-title">Rate Quality</div>
              </div>

              {!quality ? (
                <div style={{ color: 'var(--text3)' }}>No data.</div>
              ) : (
                <>
                  <div className="info-box" style={{ marginBottom: 12 }}>
                    Records: {quality.total_records_returned} · Outliers: {quality.outliers_returned}
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Direction</th>
                          <th>Rate</th>
                          <th>Outlier</th>
                          <th>% Change</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(quality.records || []).map((r) => (
                          <tr key={r.id}>
                            <td style={{ color: 'var(--text3)' }}>{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                            <td>{r.direction}</td>
                            <td className="mono">{r.rate == null ? '—' : Number(r.rate).toLocaleString()}</td>
                            <td>{r.is_outlier ? 'YES' : 'NO'}</td>
                            <td className="mono">{r.pct_change == null ? '—' : `${Number(r.pct_change).toFixed(2)}%`}</td>
                            <td style={{ color: 'var(--text3)' }}>{r.reason || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* BACKUP */}
          {tab === 'backup' && (
            <div className="card" style={{ maxWidth: 720 }}>
              <div className="section-header">
                <div className="section-title">Backup & Restore</div>
              </div>

              {backupInfo && (
                <div className="info-box" style={{ marginBottom: 12 }}>
                  {backupInfo.status}
                  {backupInfo.last_modified ? ` · Last modified: ${backupInfo.last_modified}` : ''}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={onBackup}>Run Backup</button>
                <button className="btn btn-danger" onClick={onRestore}>Restore Backup</button>
              </div>

              <div style={{ marginTop: 12, color: 'var(--text3)', fontSize: 12, lineHeight: 1.8 }}>
                Backup uses backend file: <span className="mono">backup_data.json</span>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}