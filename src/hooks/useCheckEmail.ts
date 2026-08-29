import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

async function checkEmail(email: string): Promise<{ available: boolean }> {
  const { data } = await apiClient.get<{ data: { available: boolean } }>('/auth/check-email', {
    params: { email },
  })
  return data.data
}

export function useCheckEmail() {
  return useMutation({ mutationFn: checkEmail })
}
