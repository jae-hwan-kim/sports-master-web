import axios from 'axios'

import { useAuthStore } from '@/store/authStore'

const apiUrl = process.env.EXPO_PUBLIC_API_URL

if (!apiUrl && !__DEV__) {
  throw new Error(
    'EXPO_PUBLIC_API_URL 환경변수가 설정되지 않았습니다. 프로덕션 빌드에는 반드시 설정이 필요합니다.'
  )
}

export const apiClient = axios.create({
  baseURL: apiUrl ?? 'http://localhost:3000',
  timeout: 10000,
})

// JWT 인증이 필요한 엔드포인트(/home/*, /certifications 등) 호출 시 accessToken을 자동 첨부
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})
