import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { type SettingMenuItem, SettingsMenu } from '@/components/settings/SettingsMenu'
import { RootStackParamList } from '@/navigation/RootNavigator'

export function MasterSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const items: SettingMenuItem[] = [
    {
      id: 'profile',
      label: '개인 정보 관리',
      onPress: () => navigation.navigate('MasterProfileEdit'),
    },
    {
      id: 'guide',
      label: '기본 문구 가이드라인',
      onPress: () => navigation.navigate('MasterMessageGuide'),
    },
  ]

  return <SettingsMenu items={items} />
}
