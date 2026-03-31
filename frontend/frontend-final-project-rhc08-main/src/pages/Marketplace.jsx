import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import {
  listOffers,
  createOffer,
  acceptOffer,
  cancelOffer,
  myOfferHistory,
} from '../services/marketplaceService'

export default function Marketplace() {
  const { user } = useAuth()

  const [tab, setTab] = useState('open') // open | my
  const [offers, setOffers] = useState([])
  const [form, setForm] = useState({
    usd_amount: '',
    lbp_amount: '',
    usd_to_lbp: true,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const load = async (activeTab = tab) => {
    setLoading(true)
    setError('')
    try {
      const data =
        activeTab === 'my' ? await myOfferHistory() : await listOffers('open')
      setOffers(Array.isArray(data) ? data : [])
    } catch (err) {
      const status = err.response?.status
      if (status === 401) setError('Authentication required.')
      else if (status === 403) setError('Access forbidden.')
      else setError('Failed to load marketplace offers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMsg('')
    load(tab)
  }, [tab])

  const onCreate = async () => {
    setError('')
    setMsg('')

    if (!form.usd_amount || !form.lbp_amount) {
      setError('USD and LBP amounts are required.')
      return
    }

    if (Number(form.usd_amount) <= 0 || Number(form.lbp_amount) <= 0) {
      setError('USD and LBP amounts must be positive.')
      return
    }

    try {
      await createOffer(form.usd_amount, form.lbp_amount, form.usd_to_lbp)
      setMsg('Offer created.')
      setForm({ usd_amount: '', lbp_amount: '', usd_to_lbp: true })

      if (tab !== 'open') {
        setTab('open')
      } else {
        load('open')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create offer.')
    }
  }

  const onAccept = async (offer) => {
    setError('')
    setMsg('')

    if (offer.maker_user_id === user?.user_id) {
      setError('You cannot accept your own offer.')
      return
    }

    try {
      await acceptOffer(offer.id)
      setMsg('Offer accepted.')

      if (tab !== 'my') {
        setTab('my')
      } else {
        load('my')
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'This offer is no longer available. Refreshing offers list.'
      )
      load(tab)
    }
  }

  const onCancel = async (offer) => {
    setError('')
    setMsg('')

    try {
      await cancelOffer(offer.id)
      setMsg('Offer cancelled.')

      if (tab !== 'my') {
        setTab('my')
      } else {
        load('my')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel offer.')
      load(tab)
    }
  }

  const getStatusClass = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'open') return 'tag-open'
    if (s === 'completed') return 'tag-completed'
    if (s === 'cancelled' || s === 'canceled') return 'tag-cancelled'
    return 'tag-open'
  }

  return (
    <Layout>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          P2P Marketplace
        </h1>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className={`btn ${tab === 'open' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('open')}
          >
            Open Offers
          </button>

          <button
            className={`btn ${tab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('my')}
          >
            My History
          </button>

          <button className="btn btn-secondary" onClick={() => load(tab)} disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner" /> Refreshing
              </>
            ) : (
              '↻ Refresh'
            )}
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {msg && <div className="info-box">{msg}</div>}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-header">
          <div className="section-title">Create Offer</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr auto',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div className="form-group">
            <label>USD Amount</label>
            <input
              value={form.usd_amount}
              onChange={(e) => setForm({ ...form, usd_amount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>LBP Amount</label>
            <input
              value={form.lbp_amount}
              onChange={(e) => setForm({ ...form, lbp_amount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Direction</label>
            <select
              value={form.usd_to_lbp ? 'usd_to_lbp' : 'lbp_to_usd'}
              onChange={(e) =>
                setForm({ ...form, usd_to_lbp: e.target.value === 'usd_to_lbp' })
              }
            >
              <option value="usd_to_lbp">USD → LBP</option>
              <option value="lbp_to_usd">LBP → USD</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={onCreate}>
            + Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <span className="loading-spinner" /> Loading…
        </div>
      ) : offers.length === 0 ? (
        <div className="info-box">No offers to display.</div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Direction</th>
                  <th>USD</th>
                  <th>LBP</th>
                  <th style={{ width: 220 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => {
                  const isOwnOffer = o.maker_user_id === user?.user_id
                  const normalizedStatus = String(o.status || '').toLowerCase()

                  return (
                    <tr key={o.id}>
                      <td className="mono">{o.id}</td>
                      <td>
                        <span className={`tag ${getStatusClass(o.status)}`}>
                          {String(o.status || '').toUpperCase()}
                        </span>
                      </td>
                      <td>{o.usd_to_lbp ? 'USD → LBP' : 'LBP → USD'}</td>
                      <td className="mono">{Number(o.usd_amount).toLocaleString()}</td>
                      <td className="mono">{Number(o.lbp_amount).toLocaleString()}</td>
                      <td>
                        {tab === 'open' && normalizedStatus === 'open' ? (
                          isOwnOffer ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-secondary" disabled>
                                Your Offer
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => onCancel(o)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              onClick={() => onAccept(o)}
                            >
                              Accept
                            </button>
                          )
                        ) : tab === 'my' && isOwnOffer && normalizedStatus === 'open' ? (
                          <button
                            className="btn btn-danger"
                            onClick={() => onCancel(o)}
                          >
                            Cancel
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text3)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}