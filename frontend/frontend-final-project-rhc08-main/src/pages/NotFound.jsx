import React from 'react'
import { Link } from 'react-router-dom'
import ProofPanel from '../components/ProofPanel'

const BASE = '/rayane-chams-bacha'

export default function NotFound() {
  return (
    <div className="auth-page">
      <ProofPanel />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '80px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>404</div>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Page not found</div>
        <div style={{ color: 'var(--text2)', marginBottom: '28px' }}>The route you requested doesn't exist.</div>
        <Link to={`${BASE}/dashboard`} className="btn btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  )
}
