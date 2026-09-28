import axios from 'axios'

import { Platform } from 'react-native'

import { useAuthStore } from '@/store/authStore'

const apiUrl = process.env.EXPO_PUBLIC_API_URL

if (!apiUrl && !__DEV__) {
  throw new Error(
    'EXPO_PUBLIC_API_URL 환경변수가 설정되지 않았습니다. 프로덕션 빌드에는 반드시 설정이 필요합니다.'
  )
}

// 안드로이드 에뮬레이터의 localhost는 에뮬레이터 자신을 가리켜 호스트 Mac에 못 닿으므로
// 10.0.2.2(에뮬레이터 → 호스트 루프백 별칭)로 바꿔써야 한다. iOS 시뮬레이터는 호스트
// 네트워크를 공유해 localhost 그대로 써도 된다.
const devFallbackUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: apiUrl ?? devFallbackUrl,
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
