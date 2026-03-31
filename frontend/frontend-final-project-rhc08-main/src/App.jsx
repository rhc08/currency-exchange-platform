import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import NewTransaction from './pages/NewTransaction'
import Graph from './pages/Graph'
import Marketplace from './pages/Marketplace'
import Alerts from './pages/Alerts'
import Watchlist from './pages/Watchlist'
import ExportCSV from './pages/ExportCSV'
import Notifications from './pages/Notifications'
import Preferences from './pages/Preferences'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'

const BASE = '/rayane-chams-bacha'

const Protected = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
)

const AdminProtected = ({ children }) => (
  <AdminRoute>{children}</AdminRoute>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={`${BASE}/dashboard`} replace />} />
          <Route path={BASE} element={<Navigate to={`${BASE}/dashboard`} replace />} />

          <Route path={`${BASE}/login`} element={<Login />} />
          <Route path={`${BASE}/register`} element={<Register />} />

          <Route path={`${BASE}/dashboard`} element={<Protected><Dashboard /></Protected>} />
          <Route path={`${BASE}/transactions`} element={<Protected><Transactions /></Protected>} />
          <Route path={`${BASE}/transactions/new`} element={<Protected><NewTransaction /></Protected>} />
          <Route path={`${BASE}/graphs`} element={<Protected><Graph /></Protected>} />
          <Route path={`${BASE}/marketplace`} element={<Protected><Marketplace /></Protected>} />
          <Route path={`${BASE}/alerts`} element={<Protected><Alerts /></Protected>} />
          <Route path={`${BASE}/watchlist`} element={<Protected><Watchlist /></Protected>} />
          <Route path={`${BASE}/export`} element={<Protected><ExportCSV /></Protected>} />
          <Route path={`${BASE}/notifications`} element={<Protected><Notifications /></Protected>} />
          <Route path={`${BASE}/preferences`} element={<Protected><Preferences /></Protected>} />

          <Route
            path={`${BASE}/admin`}
            element={
              <AdminProtected>
                <AdminDashboard />
              </AdminProtected>
            }
          />

          <Route
            path={`${BASE}/admin/users`}
            element={
              <AdminProtected>
                <AdminUsers />
              </AdminProtected>
            }
          />
          
          <Route path={`${BASE}/403`} element={<Forbidden />} />

          <Route path={`${BASE}/404`} element={<NotFound />} />
          <Route path="*" element={<Navigate to={`${BASE}/404`} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

