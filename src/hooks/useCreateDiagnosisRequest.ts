import { useMutation } from '@tanstack/react-query'

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
  return useMutation({
    mutationFn: (expertProfileId: number) => createDiagnosisRequest(expertProfileId),
  })
}
