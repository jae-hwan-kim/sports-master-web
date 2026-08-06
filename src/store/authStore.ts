import { create } from 'zustand'

// TODO: 자동로그인 영속화를 위해 expo-secure-store 설치 후 persist 미들웨어 연동 필요
// (현재는 앱 재시작 시 토큰이 사라짐 — AuthController_refresh 연동은 SecureStore 도입 이후 진행)
type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  autoLogin: boolean
  setTokens: (accessToken: string, refreshToken: string) => void
  setAutoLogin: (value: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  autoLogin: false,
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setAutoLogin: (autoLogin) => set({ autoLogin }),
  clear: () => set({ accessToken: null, refreshToken: null, autoLogin: false }),
}))
