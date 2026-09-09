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
    },
  })
}
