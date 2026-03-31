import apiClient from './apiClient'

export const getNotifications = async () => {
  const res = await apiClient.get('/notifications')
  return res.data
}

export const markNotificationRead = async (id) => {
  const res = await apiClient.patch(`/notifications/${id}/read`)
  return res.data
}

export const deleteNotification = async (id) => {
  const res = await apiClient.delete(`/notifications/${id}`)
  return res.data
}