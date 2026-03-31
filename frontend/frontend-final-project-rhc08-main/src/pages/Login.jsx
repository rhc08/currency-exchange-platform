import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authenticate } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import ProofPanel from '../components/ProofPanel'

const BASE = '/rayane-chams-bacha'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ user_name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (searchParams.get('expired')) {
      setError('Session expired. Please log in again.')
    }
  }, [searchParams])

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [cooldown])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.user_name.trim() || !form.password) {
      setError('Username and password are required.')
      return
    }

    setLoading(true)

    try {
      const data = await authenticate(form.user_name.trim(), form.password)

      login(data.token, data.user_id, data.user_name, data.role)
      navigate(`${BASE}/dashboard`)
    } catch (err) {
      const status = err.response?.status

      if (status === 401 || status === 403) {
        setError('Invalid credentials. Please check your username and password.')
      } else if (status === 429) {
        setError('Too many requests. Wait and try again.')
        setCooldown(30)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <ProofPanel />
      <div className="auth-card">
        <div className="auth-logo">LBP // Exchange</div>
        <div className="auth-title">Sign in</div>
        <div className="auth-sub">Access your exchange account</div>

        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label>Username</label>
          <input
            name="user_name"
            value={form.user_name}
            onChange={handleChange}
            placeholder="your_username"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && !cooldown && handleSubmit()}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          onClick={handleSubmit}
          disabled={loading || cooldown > 0}
        >
          {loading ? (
            <>
              <span className="loading-spinner" /> Signing in…
            </>
          ) : cooldown > 0 ? (
            `Wait ${cooldown}s…`
          ) : (
            'Sign In'
          )}
        </button>

        <div className="auth-footer">
          No account? <Link to={`${BASE}/register`}>Register</Link>
        </div>
      </div>
    </div>
  )
}