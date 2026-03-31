import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import ProofPanel from '../components/ProofPanel'

const BASE = '/rayane-chams-bacha'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    user_name: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async () => {
    if (!form.user_name.trim() || !form.password) {
      setError('Username and password are required.')
      return
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await register(form.user_name.trim(), form.password)
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate(`${BASE}/login`), 1500)
    } catch (err) {
      const status = err.response?.status

      if (status === 400) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'Missing required fields.'
        )
      } else if (status === 409) {
        setError('Username already exists.')
      } else if (status === 429) {
        setError('Too many requests. Wait and try again.')
      } else {
        setError('Registration failed. Please try again.')
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
        <div className="auth-title">Create account</div>
        <div className="auth-sub">Join the exchange platform</div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

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
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner" /> Registering…
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="auth-footer">
          Already have an account? <Link to={`${BASE}/login`}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}