import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { type SettingMenuItem, SettingsMenu } from '@/components/settings/SettingsMenu'
import { RootStackParamList } from '@/navigation/RootNavigator'

// 고객 설정 메뉴 — 명인 설정과 같은 구조, 기본 문구 가이드라인만 제외
// 개인 정보 관리 → 명인과 같은 개인 정보 관리 화면(MasterProfileEdit: 휴대전화·이메일·비밀번호, 공통 사용자 정보)
// 계정설정(지역·증상 등 고객 프로필)은 고객 프로필 화면의 계정설정 칩(CustomerSettings)에서 진입
export function CustomerSettingsMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const items: SettingMenuItem[] = [
    {
      id: 'profile',
      label: '개인 정보 관리',
      onPress: () => navigation.navigate('MasterProfileEdit'),
    },
  ]

  return <SettingsMenu items={items} />
}
