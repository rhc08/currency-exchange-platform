import apiClient from './apiClient'

export const createTransaction = async (usd_amount, lbp_amount, usd_to_lbp) => {
  const response = await apiClient.post('/transaction', {
    usd_amount: Number(usd_amount),
    lbp_amount: Number(lbp_amount),
    usd_to_lbp: Boolean(usd_to_lbp),
  })
  return response.data
}

export const getTransactions = async () => {
  const response = await apiClient.get('/transaction')
  return response.data
}

/**
 * Download the authenticated user's transactions as a CSV file.
 * Backend: GET /transaction/export
 * Response: Content-Disposition: attachment; filename=transactions_user_<id>.csv
 *
 * Uses responseType: 'blob' so Axios preserves the binary response.
 * The Authorization header is attached automatically by the request interceptor.
 */
export const exportTransactionsCSV = async () => {
  const response = await apiClient.get('/transaction/export', {
    responseType: 'blob',  // tells Axios NOT to parse as JSON
  })

  // Pull the filename from the Content-Disposition header if present,
  // otherwise fall back to a sensible default.
  const disposition = response.headers['content-disposition'] || ''
  const filenameMatch = disposition.match(/filename=([^;]+)/)
  const filename = filenameMatch ? filenameMatch[1].trim() : 'transactions.csv'

  // Create a temporary object URL and trigger a browser download
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()

  // Cleanup
  link.remove()
  window.URL.revokeObjectURL(url)

  return filename  // return so the caller can display a success message
}
