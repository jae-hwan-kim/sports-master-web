import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type CustomerProfileData = {
  id: number
  userId: number
  nickname: string
  // 소셜 가입자 이름 — 닉네임이 없을 때 표시
  name?: string | null
  age: number | null
  gender: string | null
  ageGroup: string | null
  region: string
  mainSport: string | null
  symptoms: string[] | null
  keywordTags: string[] | null
  createdAt: string
  updatedAt: string
}

async function fetchMyCustomerProfile(): Promise<CustomerProfileData> {
  const { data } = await apiClient.get<{ data: CustomerProfileData }>('/customer-profiles/me')
  return data.data
}

export function useCustomerProfile() {
  return useQuery({
    queryKey: ['customerProfile', 'me'],
    queryFn: fetchMyCustomerProfile,
    staleTime: 1000 * 60 * 5,
  })
}
