import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? ''
// Google iOS 유형 OAuth 클라이언트는 콘솔에 Redirect URI를 등록하지 않고, 대신
// "역방향 클라이언트 ID"를 커스텀 URL 스킴으로 써서 리다이렉트를 받는다(app.json의
// ios.infoPlist.CFBundleURLTypes에 동일한 스킴이 등록되어 있어야 함).
const GOOGLE_URL_SCHEME = GOOGLE_IOS_CLIENT_ID
  ? `com.googleusercontent.apps.${GOOGLE_IOS_CLIENT_ID.replace('.apps.googleusercontent.com', '')}`
  : ''

const discovery = { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth', tokenEndpoint: 'https://oauth2.googleapis.com/token' }

// 구글 로그인은 Authorization Code + PKCE 플로우로 code를 받은 뒤, 프론트에서 직접
// 토큰 엔드포인트와 교환해 id_token을 얻는다(백엔드가 idToken을 검증하는 방식이라
// 카카오처럼 code를 그대로 넘길 수 없음).
export function useGoogleAuth() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: GOOGLE_URL_SCHEME })
  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_IOS_CLIENT_ID,
      scopes: ['openid', 'email', 'profile'],
      redirectUri,
      usePKCE: true,
    },
    discovery
  )

  const promptGoogle = async (): Promise<{ idToken: string } | null> => {
    if (!GOOGLE_IOS_CLIENT_ID) {
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
        clientId: GOOGLE_IOS_CLIENT_ID,
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
