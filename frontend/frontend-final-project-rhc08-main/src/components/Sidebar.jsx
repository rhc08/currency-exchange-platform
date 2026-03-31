import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const BASE = '/rayane-chams-bacha'

const navItems = [
  { label: 'Dashboard', path: `${BASE}/dashboard`, icon: '◈' },
  { label: 'Transactions', path: `${BASE}/transactions`, icon: '⇄' },
  { label: 'New Transaction', path: `${BASE}/transactions/new`, icon: '+' },
  { label: 'Graphs', path: `${BASE}/graphs`, icon: '▲' },
  { label: 'Marketplace', path: `${BASE}/marketplace`, icon: '◎' },
  { label: 'Alerts', path: `${BASE}/alerts`, icon: '◉' },
  { label: 'Watchlist', path: `${BASE}/watchlist`, icon: '◇' },
  { label: 'Export CSV', path: `${BASE}/export`, icon: '↓' },
  { label: 'Notifications', path: `${BASE}/notifications`, icon: '◯' },
  { label: 'Preferences', path: `${BASE}/preferences`, icon: '⚙' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(`${BASE}/login`)
  }

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 20px',
    fontSize: '13px',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--accent)' : 'var(--text2)',
    background: isActive ? 'rgba(232,255,71,0.06)' : 'transparent',
    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'all var(--transition)',
    textDecoration: 'none',
    cursor: 'pointer',
    transform: 'translateX(0px)',
  })

  const handleMouseEnter = (e) => {
    if (!e.currentTarget.style.borderLeft.includes('var(--accent)')) {
      e.currentTarget.style.color = 'var(--accent)'
    }
    e.currentTarget.style.transform = 'translateX(3px)'
  }

  const handleMouseLeave = (e) => {
    if (!e.currentTarget.style.borderLeft.includes('var(--accent)')) {
      e.currentTarget.style.color = 'var(--text2)'
    }
    e.currentTarget.style.transform = 'translateX(0px)'
  }

  return (
    <aside
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '28px 20px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-main)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}
        >
          LBP Exchange
        </div>

        {user && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text2)',
              marginTop: '6px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.user_name}
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={navLinkStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <NavLink
              to={`${BASE}/admin`}
              style={navLinkStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>★</span>
              Admin Dashboard
            </NavLink>

            <NavLink
              to={`${BASE}/admin/users`}
              style={navLinkStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>☰</span>
              Manage Users
            </NavLink>
          </>
        )}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-danger"
          onClick={handleLogout}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Logout
        </button>
      </div>
    </aside>
  )
}