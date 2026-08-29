import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? ''
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? ''
const GOOGLE_CLIENT_ID = Platform.OS === 'android' ? GOOGLE_ANDROID_CLIENT_ID : GOOGLE_IOS_CLIENT_ID

// Google iOS/Android 유형 OAuth 클라이언트 둘 다 콘솔에 Redirect URI를 등록하지 않고,
// 대신 각 플랫폼 클라이언트 ID의 "역방향 표기"를 커스텀 URL 스킴으로 써서 리다이렉트를
// 받는다 — 앱 커스텀 스킴(sportsmaster)이나 패키지명을 그대로 쓰면 invalid_request로
// 거부된다. app.json에 각 플랫폼별로 동일한 스킴이 등록되어 있어야 함
// (iOS: infoPlist.CFBundleURLTypes, Android: android.intentFilters).
const GOOGLE_URL_SCHEME = GOOGLE_CLIENT_ID
  ? `com.googleusercontent.apps.${GOOGLE_CLIENT_ID.replace('.apps.googleusercontent.com', '')}`
  : ''

const discovery = { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth', tokenEndpoint: 'https://oauth2.googleapis.com/token' }

 
console.log('[google-auth] module load', Platform.OS, {
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  resolvedClientId: GOOGLE_CLIENT_ID,
  scheme: GOOGLE_URL_SCHEME,
})

// 구글 로그인은 Authorization Code + PKCE 플로우로 code를 받은 뒤, 프론트에서 직접
// 토큰 엔드포인트와 교환해 id_token을 얻는다(백엔드가 idToken을 검증하는 방식이라
// 카카오처럼 code를 그대로 넘길 수 없음).
export function useGoogleAuth() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: GOOGLE_URL_SCHEME })
   
  console.log('[google-auth] hook render', Platform.OS, { redirectUri })
  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'email', 'profile'],
      redirectUri,
      usePKCE: true,
    },
    discovery
  )

  const promptGoogle = async (): Promise<{ idToken: string } | null> => {
     
    console.log('[google-auth] promptGoogle called', { hasClientId: !!GOOGLE_CLIENT_ID, hasRequest: !!request })
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID_NOT_SET')
    }
    if (!request) {
      return null
    }

    const result = await promptAsync()
    if (result.type !== 'success') {
      return null
    }

    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId: GOOGLE_CLIENT_ID,
        code: result.params.code,
        redirectUri,
        extraParams: { code_verifier: request.codeVerifier ?? '' },
      },
      discovery
    )

    if (!tokenResult.idToken) {
      return null
    }
    return { idToken: tokenResult.idToken }
  }

  return { promptGoogle }
}
