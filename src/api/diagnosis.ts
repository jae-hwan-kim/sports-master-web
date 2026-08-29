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
  customerProfile: DiagnosisCustomerProfile
  createdAt: string
}

export async function fetchIncomingDiagnosisRequests(): Promise<DiagnosisIncomingItem[]> {
  const { data } = await apiClient.get<{ data: DiagnosisIncomingItem[] }>('/diagnoses/incoming')
  return data.data
}
