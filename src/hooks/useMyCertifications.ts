import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type CertificationResponseDto = components['schemas']['CertificationResponseDto']

async function fetchMyCertifications(): Promise<CertificationResponseDto[]> {
  const { data } = await apiClient.get<{ data: CertificationResponseDto[] }>('/certifications/me')
  return data.data
}

export function useMyCertifications() {
  return useQuery({
    queryKey: ['certifications', 'me'],
    queryFn: fetchMyCertifications,
  })
}
