import apiClient from './apiClient'

export const createAlert = async (threshold, direction) => {
  const res = await apiClient.post('/alert', {
    threshold: Number(threshold),
    direction,
  })
  return res.data
}

export const getAlerts = async () => {
  const res = await apiClient.get('/alert')
  return res.data
}

export const deleteAlert = async (id) => {
  const res = await apiClient.delete(`/alert/${id}`)
  return res.data
}