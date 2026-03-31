import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { getExchangeRateHistory } from '../services/exchangeService'
import { getPreferences } from '../services/preferencesService'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function Graph() {
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [direction, setDirection] = useState('usd_to_lbp')
  const [bucket, setBucket] = useState('hour')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [defaultHours, setDefaultHours] = useState(72)

  const computeHoursFromDates = () => {
    if (!dateFrom || !dateTo) return defaultHours

    const from = new Date(`${dateFrom}T00:00:00`)
    const to = new Date(`${dateTo}T23:59:59`)

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return 72
    }

    const diffMs = to.getTime() - from.getTime()
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

    return diffHours > 0 ? diffHours : defaultHours
  }

  const loadGraphData = async () => {
    setLoading(true)
    setError('')

    try {
      if (dateFrom && dateTo) {
        const from = new Date(`${dateFrom}T00:00:00`)
        const to = new Date(`${dateTo}T23:59:59`)

        if (to < from) {
          setError('The To date must be the same as or after the From date.')
          setLoading(false)
          return
        }
      }

      const hours = computeHoursFromDates()
      const response = await getExchangeRateHistory(hours, bucket)
      setHistoryData(Array.isArray(response?.series) ? response.series : [])
    } catch (err) {
      const status = err.response?.status
      const backendMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message

      if (status === 400) {
        setError(backendMessage || 'Invalid graph request.')
      } else if (status === 401) {
        setError('Authentication required. Please log in again.')
      } else if (status === 403) {
        setError('Access forbidden.')
      } else if (status === 404) {
        setError('Graph endpoint not found.')
      } else if (status === 429) {
        setError('Too many requests. Wait and try again.')
      } else {
        setError('Failed to load graph data.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (prefsLoaded) {
      loadGraphData()
    }
  }, [bucket, prefsLoaded])

  useEffect(() => {
  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences()
      if (prefs?.default_bucket) {
        setBucket(prefs.default_bucket)
      }
      if (prefs?.default_hours) {
        setDefaultHours(Number(prefs.default_hours))
      }
    } catch {
      // keep default if preferences fail
    } finally {
      setPrefsLoaded(true)
    }
  }

  loadPreferences()
}, [])

const chartData = useMemo(() => {
  let filtered = historyData

  if (dateFrom && dateTo) {
    const from = new Date(`${dateFrom}T00:00:00`)
    const to = new Date(`${dateTo}T23:59:59`)

    filtered = historyData.filter((item) => {
      const itemDate = new Date(item.bucket)
      return itemDate >= from && itemDate <= to
    })
  }

  return filtered.map((item) => ({
    label: item.bucket,
    rate:
      direction === 'usd_to_lbp'
        ? item.rate
        : item.rate && item.rate !== 0
        ? Number((1 / item.rate).toFixed(6))
        : null,
    count: item.count,
  }))
}, [historyData, direction, dateFrom, dateTo])

  const rateLabel =
    direction === 'usd_to_lbp' ? 'USD → LBP Rate' : 'LBP → USD Rate'

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          }}
        >
          <div style={{ color: 'var(--text2)', marginBottom: '4px' }}>
            {payload[0]?.payload?.label}
          </div>
          <div style={{ color: 'var(--accent)', fontWeight: 700 }}>
            {rateLabel}: {payload[0]?.value?.toLocaleString()}
          </div>
          <div style={{ color: 'var(--text3)', marginTop: '4px' }}>
            Transactions in bucket: {payload[0]?.payload?.count}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Layout>
      <h1 className="page-title">Exchange Rate Graph</h1>

      {error && (
        <div className="error-box">
          <div style={{ marginBottom: '10px' }}>{error}</div>
          <button className="btn btn-secondary" onClick={loadGraphData}>
            Retry
          </button>
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div
            className="form-group"
            style={{ marginBottom: 0, minWidth: '160px' }}
          >
            <label>Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="usd_to_lbp">USD → LBP</option>
              <option value="lbp_to_usd">LBP → USD</option>
            </select>
          </div>

          <div
            className="form-group"
            style={{ marginBottom: 0, minWidth: '140px' }}
          >
            <label>Interval</label>
            <select value={bucket} onChange={(e) => setBucket(e.target.value)}>
              <option value="hour">Hour</option>
              <option value="day">Day</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ width: 'auto' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ width: 'auto' }}
            />
          </div>

          <button className="btn btn-secondary" onClick={loadGraphData}>
            Refresh
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setDateFrom('')
              setDateTo('')
            }}
          >
            Clear Range
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">{rateLabel} Over Time</div>
          <span style={{ color: 'var(--text2)', fontSize: '13px' }}>
            {chartData.length} bucketed data points
          </span>
        </div>

        {loading ? (
          <div className="loading-wrap">
            <span className="loading-spinner" /> Loading chart data…
          </div>
        ) : chartData.length === 0 ? (
          <div className="unavailable-notice">
            <strong>No data for selected range</strong>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{
                  fill: 'var(--text3)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fill: 'var(--text3)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                tickFormatter={(v) =>
                  direction === 'usd_to_lbp'
                    ? v?.toLocaleString()
                    : v?.toFixed(6)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: 'var(--text2)' }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                name={rateLabel}
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 3 }}
                activeDot={{ r: 6, fill: 'var(--accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Layout>
  )
}