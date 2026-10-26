import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components, operations } from '@/types/schema'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']
type UpdatePayload = NonNullable<
  operations['ExpertProfilesController_updateMe']['requestBody']
>['content']['application/json']

async function updateMyExpertProfile(payload: UpdatePayload): Promise<ExpertProfileResponseDto> {
  const { data } = await apiClient.patch<{ data: ExpertProfileResponseDto }>(
    '/expert-profiles/me',
    payload
  )
  return data.data
}

export function useUpdateExpertProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMyExpertProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expertProfile', 'me'] })
      // 명인홈의 프로필 작성 여부·등급 카드도 즉시 갱신
      queryClient.invalidateQueries({ queryKey: ['expertGrade'] })
      // 고객 쪽 탐색·이달의 명인 카드에도 지역/이미지/키워드 노출
      queryClient.invalidateQueries({ queryKey: ['experts'] })
      queryClient.invalidateQueries({ queryKey: ['home', 'featured-experts'] })
    },
    onError: (error: unknown) => {
      console.error('[useUpdateExpertProfile]', error)
    },
  })
}
