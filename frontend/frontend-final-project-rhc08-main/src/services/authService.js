import apiClient from './apiClient'

export const register = async (user_name, password) => {
  const response = await apiClient.post('/user', { user_name, password })
  return response.data
}

export const authenticate = async (user_name, password) => {
  const response = await apiClient.post('/authentication', { user_name, password })
  return response.data // { token }
}
