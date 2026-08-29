import { useQuery } from '@tanstack/react-query'

import { fetchIncomingDiagnosisRequests } from '@/api/diagnosis'

export function useIncomingDiagnosisRequests() {
  return useQuery({
    queryKey: ['diagnoses', 'incoming'],
    queryFn: fetchIncomingDiagnosisRequests,
  })
}
