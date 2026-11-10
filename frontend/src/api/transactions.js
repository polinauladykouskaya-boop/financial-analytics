import api from './client'

const TRANSACTIONS_URL = '/api/transactions'

export async function getTransactions() {
  const response = await api.get(TRANSACTIONS_URL)
  return response.data
}

export async function createTransaction(transaction) {
  const response = await api.post(TRANSACTIONS_URL, transaction)
  return response.data
}

export async function updateTransaction(id, transaction) {
  const response = await api.put(
    `${TRANSACTIONS_URL}/${id}`,
    transaction
  )
  return response.data
}

export async function deleteTransaction(id) {
  const response = await api.delete(
    `${TRANSACTIONS_URL}/${id}`
  )
  return response.data
}