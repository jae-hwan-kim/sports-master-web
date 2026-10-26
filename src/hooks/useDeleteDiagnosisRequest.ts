import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteIncomingDiagnosisRequest } from '@/api/diagnosis'
import type { DiagnosisIncomingItem } from '@/api/diagnosis'

export function useDeleteDiagnosisRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteIncomingDiagnosisRequest(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['diagnoses', 'incoming'] })
      const prev = queryClient.getQueryData<DiagnosisIncomingItem[]>(['diagnoses', 'incoming'])
      queryClient.setQueryData<DiagnosisIncomingItem[]>(
        ['diagnoses', 'incoming'],
        (old) => old?.filter((item) => item.id !== id) ?? []
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['diagnoses', 'incoming'], ctx?.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses', 'incoming'] })
      // 명인홈 '진단요청 고객' 미리보기도 같은 데이터 — 함께 갱신
      queryClient.invalidateQueries({ queryKey: ['diagnosisPreview'] })
    },
  })
}
