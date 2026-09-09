import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']

async function uploadProfileImage(formData: FormData): Promise<ExpertProfileResponseDto> {
  const { data } = await apiClient.post<{ data: ExpertProfileResponseDto }>(
    '/expert-profiles/me/images',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data.data
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expertProfile', 'me'] })
    },
  })
}
