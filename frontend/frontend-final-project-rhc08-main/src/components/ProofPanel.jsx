import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ProofPanel() {
  const location = useLocation()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  return (
    <div className="proof-panel">
      <div className="proof-name">Rayane Chams Bacha</div>
      <div className="proof-time">Time: {dateStr}</div>
      <div className="proof-route">Route: {location.pathname}</div>
    </div>
  )
}
