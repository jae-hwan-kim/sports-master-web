import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type UpdateCustomerProfilePayload = {
  gender?: 'male' | 'female' | 'other'
  ageGroup?: '10s' | '20s' | '30s' | '40s' | '50s' | '60s_plus'
  age?: number
  region?: string
  symptoms?: string[]
  keywords?: string[]
}

type CustomerProfileResponse = {
  id: number
  userId: number
  nickname: string
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

async function updateMyCustomerProfile(
  payload: UpdateCustomerProfilePayload
): Promise<CustomerProfileResponse> {
  const { data } = await apiClient.patch<{ data: CustomerProfileResponse }>(
    '/customer-profiles/me',
    payload
  )
  return data.data
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMyCustomerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerProfile', 'me'] })
    },
    onError: (error: unknown) => {
      console.error('[useUpdateCustomerProfile]', error)
    },
  })
}
