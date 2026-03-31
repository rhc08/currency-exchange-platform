import React, { useEffect, useState } from "react"
import Layout from "../components/Layout"
import apiClient from "../services/apiClient"

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const loadReports = async () => {
    try {
      const res = await apiClient.get("/admin/reports")
      setData(res.data)
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Forbidden: Admin access required.")
      } else {
        setError("Failed to load admin reports.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  return (
    <Layout>
      <h1 className="page-title">Admin Dashboard</h1>

      {error && <div className="error-box">{error}</div>}

      {loading && (
        <div className="loading-wrap">
          <span className="loading-spinner" /> Loading system reports…
        </div>
      )}

      {data && (
        <>
          <div className="card">
            <h3>Transaction Volume</h3>
            <p>Total Transactions: {data.total_transaction_volume.transaction_count}</p>
            <p>Total USD: {data.total_transaction_volume.total_usd_amount}</p>
            <p>Total LBP: {data.total_transaction_volume.total_lbp_amount}</p>
          </div>

          <div className="card">
            <h3>Marketplace Statistics</h3>
            <p>Total Offers: {data.marketplace_statistics.total_offers}</p>
            <p>Open Offers: {data.marketplace_statistics.open_offers}</p>
            <p>Completed Offers: {data.marketplace_statistics.completed_offers}</p>
            <p>Cancelled Offers: {data.marketplace_statistics.cancelled_offers}</p>
          </div>

          <div className="card">
            <h3>Most Active Users</h3>

            {data.most_active_users.length === 0 ? (
              <p>No activity yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Transactions</th>
                    <th>Offers</th>
                    <th>Activity Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.most_active_users.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.user_name}</td>
                      <td>{u.transactions}</td>
                      <td>{u.offers}</td>
                      <td>{u.activity_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}