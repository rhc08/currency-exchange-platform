import apiClient from './apiClient'

export const getPreferences = async () => {
  const res = await apiClient.get('/preferences')
  return res.data
}

export const updatePreferences = async (default_hours, default_bucket) => {
  const res = await apiClient.put('/preferences', { default_hours, default_bucket })
  return res.data
}