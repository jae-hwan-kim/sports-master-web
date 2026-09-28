import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { Platform } from 'react-native'

// iOS 유형 클라이언트 ID — iOS에서 발급되는 idToken의 aud 값이 된다.
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? ''
// Android는 Web 유형 클라이언트 ID로 idToken을 발급받는다(aud = Web client ID).
// 앱 신뢰성은 Google Play services가 패키지명 + SHA-1을 Android 유형 클라이언트와
// 대조해 검증하므로, Android client ID를 앱 코드에서 직접 쓸 일은 없다.
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? ''

// 브라우저 기반 OAuth(expo-auth-session)를 쓰지 않는 이유: Google이 Android 유형
// 클라이언트의 custom URI scheme 리다이렉트를 기본 차단해(400 invalid_request,
// "Custom URI scheme is not enabled for your Android client") 해당 플로우가 Android에서
// 동작하지 않는다. 콘솔에서 예외적으로 켤 수는 있으나 deprecated 경로라 재발 위험이
// 있어, Google이 권장하는 네이티브 SDK(Play services / Credential Manager)를 쓴다.
export function useGoogleAuth() {
  const promptGoogle = async (): Promise<{ idToken: string } | null> => {
    const requiredClientId = Platform.OS === 'android' ? GOOGLE_WEB_CLIENT_ID : GOOGLE_IOS_CLIENT_ID
    // configure에 빈 클라이언트 ID를 넘기면 네이티브 SDK가 앱 시작 시점에 터지므로,
    // 모듈 로드 시점이 아니라 실제 로그인 직전에 값을 확인하고 설정한다(호출은 멱등).
    if (!requiredClientId) {
      throw new Error('GOOGLE_CLIENT_ID_NOT_SET')
    }
    GoogleSignin.configure({
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
    })

    try {
      // Android 전용 사전 점검 — iOS에서는 no-op으로 true를 반환한다.
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      // 직전 세션이 캐시되어 있으면 계정 선택 없이 같은 계정으로 재로그인되므로 매번 초기화
      await GoogleSignin.signOut()

      const response = await GoogleSignin.signIn()
      if (!isSuccessResponse(response)) {
        // 사용자가 계정 선택을 취소한 경우 — 에러로 취급하지 않고 조용히 종료
        return null
      }

      const { idToken } = response.data
      return idToken ? { idToken } : null
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return null
      }
      throw error
    }
  }

  return { promptGoogle }
}
