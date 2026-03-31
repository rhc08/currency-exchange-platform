import React from 'react'
import Layout from './Layout'

export default function UnavailablePage({ title, features = [] }) {
  return (
    <Layout>
      <h1 className="page-title">{title}</h1>
      <div className="unavailable-notice">
        <strong>Backend endpoint not available for this feature.</strong>
        This feature requires a backend endpoint that does not exist in the current Sprint 1 backend.
        {features.length > 0 && (
          <ul style={{ marginTop: '16px', textAlign: 'left', display: 'inline-block', color: 'var(--text3)', fontSize: '13px', lineHeight: '1.9' }}>
            {features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        )}
      </div>
    </Layout>
  )
}
