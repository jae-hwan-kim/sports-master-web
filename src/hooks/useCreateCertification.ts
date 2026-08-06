import * as Sentry from '@sentry/react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type CreateCertificationDto = components['schemas']['CreateCertificationDto']
type CertificationResponseDto = components['schemas']['CertificationResponseDto']

type CreateCertificationPayload = CreateCertificationDto & {
  /** expo-image-picker 결과의 로컬 파일 uri */
  fileUri: string
}

async function createCertification(
  payload: CreateCertificationPayload
): Promise<CertificationResponseDto> {
  const { fileUri, type, licenseType } = payload

  const filename = fileUri.split('/').pop() ?? `certificate-${Date.now()}.jpg`
  const extMatch = /\.(\w+)$/.exec(filename)
  const ext = extMatch?.[1]?.toLowerCase() ?? 'jpg'
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'pdf' ? 'application/pdf' : 'image/jpeg'

  const formData = new FormData()
  // React Native의 FormData는 { uri, name, type } 형태를 파일로 인식함
  formData.append('file', { uri: fileUri, name: filename, type: mimeType } as unknown as Blob)
  if (type) formData.append('type', type)
  if (licenseType) formData.append('licenseType', licenseType)

  const { data } = await apiClient.post<{ data?: CertificationResponseDto }>(
    '/certifications',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  if (!data.data) {
    throw new Error('자격증 등록 응답이 올바르지 않습니다')
  }
  return data.data
}

export function useCreateCertification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCertification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications', 'me'] })
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'master-verification' } })
    },
  })
}
