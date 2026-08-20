import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { RootStackParamList } from '@/navigation/RootNavigator'

// Tab 내부 화면에서 Stack 루트로 navigate할 때 사용
// getParent()가 Tab 바깥의 NativeStack을 반환함
export function useRootNavigation() {
  const nav = useNavigation()
  return nav.getParent<NativeStackNavigationProp<RootStackParamList>>()
}
