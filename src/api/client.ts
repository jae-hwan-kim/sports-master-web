import axios from 'axios'

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
