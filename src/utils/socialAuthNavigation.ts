import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { RootStackParamList } from '@/navigation/RootNavigator'
import type { components } from '@/types/schema'

type CurrentMode = components['schemas']['AuthUserDto']['currentMode']

type AuthNavigationInfo = {
  // 이메일 로그인처럼 isNewUser 개념이 없는 경우 생략 가능(로그인=항상 기존 유저로 취급)
  isNewUser?: boolean
  hasSelectedMode: boolean
  currentMode: CurrentMode
}

// 로그인/가입(이메일·소셜 공통) 성공 후 어디로 이동할지 결정하는 공용 분기.
// 신규 유저이거나 모드를 아직 확정 안 한 유저(=모드선택 중 이탈 후 재진입 포함)는 모드선택으로,
// 그 외에는 이미 정해진 모드에 맞는 홈으로 보낸다.
export function navigateAfterAuth(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  { isNewUser, hasSelectedMode, currentMode }: AuthNavigationInfo
) {
  if (isNewUser || !hasSelectedMode) {
    navigation.navigate('SignUpRoleSelect')
    return
  }
  navigation.navigate(currentMode === 'expert' ? 'MasterHome' : 'CustomerHome')
}
