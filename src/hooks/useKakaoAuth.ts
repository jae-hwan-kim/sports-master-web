import * as WebBrowser from 'expo-web-browser'

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? ''
// 카카오에 등록된 redirect_uri(http만 허용) — 백엔드 GET /auth/kakao/callback이 이 값을 받아
// 최종적으로 앱 커스텀 스킴(sportsmaster://oauth/kakao)으로 다시 리다이렉트해준다.
const KAKAO_AUTHORIZE_REDIRECT_URI = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI ?? ''
// openAuthSessionAsync가 인증 완료로 감지할 앱 스킴 — 위 콜백이 리다이렉트하는 대상과 일치해야 함
const APP_RETURN_URL = 'sportsmaster://oauth/kakao'

// 구글과 달리 useAuthRequest를 못 쓴다 — 카카오 authorize 요청의 redirect_uri(백엔드 콜백)와
// 브라우저 세션 종료를 감지할 앱 스킴이 서로 다르기 때문에, 저수준 API로 직접 URL을 구성한다.
export function useKakaoAuth() {
  const promptKakao = async (): Promise<{ code: string } | null> => {
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
    return code ? { code } : null
  }

  return { promptKakao }
}
