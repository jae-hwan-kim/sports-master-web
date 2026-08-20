import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? ''
// 카카오에 등록된 redirect_uri(http만 허용) — 백엔드 GET /auth/kakao/callback이 이 값을 받아
// 최종적으로 앱 커스텀 스킴(sportsmaster://oauth/kakao)으로 다시 리다이렉트해준다.
// 안드로이드 에뮬레이터의 localhost는 에뮬레이터 자신을 가리켜 호스트 Mac에 못 닿으므로
// 10.0.2.2(에뮬레이터 → 호스트 루프백 별칭)로 바꿔써야 한다 — 두 값 다 카카오 콘솔에
// Redirect URI로 등록되어 있어야 함.
const KAKAO_AUTHORIZE_REDIRECT_URI = (() => {
  const base = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI ?? ''
  return Platform.OS === 'android' ? base.replace('localhost', '10.0.2.2') : base
})()
// openAuthSessionAsync가 인증 완료로 감지할 앱 스킴 — 위 콜백이 리다이렉트하는 대상과 일치해야 함
const APP_RETURN_URL = 'sportsmaster://oauth/kakao'

// 구글과 달리 useAuthRequest를 못 쓴다 — 카카오 authorize 요청의 redirect_uri(백엔드 콜백)와
// 브라우저 세션 종료를 감지할 앱 스킴이 서로 다르기 때문에, 저수준 API로 직접 URL을 구성한다.
export function useKakaoAuth() {
  const promptKakao = async (): Promise<{ code: string; redirectUri: string } | null> => {
    if (!KAKAO_REST_API_KEY || !KAKAO_AUTHORIZE_REDIRECT_URI) {
      throw new Error('KAKAO_NOT_CONFIGURED')
    }

    const authUrl =
      'https://kauth.kakao.com/oauth/authorize' +
      `?response_type=code&client_id=${encodeURIComponent(KAKAO_REST_API_KEY)}` +
      `&redirect_uri=${encodeURIComponent(KAKAO_AUTHORIZE_REDIRECT_URI)}`

    const result = await WebBrowser.openAuthSessionAsync(authUrl, APP_RETURN_URL)
    if (result.type !== 'success' || !result.url) {
      return null
    }

    const code = new URL(result.url).searchParams.get('code')
    // 백엔드가 토큰 교환 시 이 요청에 실제로 쓰인 redirect_uri를 그대로 알아야
    // 카카오의 "code 발급 때와 동일한 redirect_uri" 검증을 통과할 수 있다.
    return code ? { code, redirectUri: KAKAO_AUTHORIZE_REDIRECT_URI } : null
  }

  return { promptKakao }
}
