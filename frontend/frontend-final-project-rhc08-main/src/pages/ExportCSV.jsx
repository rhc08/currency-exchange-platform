import React, { useState } from 'react'
import Layout from '../components/Layout'
import { exportTransactionsCSV } from '../services/transactionService'

export default function ExportCSV() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successFile, setSuccessFile] = useState('')

  const handleExport = async () => {
    setLoading(true)
    setError('')
    setSuccessFile('')

    try {
      const filename = await exportTransactionsCSV()
      setSuccessFile(filename)
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        setError('Authentication required. Please log in again.')
      } else if (status === 403) {
        setError('Access forbidden.')
      } else if (status === 429) {
        setError('Too many requests. Wait and try again.')
      } else {
        // If the server returned a JSON error inside a blob, try to parse it
        const blob = err.response?.data
        if (blob instanceof Blob) {
          try {
            const text = await blob.text()
            const json = JSON.parse(text)
            setError(json.error || 'Export failed.')
          } catch {
            setError('Export failed. Please try again.')
          }
        } else {
          setError('Export failed. Please try again.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Export Transactions</h1>

      <div className="card" style={{ maxWidth: '520px' }}>
        <div style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '8px', lineHeight: '1.7' }}>
          Download your complete transaction history as a CSV file.
        </div>
        <div style={{ color: 'var(--text3)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>
          GET /transaction/export — requires Authorization: Bearer &lt;token&gt;
        </div>

        {error && <div className="error-box">{error}</div>}

        {successFile && (
          <div className="success-box">
            ✓ Downloaded: <strong style={{ fontFamily: 'var(--font-mono)' }}>{successFile}</strong>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={loading}
          style={{ gap: '10px' }}
        >
          {loading
            ? <><span className="loading-spinner" /> Exporting…</>
            : '↓ Export Transactions (CSV)'}
        </button>

        <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg3)', borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--text3)', lineHeight: '1.8' }}>
          <div style={{ fontWeight: 700, color: 'var(--text2)', marginBottom: '6px' }}>CSV columns</div>
          id · added_date · usd_amount · lbp_amount · usd_to_lbp
        </div>
      </div>
    </Layout>
  )
}

