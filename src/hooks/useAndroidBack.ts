import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { useCallback, useRef } from 'react'
import { BackHandler, ToastAndroid } from 'react-native'

const EXIT_WINDOW_MS = 2000

// 화면이 포커스일 때만 Android 하드웨어 뒤로가기를 가로챔 — handler가 true를 반환하면 기본 동작 차단
export function useAndroidBack(handler: () => boolean) {
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handler)
      return () => sub.remove()
    }, [handler])
  )
}

// 홈(스택 최하단)에서 뒤로가기 한 번에 앱이 꺼지지 않도록 2초 안에 두 번 눌러야 종료
export function useDoubleBackToExit() {
  const navigation = useNavigation()
  const lastPressedAt = useRef(0)
  const handler = useCallback(() => {
    // 홈 아래에 돌아갈 화면이 있으면 기본 뒤로가기
    if (navigation.canGoBack()) return false
    const now = Date.now()
    if (now - lastPressedAt.current < EXIT_WINDOW_MS) {
      BackHandler.exitApp()
      return true
    }
    lastPressedAt.current = now
    ToastAndroid.show('뒤로 버튼을 한 번 더 누르면 종료됩니다', ToastAndroid.SHORT)
    return true
  }, [navigation])
  useAndroidBack(handler)
}
