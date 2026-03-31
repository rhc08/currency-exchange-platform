import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { getTransactions } from '../services/transactionService'

const BASE = '/rayane-chams-bacha'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getTransactions()
      setTransactions(Array.isArray(data) ? data : [])
    } catch (err) {
      const status = err.response?.status
      const backendMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message

      if (status === 400) {
        setError(backendMessage || 'Invalid request while loading transactions.')
      } else if (status === 401) {
        setError('Authentication required. Please log in again.')
      } else if (status === 403) {
        setError('Access forbidden. You are not allowed to view these transactions.')
      } else if (status === 404) {
        setError('Transactions endpoint not found.')
      } else if (status === 429) {
        setError('Too many requests. Please wait and try again.')
      } else {
        setError('Failed to load transactions.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const clearError = () => setError('')

  const filtered =
    filter === 'all'
      ? transactions
      : filter === 'usd_to_lbp'
      ? transactions.filter((t) => t.usd_to_lbp)
      : transactions.filter((t) => !t.usd_to_lbp)

  return (
    <Layout>
      <div className="section-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          My Transactions
        </h1>
        <Link to={`${BASE}/transactions/new`} className="btn btn-primary">
          + New Transaction
        </Link>
      </div>

      {error && (
        <div className="error-box">
          <div style={{ marginBottom: '10px' }}>{error}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={fetchTransactions}>
              Retry
            </button>
            <button className="btn btn-secondary" onClick={clearError}>
              Clear Error
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'usd_to_lbp', 'lbp_to_usd'].map((f) => (
          <button
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 16px', fontSize: '12px' }}
            onClick={() => setFilter(f)}
            disabled={loading}
          >
            {f === 'all' ? 'All' : f === 'usd_to_lbp' ? 'USD → LBP' : 'LBP → USD'}
          </button>
        ))}

        <button
          className="btn btn-secondary"
          style={{ padding: '6px 16px', fontSize: '12px' }}
          onClick={fetchTransactions}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>

        <span
          style={{
            marginLeft: 'auto',
            color: 'var(--text2)',
            fontSize: '13px',
            alignSelf: 'center',
          }}
        >
          {filtered.length} records
        </span>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap">
            <span className="loading-spinner" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="unavailable-notice">
            <strong>No transactions found</strong>
            {transactions.length === 0
              ? 'Start by creating your first transaction.'
              : 'No transactions match this filter.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Direction</th>
                  <th>USD Amount</th>
                  <th>LBP Amount</th>
                  <th>Implied Rate</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => {
                  const impliedRate = tx.usd_to_lbp
                    ? (tx.lbp_amount / tx.usd_amount).toFixed(2)
                    : (tx.usd_amount / tx.lbp_amount).toFixed(6)

                  return (
                    <tr key={tx.id ?? i}>
                      <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                      <td>
                        <span className={`tag ${tx.usd_to_lbp ? 'tag-completed' : 'tag-open'}`}>
                          {tx.usd_to_lbp ? 'USD → LBP' : 'LBP → USD'}
                        </span>
                      </td>
                      <td className="mono">{Number(tx.usd_amount).toLocaleString()}</td>
                      <td className="mono">{Number(tx.lbp_amount).toLocaleString()}</td>
                      <td className="mono" style={{ color: 'var(--accent)', fontSize: '12px' }}>
                        {impliedRate}
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: '12px' }}>
                        {new Date(tx.added_date).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}