import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteIncomingDiagnosisRequest } from '@/api/diagnosis'

export function useDeleteDiagnosisRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteIncomingDiagnosisRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses', 'incoming'] })
    },
  })
}
