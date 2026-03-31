import apiClient from './apiClient'

export const getAdminReports = async (start = null, end = null) => {
  const params = {}
  if (start) params.start = start
  if (end) params.end = end
  const res = await apiClient.get('/admin/reports', { params })
  return res.data
}

export const listUsers = async () => {
  const res = await apiClient.get('/admin/users')
  return res.data
}

export const updateUserStatus = async (target_user_id, status) => {
  const res = await apiClient.patch(`/admin/users/${target_user_id}/status`, { status })
  return res.data
}

export const getAdminAuditLogs = async () => {
  const res = await apiClient.get('/admin/audit')
  return res.data
}

export const getRateQuality = async (limit = 100) => {
  const res = await apiClient.get('/admin/rate-quality', { params: { limit } })
  return res.data
}

export const triggerBackup = async () => {
  const res = await apiClient.post('/admin/backup')
  return res.data
}

export const backupStatus = async () => {
  const res = await apiClient.get('/admin/backup/status')
  return res.data
}

export const restoreBackup = async () => {
  const res = await apiClient.post('/admin/restore')
  return res.data
}