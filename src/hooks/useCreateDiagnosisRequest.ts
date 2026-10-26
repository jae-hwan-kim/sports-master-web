import * as Sentry from '@sentry/react-native'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type DiagnosisRequestResponseDto = components['schemas']['DiagnosisRequestResponseDto']

async function createDiagnosisRequest(expertProfileId: number): Promise<DiagnosisRequestResponseDto> {
  const { data } = await apiClient.post<{ data: DiagnosisRequestResponseDto }>('/diagnoses', {
    expertProfileId,
  })
  return data.data
}

export function useCreateDiagnosisRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expertProfileId: number) => createDiagnosisRequest(expertProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosisPreview'] })
      // 리뷰 작성 가능한 명인 목록 = 내가 보낸 진단요청 기준
      queryClient.invalidateQueries({ queryKey: ['diagnoses', 'my-sent'] })
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'createDiagnosisRequest' } })
    },
  })
}
