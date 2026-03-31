import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { createTransaction } from '../services/transactionService'
import { getExchangeRate } from '../services/exchangeService'

const BASE = '/rayane-chams-bacha'

export default function NewTransaction() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    usd_amount: '',
    lbp_amount: '',
    usd_to_lbp: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [rates, setRates] = useState(null)

  useEffect(() => {
    getExchangeRate().then(setRates).catch(() => {})
  }, [])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const validate = () => {
    if (form.usd_to_lbp === '') return 'Please select a conversion direction.'
    if (!form.usd_amount || !form.lbp_amount) {
      return 'Both USD and LBP amounts are required.'
    }
    if (Number(form.usd_amount) <= 0) return 'USD amount must be positive.'
    if (Number(form.lbp_amount) <= 0) return 'LBP amount must be positive.'
    return null
  }

  const autoFill = () => {
    if (!rates || !form.usd_amount || form.usd_to_lbp === '') return

    const usd = Number(form.usd_amount)
    if (Number.isNaN(usd) || usd <= 0) return

    if (form.usd_to_lbp === 'true' && rates.usd_to_lbp_rate) {
      setForm((prev) => ({
        ...prev,
        lbp_amount: (usd * rates.usd_to_lbp_rate).toFixed(0),
      }))
    } else if (form.usd_to_lbp === 'false' && rates.lbp_to_usd_rate) {
      setForm((prev) => ({
        ...prev,
        lbp_amount: (usd / rates.lbp_to_usd_rate).toFixed(0),
      }))
    }
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setSuccess('')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await createTransaction(
        form.usd_amount,
        form.lbp_amount,
        form.usd_to_lbp === 'true'
      )

      setSuccess('Transaction created successfully!')
      setTimeout(() => navigate(`${BASE}/transactions`), 1200)
    } catch (err) {
      const status = err.response?.status
      const backendMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message

      if (status === 400) {
        setError(backendMessage || 'Invalid transaction data.')
      } else if (status === 401) {
        setError('Authentication required. Please log in again.')
      } else if (status === 403) {
        setError('You do not have permission to create transactions.')
      } else if (status === 429) {
        setError('Too many requests. Wait and try again.')
        setCooldown(30)
      } else {
        setError('Failed to create transaction. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="page-title">New Transaction</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '28px',
          maxWidth: '900px',
        }}
      >
        <div className="card">
          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <div className="form-group">
            <label>Conversion Direction *</label>
            <select
              name="usd_to_lbp"
              value={form.usd_to_lbp}
              onChange={handleChange}
              disabled={loading || cooldown > 0}
            >
              <option value="">— Select direction —</option>
              <option value="true">USD → LBP (Selling USD)</option>
              <option value="false">LBP → USD (Buying USD)</option>
            </select>
          </div>

          <div className="form-group">
            <label>USD Amount *</label>
            <input
              name="usd_amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.usd_amount}
              onChange={handleChange}
              onBlur={autoFill}
              placeholder="0.00"
              disabled={loading || cooldown > 0}
            />
          </div>

          <div className="form-group">
            <label>LBP Amount *</label>
            <input
              name="lbp_amount"
              type="number"
              min="1"
              step="1"
              value={form.lbp_amount}
              onChange={handleChange}
              placeholder="0"
              disabled={loading || cooldown > 0}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || cooldown > 0}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" /> Submitting…
                </>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s…`
              ) : (
                'Submit Transaction'
              )}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigate(`${BASE}/transactions`)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '12px',
                color: 'var(--text2)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Current Rates
            </div>

            {rates ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ color: 'var(--text2)', fontSize: '13px' }}>
                    USD → LBP
                  </span>
                  <span
                    className="mono"
                    style={{ color: 'var(--accent)', fontSize: '13px' }}
                  >
                    {rates.usd_to_lbp_rate
                      ? Number(rates.usd_to_lbp_rate).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text2)', fontSize: '13px' }}>
                    LBP → USD
                  </span>
                  <span
                    className="mono"
                    style={{ color: 'var(--accent2)', fontSize: '13px' }}
                  >
                    {rates.lbp_to_usd_rate
                      ? Number(rates.lbp_to_usd_rate).toFixed(6)
                      : 'N/A'}
                  </span>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text3)', fontSize: '13px' }}>
                Loading rates…
              </div>
            )}
          </div>

          <div className="card">
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                marginBottom: '12px',
                color: 'var(--text2)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Validation Rules
            </div>

            <ul
              style={{
                color: 'var(--text2)',
                fontSize: '13px',
                lineHeight: '1.9',
                paddingLeft: '16px',
              }}
            >
              <li>USD and LBP amounts must be positive</li>
              <li>Conversion direction is required</li>
              <li>Backend errors (400/401/403) are displayed clearly</li>
              <li>Rate limited to 10 requests/min</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}