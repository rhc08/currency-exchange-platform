import apiClient from './apiClient'

export const addWatchlist = async (direction, threshold = null) => {
  const res = await apiClient.post('/watchlist', { direction, threshold })
  return res.data
}

export const getWatchlist = async () => {
  const res = await apiClient.get('/watchlist')
  return res.data
}

export const deleteWatchlist = async (id) => {
  const res = await apiClient.delete(`/watchlist/${id}`)
  return res.data
}