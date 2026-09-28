import * as AppleAuthentication from 'expo-apple-authentication'
import { Platform } from 'react-native'

// Apple Sign In은 iOS 13+ 에서만 사용 가능.
// expo-apple-authentication 제공 signInAsync()를 통해 identityToken과
// authorizationCode를 받아 백엔드 /auth/apple에 전달한다.
export function useAppleAuth() {
  const promptApple = async (): Promise<{
    identityToken: string
    authorizationCode?: string
  } | null> => {
    if (Platform.OS !== 'ios') {
      throw new Error('APPLE_LOGIN_IOS_ONLY')
    }

    const isAvailable = await AppleAuthentication.isAvailableAsync()
    if (!isAvailable) {
      throw new Error('APPLE_LOGIN_NOT_AVAILABLE')
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (!credential.identityToken) {
        return null
      }

      return {
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode ?? undefined,
      }
    } catch (error: unknown) {
      // 사용자가 직접 취소한 경우 — 에러로 취급하지 않고 null 반환
      if (
        error instanceof Error &&
        (error as unknown as { code?: string }).code === 'ERR_REQUEST_CANCELED'
      ) {
        return null
      }
      throw error
    }
  }

  return { promptApple }
}
