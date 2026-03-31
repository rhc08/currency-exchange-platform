import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const BASE = "/rayane-chams-bacha"

export default function AdminRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to={`${BASE}/login`} replace />
  }

  if (user.role !== "ADMIN") {
    return <Navigate to={`${BASE}/403`} replace />
  }

  return children
}