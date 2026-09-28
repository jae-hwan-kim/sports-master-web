import { create } from 'zustand'

import type { components } from '@/types/schema'

type CurrentMode = components['schemas']['AuthUserDto']['currentMode']
type SocialProvider = components['schemas']['AuthUserDto']['socialProvider']
// 로그인/가입/구글 등 인증 응답에 공통으로 실린 유저 정보 중 라우팅 분기에 필요한 최소 부분만 사용
type AuthUserInfo = {
  currentMode: CurrentMode
  hasSelectedMode: boolean
  socialProvider: SocialProvider
}

// TODO: 자동로그인 영속화를 위해 expo-secure-store 설치 후 persist 미들웨어 연동 필요
// (현재는 앱 재시작 시 토큰이 사라짐 — AuthController_refresh 연동은 SecureStore 도입 이후 진행)
type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  currentMode: CurrentMode | null
  hasSelectedMode: boolean
  socialProvider: SocialProvider | null
  autoLogin: boolean
  // 로그인/가입/소셜 로그인 성공 시 토큰+유저정보(모드 포함)를 한 번에 반영
  setAuthSession: (accessToken: string, refreshToken: string, user: AuthUserInfo) => void
  // 모드선택 화면에서 useSwitchMode 성공 시(토큰은 그대로, 모드만 갱신) 사용
  setModeSelected: (currentMode: CurrentMode) => void
  setAutoLogin: (value: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  currentMode: null,
  hasSelectedMode: false,
  socialProvider: null,
  autoLogin: false,
  setAuthSession: (accessToken, refreshToken, user) =>
    set({
      accessToken,
      refreshToken,
      currentMode: user.currentMode,
      hasSelectedMode: user.hasSelectedMode,
      socialProvider: user.socialProvider,
    }),
  setModeSelected: (currentMode) => set({ currentMode, hasSelectedMode: true }),
  setAutoLogin: (autoLogin) => set({ autoLogin }),
  clear: () =>
    set({
      accessToken: null,
      refreshToken: null,
      currentMode: null,
      hasSelectedMode: false,
      socialProvider: null,
      autoLogin: false,
    }),
}))
