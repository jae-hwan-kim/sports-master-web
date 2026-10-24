import * as SecureStore from 'expo-secure-store'

import { apiClient } from '@/api/client'
import { SECURE_SESSION_KEY, useAuthStore } from '@/store/authStore'
import type { components } from '@/types/schema'

type CurrentMode = components['schemas']['AuthUserDto']['currentMode']
type SocialProvider = components['schemas']['AuthUserDto']['socialProvider']

type PersistedSession = {
  refreshToken: string
  currentMode: CurrentMode
  hasSelectedMode: boolean
  socialProvider: SocialProvider | null
  name?: string | null
}

export type RestoredSession = {
  currentMode: CurrentMode
  hasSelectedMode: boolean
}

export async function restoreAutoLoginSession(): Promise<RestoredSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SECURE_SESSION_KEY)
    if (!raw) return null

    const session: PersistedSession = JSON.parse(raw)

    const { data } = await apiClient.post<{
      data: { accessToken: string; refreshToken: string }
    }>('/auth/refresh', { refreshToken: session.refreshToken })

    const store = useAuthStore.getState()
    store.setAutoLogin(true)
    store.setAuthSession(data.data.accessToken, data.data.refreshToken, {
      currentMode: session.currentMode,
      hasSelectedMode: session.hasSelectedMode,
      socialProvider: session.socialProvider ?? 'local',
      name: session.name ?? '',
    })

    return { currentMode: session.currentMode, hasSelectedMode: session.hasSelectedMode }
  } catch {
    await SecureStore.deleteItemAsync(SECURE_SESSION_KEY).catch(() => {})
    return null
  }
}
