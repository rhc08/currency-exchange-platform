import React, { useEffect, useState } from "react"
import Layout from "../components/Layout"
import apiClient from "../services/apiClient"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [msg, setMsg] = useState("")

  const loadUsers = async () => {
    setLoading(true)
    setError("")
    setMsg("")

    try {
      const res = await apiClient.get("/admin/users")
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Forbidden: Admin access required.")
      } else {
        setError("Failed to load users.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const updateStatus = async (userId, status) => {
    setError("")
    setMsg("")

    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { status })
      setMsg(`User ${userId} updated to ${status}.`)
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user status.")
    }
  }

  return (
    <Layout>
      <h1 className="page-title">User Management</h1>

      {error && <div className="error-box">{error}</div>}
      {msg && <div className="info-box">{msg}</div>}

      {loading ? (
        <div className="loading-wrap">
          <span className="loading-spinner" /> Loading users…
        </div>
      ) : (
        <div className="card">
          <div className="section-header">
            <div className="section-title">All Users</div>
          </div>

          {users.length === 0 ? (
            <div className="info-box">No users found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ width: 260 }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="mono">{u.id}</td>
                      <td>{u.user_name}</td>
                      <td>{u.role}</td>
                      <td>{u.status}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => updateStatus(u.id, "ACTIVE")}
                          >
                            Activate
                          </button>

                          <button
                            className="btn btn-secondary"
                            onClick={() => updateStatus(u.id, "SUSPENDED")}
                          >
                            Suspend
                          </button>

                          <button
                            className="btn btn-danger"
                            onClick={() => updateStatus(u.id, "BANNED")}
                          >
                            Ban
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}