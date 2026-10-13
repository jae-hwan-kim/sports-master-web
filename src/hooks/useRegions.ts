import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

async function fetchRegions(): Promise<string[]> {
  const { data } = await apiClient.get<{ data: { regions: string[] } }>('/customer-profiles/regions')
  return data.data.regions
}

export function useRegions() {
  return useQuery({
    queryKey: ['customer-profiles', 'regions'],
    queryFn: fetchRegions,
    staleTime: Infinity,
  })
}
