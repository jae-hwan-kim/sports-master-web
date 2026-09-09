import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markDiagnosisAsViewed } from '@/api/diagnosis'
import type { DiagnosisIncomingItem } from '@/api/diagnosis'

export function useMarkDiagnosisViewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => markDiagnosisAsViewed(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['diagnoses', 'incoming'] })
      const prev = queryClient.getQueryData<DiagnosisIncomingItem[]>(['diagnoses', 'incoming'])
      queryClient.setQueryData<DiagnosisIncomingItem[]>(
        ['diagnoses', 'incoming'],
        (old) => old?.map((item) => (item.id === id ? { ...item, isViewed: true } : item)) ?? []
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['diagnoses', 'incoming'], ctx?.prev)
    },
  })
}
