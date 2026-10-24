import { create } from 'zustand'

import * as SecureStore from 'expo-secure-store'

import type { components } from '@/types/schema'

export const SECURE_SESSION_KEY = 'auth.session'

type CurrentMode = components['schemas']['AuthUserDto']['currentMode']
type SocialProvider = components['schemas']['AuthUserDto']['socialProvider']
// 로그인/가입/구글 등 인증 응답에 공통으로 실린 유저 정보 중 라우팅 분기에 필요한 최소 부분만 사용
type AuthUserInfo = {
  currentMode: CurrentMode
  hasSelectedMode: boolean
  socialProvider: SocialProvider
  name: string
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  currentMode: CurrentMode | null
  hasSelectedMode: boolean
  socialProvider: SocialProvider | null
  name: string | null
  autoLogin: boolean
  // 로그인/가입/소셜 로그인 성공 시 토큰+유저정보(모드 포함)를 한 번에 반영
  setAuthSession: (accessToken: string, refreshToken: string, user: AuthUserInfo) => void
  // 모드선택 화면에서 useSwitchMode 성공 시(토큰은 그대로, 모드만 갱신) 사용
  setModeSelected: (currentMode: CurrentMode) => void
  setAutoLogin: (value: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  currentMode: null,
  hasSelectedMode: false,
  socialProvider: null,
  name: null,
  autoLogin: false,
  setAuthSession: (accessToken, refreshToken, user) => {
    if (get().autoLogin) {
      SecureStore.setItemAsync(
        SECURE_SESSION_KEY,
        JSON.stringify({
          refreshToken,
          currentMode: user.currentMode,
          hasSelectedMode: user.hasSelectedMode,
          socialProvider: user.socialProvider,
          name: user.name,
        })
      ).catch(() => {})
    }
    set({
      accessToken,
      refreshToken,
      currentMode: user.currentMode,
      hasSelectedMode: user.hasSelectedMode,
      socialProvider: user.socialProvider,
      name: user.name,
    })
  },
  setModeSelected: (currentMode) => set({ currentMode, hasSelectedMode: true }),
  setAutoLogin: (autoLogin) => {
    set({ autoLogin })
    if (autoLogin) {
      const { refreshToken, currentMode, hasSelectedMode, socialProvider, name } = get()
      if (refreshToken) {
        SecureStore.setItemAsync(
          SECURE_SESSION_KEY,
          JSON.stringify({ refreshToken, currentMode, hasSelectedMode, socialProvider, name })
        ).catch(() => {})
      }
    } else {
      SecureStore.deleteItemAsync(SECURE_SESSION_KEY).catch(() => {})
    }
  },
  clear: () => {
    SecureStore.deleteItemAsync(SECURE_SESSION_KEY).catch(() => {})
    set({
      accessToken: null,
      refreshToken: null,
      currentMode: null,
      hasSelectedMode: false,
      socialProvider: null,
      name: null,
      autoLogin: false,
    })
  },
}))
