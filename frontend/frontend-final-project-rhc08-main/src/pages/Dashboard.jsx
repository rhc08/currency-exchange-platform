import React, { useState, useEffect, useCallback, useRef } from 'react'
import Layout from '../components/Layout'
import {
  getExchangeRate,
  getExchangeRateAnalytics,
} from '../services/exchangeService'
import { getTransactions } from '../services/transactionService'
import { useAuth } from '../context/AuthContext'
import { FaCalendarAlt } from "react-icons/fa";
import { getPreferences } from '../services/preferencesService'

export default function Dashboard() {
  const [rates, setRates] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rangeMode, setRangeMode] = useState('preset')
  const [hours, setHours] = useState(72)
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { user } = useAuth()

  const fromInputRef = useRef(null)
  const toInputRef = useRef(null)

  const routeBase = `/${window.location.pathname.split('/')[1] || ''}`

  const openDatePicker = (inputRef) => {
    if (!inputRef?.current) return
    try {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker()
      } else {
        inputRef.current.focus()
      }
    } catch {
      inputRef.current.focus()
    }
  }

  const computeHoursFromDates = () => {
    if (!fromDate || !toDate) return hours

    const from = new Date(`${fromDate}T00:00:00`)
    const to = new Date(`${toDate}T23:59:59`)

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return hours
    }

    const diffMs = to.getTime() - from.getTime()
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

    return diffHours > 0 ? diffHours : hours
  }

  const getActiveHours = () => {
    return rangeMode === 'custom' ? computeHoursFromDates() : hours
  }

  useEffect(() => {
  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences()
      if (prefs?.default_hours) {
        setHours(Number(prefs.default_hours))
      }
    } catch {
      // keep default if preferences fail
    } finally {
      setPrefsLoaded(true)
    }
  }

  loadPreferences()
}, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      if (rangeMode === 'custom') {
        if (!fromDate || !toDate) {
          throw {
            response: {
              status: 400,
              data: { error: 'Please select both From and To dates.' },
            },
          }
        }

        if (new Date(`${toDate}T23:59:59`) < new Date(`${fromDate}T00:00:00`)) {
          throw {
            response: {
              status: 400,
              data: { error: 'The To date must be the same as or after the From date.' },
            },
          }
        }
      }

      const finalHours = getActiveHours()

      const [rateData, analyticsData, txData] = await Promise.all([
        getExchangeRate(),
        getExchangeRateAnalytics(finalHours),
        getTransactions().catch(() => []),
      ])

      setRates(rateData || null)
      setAnalytics(analyticsData || null)
      setTransactions(Array.isArray(txData) ? txData : [])
    } catch (err) {
      const status = err.response?.status
      const backendMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message

      if (status === 400) {
        setError(backendMessage || 'Validation error.')
      } else if (status === 401) {
        setError('Authentication required. Please log in again.')
      } else if (status === 403) {
        setError('Access forbidden.')
      } else if (status === 404) {
        setError('Requested dashboard data was not found.')
      } else if (status === 429) {
        setError('Too many requests. Wait and try again.')
      } else {
        setError('Failed to load exchange dashboard data.')
      }
    } finally {
      setLoading(false)
    }
  }, [hours, rangeMode, fromDate, toDate])

  useEffect(() => {
    if (prefsLoaded) {
      fetchData()
    }
  }, [fetchData, prefsLoaded])

  const clearError = () => setError('')

  const clearFilters = async () => {
    setRangeMode('preset')
    setFromDate('')
    setToDate('')

    try {
      const prefs = await getPreferences()
      setHours(Number(prefs?.default_hours ?? 72))
    } catch {
      setHours(72)
    }
  }

  const fmt = (n, digits = 2) =>
    n != null
      ? Number(n).toLocaleString('en-US', {
          maximumFractionDigits: digits,
        })
      : 'N/A'

  const pctFmt = (n) =>
    n != null ? `${n > 0 ? '+' : ''}${Number(n).toFixed(2)}%` : 'N/A'

  const recentTx = transactions.slice(0, 5)

  const getTrendSummary = () => {
    if (analytics?.trend_summary) {
      const text = analytics.trend_summary.toLowerCase()

      if (text.includes('up')) {
        return {
          icon: '⬆',
          text: analytics.trend_summary,
          color: 'var(--accent)',
        }
      }

      if (text.includes('down')) {
        return {
          icon: '⬇',
          text: analytics.trend_summary,
          color: '#ff6b6b',
        }
      }

      return {
        icon: '→',
        text: analytics.trend_summary,
        color: 'var(--text2)',
      }
    }

    if (!analytics?.trend) {
      return { icon: '•', text: 'No trend data', color: 'var(--text2)' }
    }

    if (analytics.trend === 'up') {
      return {
        icon: '⬆',
        text: 'Exchange trend is upward',
        color: 'var(--accent)',
      }
    }

    if (analytics.trend === 'down') {
      return {
        icon: '⬇',
        text: 'Exchange trend is downward',
        color: '#ff6b6b',
      }
    }

    return {
      icon: '→',
      text: 'Exchange trend is stable',
      color: 'var(--text2)',
    }
  }

  const getVolatilityDescription = () => {
    if (analytics?.volatility_description) {
      return analytics.volatility_description
    }

    if (
      analytics?.min == null ||
      analytics?.max == null ||
      analytics?.avg == null
    ) {
      return 'Not enough data'
    }

    const spreadPct = ((analytics.max - analytics.min) / analytics.avg) * 100

    if (spreadPct < 2) return 'Low volatility'
    if (spreadPct < 5) return 'Moderate volatility'
    return 'High volatility'
  }

  const getBiggestSpikeText = () => {
    if (
      analytics?.biggest_spike_value != null &&
      analytics?.biggest_spike_time
    ) {
      return `${fmt(analytics.biggest_spike_value)} at ${new Date(
        analytics.biggest_spike_time
      ).toLocaleString()}`
    }

    if (analytics?.biggest_spike_text) {
      return analytics.biggest_spike_text
    }

    if (analytics?.pct_change == null || analytics?.last_rate == null) {
      return 'Not available'
    }

    return `${pctFmt(analytics.pct_change)} ending at ${fmt(
      analytics.last_rate
    )}`
  }

  const trendInfo = getTrendSummary()

  const activeRangeText =
    rangeMode === 'custom' && fromDate && toDate
      ? `${fromDate} → ${toDate}`
      : hours === 24
      ? 'Last 24 hours'
      : hours === 72
      ? 'Last 72 hours'
      : hours === 168
      ? 'Last 7 days'
      : hours === 720
      ? 'Last 30 days'
      : `${hours} hrs`

  const dateInputStyle = {
    background: 'var(--bg2)',
    color: 'var(--text1)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '13px',
    colorScheme: 'dark',
    cursor: 'pointer',
  }

  const calendarButtonStyle = {
    background: 'var(--bg2)',
    color: 'var(--text1)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '13px',
    cursor: 'pointer',
  }

  return (
    <Layout>
      <div className="fade-in">
        <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '28px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
<div>
  <h1 className="page-title" style={{ marginBottom: '2px' }}>
    Exchange Dashboard
  </h1>

  <div style={{ color: "var(--text2)", fontSize: "13px", marginBottom: "4px" }}>
    Real-time USD ↔ LBP analytics
  </div>

  {user?.user_name && (
    <div style={{ color: 'var(--text2)', fontSize: '14px' }}>
      Welcome,{' '}
      <strong style={{ color: 'var(--accent)' }}>
        {user.user_name}
      </strong>
    </div>
  )}
</div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            marginRight: '220px',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '13px', color: 'var(--text2)' }}>
              <input
                type="radio"
                name="rangeMode"
                value="preset"
                checked={rangeMode === 'preset'}
                onChange={() => setRangeMode('preset')}
                disabled={loading}
                style={{ marginRight: '6px' }}
              />
              Quick Range
            </label>

            <label style={{ fontSize: '13px', color: 'var(--text2)' }}>
              <input
                type="radio"
                name="rangeMode"
                value="custom"
                checked={rangeMode === 'custom'}
                onChange={() => setRangeMode('custom')}
                disabled={loading}
                style={{ marginRight: '6px' }}
              />
              Custom Dates
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
            }}
          >
            {rangeMode === 'preset' ? (
              <>
                <label style={{ fontSize: '13px', color: 'var(--text2)' , marginRight: '6px', marginLeft: '-6px'}}>
                  Analytics Range
                </label>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  disabled={loading}
                  style={{
                    background: 'var(--bg2)',
                    color: 'var(--text1)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                >
                  <option value={24}>Last 24 hours</option>
                  <option value={72}>Last 72 hours</option>
                  <option value={168}>Last 7 days</option>
                  <option value={720}>Last 30 days</option>
                </select>
              </>
            ) : (
              <>
                <label style={{ fontSize: '13px', color: 'var(--text2)' }}>
                  From
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    ref={fromInputRef}
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    onClick={() => openDatePicker(fromInputRef)}
                    onFocus={() => openDatePicker(fromInputRef)}
                    disabled={loading}
                    style={dateInputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => openDatePicker(fromInputRef)}
                    disabled={loading}
                    style={calendarButtonStyle}
                    aria-label="Open from date calendar"
                    title="Open calendar"
                  >
                    <FaCalendarAlt size={14} />
                  </button>
                </div>

                <label style={{ fontSize: '13px', color: 'var(--text2)' }}>
                  To
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    ref={toInputRef}
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    onClick={() => openDatePicker(toInputRef)}
                    onFocus={() => openDatePicker(toInputRef)}
                    disabled={loading}
                    style={dateInputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => openDatePicker(toInputRef)}
                    disabled={loading}
                    style={calendarButtonStyle}
                    aria-label="Open to date calendar"
                    title="Open calendar"
                  >
                    <FaCalendarAlt size={14} />
                  </button>
                </div>
              </>
            )}

            <button
              className="btn btn-secondary"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" /> Refreshing
                </>
              ) : (
                '↻ Refresh'
              )}
            </button>

            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>

            {error && (
              <button className="btn btn-secondary" onClick={clearError}>
                Clear Error
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-box">
          <div style={{ marginBottom: '10px' }}>{error}</div>
          <button className="btn btn-secondary" onClick={fetchData}>
            Retry
          </button>
        </div>
      )}

      {loading && !rates ? (
        <div className="loading-wrap">
          <span className="loading-spinner" /> Loading exchange dashboard…
        </div>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            <div
              className="stat-card"
              style={{ borderLeft: '3px solid var(--accent)' }}
            >
              <div className="stat-label">USD → LBP Rate</div>
              <div className="stat-value">{fmt(rates?.usd_to_lbp_rate)}</div>
              <div className="stat-sub">Lebanese Pounds per 1 USD</div>
            </div>

            <div
              className="stat-card"
              style={{ borderLeft: '3px solid var(--accent2)' }}
            >
              <div className="stat-label">LBP → USD Rate</div>
              <div
                className="stat-value"
                style={{ color: 'var(--accent2)' }}
              >
                {rates?.lbp_to_usd_rate != null
                  ? Number(rates.lbp_to_usd_rate).toLocaleString('en-US', {
                      maximumFractionDigits: 6,
                    })
                  : 'N/A'}
              </div>
              <div className="stat-sub">USD per 1 LBP</div>
            </div>
          </div>

          <div className="grid-4" style={{ marginBottom: '28px' }}>
            <div className="stat-card">
              <div className="stat-label">Minimum</div>
              <div className="stat-value" style={{ fontSize: '22px' }}>
                {fmt(analytics?.min)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Maximum</div>
              <div className="stat-value" style={{ fontSize: '22px' }}>
                {fmt(analytics?.max)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Average</div>
              <div className="stat-value" style={{ fontSize: '22px' }}>
                {fmt(analytics?.avg)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">% Change</div>
              <div
                className="stat-value"
                style={{
                  fontSize: '22px',
                  color:
                    analytics?.pct_change > 0
                      ? 'var(--accent)'
                      : analytics?.pct_change < 0
                      ? '#ff6b6b'
                      : 'var(--text1)',
                }}
              >
                {pctFmt(analytics?.pct_change)}
              </div>
            </div>
          </div>

          <div
            className="grid-3"
            style={{
              marginBottom: '28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
            }}
          >
            <div className="card">
              <div className="section-title" style={{ marginBottom: '10px' }}>
                Trend Summary
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span style={{ fontSize: '18px', color: trendInfo.color }}>
                  {trendInfo.icon}
                </span>
                <div style={{ color: trendInfo.color, fontSize: '14px' }}>
                  {trendInfo.text}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom: '10px' }}>
                Volatility
              </div>
              <div style={{ color: 'var(--text2)', fontSize: '14px' }}>
                {getVolatilityDescription()}
              </div>
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom: '10px' }}>
                Biggest Spike
              </div>
              <div
                style={{
                  color:
                    analytics?.pct_change > 0
                      ? 'var(--accent)'
                      : analytics?.pct_change < 0
                      ? '#ff6b6b'
                      : 'var(--text2)',
                  fontSize: '14px',
                }}
              >
                {getBiggestSpikeText()}
              </div>
            </div>
          </div>

          <div className="grid-4" style={{ marginBottom: '28px' }}>
            <div className="stat-card">
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value" style={{ fontSize: '22px' }}>
                {transactions.length}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">USD → LBP Count</div>
              <div className="stat-value" style={{ fontSize: '22px' }}>
                {transactions.filter((t) => t.usd_to_lbp).length}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">LBP → USD Count</div>
              <div className="stat-value" style={{ fontSize: '22px' }}>
                {transactions.filter((t) => !t.usd_to_lbp).length}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Data Window</div>
              <div
                className="stat-value"
                style={{ fontSize: '16px', paddingTop: '6px' }}
              >
                {activeRangeText}
              </div>
              <div className="stat-sub">Selected analytics range</div>
            </div>
          </div>

          {rates?.usd_to_lbp_rate == null && rates?.lbp_to_usd_rate == null && (
            <div className="info-box">
              No transactions in the selected range — exchange rates are not yet
              computed.
            </div>
          )}

          <div className="card">
            <div className="section-header">
              <div className="section-title">Recent Transactions</div>
            </div>

            {recentTx.length === 0 ? (
              <div
                style={{
                  color: 'var(--text2)',
                  fontSize: '14px',
                  padding: '16px 0',
                }}
              >
                No transactions yet.{' '}
                <a
                  href={`${routeBase}/transactions/new`}
                  style={{ color: 'var(--accent)' }}
                >
                  Create one →
                </a>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Direction</th>
                      <th>USD Amount</th>
                      <th>LBP Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTx.map((tx, i) => (
                      <tr key={i}>
                        <td>
                          <span
                            className={`tag ${
                              tx.usd_to_lbp ? 'tag-completed' : 'tag-open'
                            }`}
                          >
                            {tx.usd_to_lbp ? 'USD → LBP' : 'LBP → USD'}
                          </span>
                        </td>
                        <td className="mono">
                          {Number(tx.usd_amount).toLocaleString()}
                        </td>
                        <td className="mono">
                          {Number(tx.lbp_amount).toLocaleString()}
                        </td>
                        <td style={{ color: 'var(--text3)' }}>
                          {new Date(tx.added_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </Layout>
  )
}