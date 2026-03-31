import apiClient from './apiClient'

export const listOffers = async (status = 'open') => {
  const res = await apiClient.get('/offer', { params: { status } })
  return res.data
}

export const createOffer = async (usd_amount, lbp_amount, usd_to_lbp) => {
  const res = await apiClient.post('/offer', {
    usd_amount: Number(usd_amount),
    lbp_amount: Number(lbp_amount),
    usd_to_lbp: Boolean(usd_to_lbp),
  })
  return res.data
}

export const acceptOffer = async (offerId) => {
  const res = await apiClient.post(`/offer/${offerId}/accept`)
  return res.data
}

export const cancelOffer = async (offerId) => {
  const res = await apiClient.patch(`/offer/${offerId}/cancel`)
  return res.data
}

export const myOfferHistory = async () => {
  const res = await apiClient.get('/offer/my')
  return res.data
}