import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

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

// access token(1h) 만료 시 refresh 후 원 요청 1회 재시도 — 갱신 로직이 없으면 장시간 사용 중 모든 API가 401
// refresh token은 회전(사용 시 폐기)되므로 동시 401은 하나의 refresh 요청을 공유
let refreshing: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setTokens } = useAuthStore.getState()
  if (!refreshToken) throw new Error('refresh token 없음')
  const { data } = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
    `${apiClient.defaults.baseURL}/auth/refresh`,
    { refreshToken },
    { timeout: 10000 }
  )
  setTokens(data.data.accessToken, data.data.refreshToken)
  return data.data.accessToken
}

apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
  if (
    error.response?.status !== 401 ||
    !config ||
    config._retried ||
    // 로그인·가입·refresh 자체의 401은 갱신 대상 아님 (로그아웃·탈퇴는 갱신 후 재시도)
    (config.url?.startsWith('/auth/') && !/^\/auth\/(logout|withdraw)/.test(config.url))
  ) {
    throw error
  }
  config._retried = true
  try {
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null
    })
    const accessToken = await refreshing
    config.headers.Authorization = `Bearer ${accessToken}`
    return apiClient(config)
  } catch {
    throw error
  }
})
