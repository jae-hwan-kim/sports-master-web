import { apiClient } from '@/api/client'

export type LocalFile = { uri: string; name?: string; mimeType?: string }

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  pdf: 'application/pdf',
}

/** 로컬 파일 uri(file://, ph:// 등)인지 — 이미 업로드된 원격 URL과 구분 */
export const isLocalUri = (uri: string) => !/^https?:\/\//.test(uri)

/**
 * 명인 프로필 파일을 R2에 업로드하고 공개 URL을 요청 순서대로 반환.
 * 프로필 반영은 별도로 PATCH /expert-profiles/me (portfolioImageUrls / educationPdfUrl).
 */
export async function uploadExpertFiles(kind: 'image' | 'pdf', files: LocalFile[]): Promise<string[]> {
  if (files.length === 0) return []
  const formData = new FormData()
  for (const file of files) {
    const name = file.name ?? file.uri.split('/').pop() ?? `file-${Date.now()}`
    const ext = /\.(\w+)$/.exec(name)?.[1]?.toLowerCase() ?? ''
    const type = file.mimeType ?? MIME_BY_EXT[ext] ?? 'image/jpeg'
    // React Native의 FormData는 { uri, name, type } 형태를 파일로 인식함
    formData.append('files', { uri: file.uri, name, type } as unknown as Blob)
  }
  const { data } = await apiClient.post<{ data: { urls: string[] } }>(
    '/expert-profiles/me/uploads',
    formData,
    { params: { kind }, headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data.data.urls
}
