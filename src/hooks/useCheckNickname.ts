import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

async function checkNickname(nickname: string): Promise<{ available: boolean }> {
  const { data } = await apiClient.get<{ data: { available: boolean } }>('/auth/check-nickname', {
    params: { nickname },
  })
  return data.data
}

export function useCheckNickname() {
  return useMutation({ mutationFn: checkNickname })
}
