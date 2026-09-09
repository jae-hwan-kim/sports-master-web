import { apiClient } from './client'

export type DiagnosisCustomerProfile = {
  personalCode: string
  nickname: string | null
  profileImageUrl: string | null
  name: string
  age: number | null
  gender: string | null
  region: string | null
  sport: string | null
  keywordTags: string[] | null
  introduction: string | null
}

export type DiagnosisIncomingItem = {
  id: number
  status: string
  isViewed: boolean
  customerProfile: DiagnosisCustomerProfile
  createdAt: string
}

export async function fetchIncomingDiagnosisRequests(): Promise<DiagnosisIncomingItem[]> {
  const { data } = await apiClient.get<{ data: DiagnosisIncomingItem[] }>('/diagnoses/incoming')
  return data.data
}

export async function markDiagnosisAsViewed(id: number): Promise<void> {
  await apiClient.patch(`/diagnoses/${id}/view`)
}

export async function deleteIncomingDiagnosisRequest(id: number): Promise<void> {
  await apiClient.delete(`/diagnoses/${id}`)
}
