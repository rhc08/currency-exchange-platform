import apiClient from './apiClient'

export const getExchangeRate = async () => {
  const response = await apiClient.get('/exchangeRate')
  return response.data
}

export const getExchangeRateAnalytics = async (hours = 72) => {
  const response = await apiClient.get(`/exchangeRate/analytics?hours=${hours}`)
  return response.data
}

export const getExchangeRateHistory = async (hours = 72, bucket = 'hour') => {
  const response = await apiClient.get(
    `/exchangeRate/history?hours=${hours}&bucket=${bucket}`
  )
  return response.data
}