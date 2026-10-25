import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'

import { useRef, useState } from 'react'
import { type GestureResponderEvent, Platform, ScrollView, View } from 'react-native'

import * as Clipboard from 'expo-clipboard'

import { Text, TextInput } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

const GUIDE_TEXT = `안녕하세요, 운동명인 OOO입니다😊

어떤 증상이 있으신가요?
아래 양식에 맞춰 작성해주시면
응답 시간 내에 신속히 답변 드리겠습니다🍀
(채팅 응답시간 00시~00시)

1. 성함
2. 고객코드
3. 증상을 상세히 작성해주세요
   (증상이 없다면 '없음'으로 기제부탁드립니다)
4. 예약 희망 월/일/시간 (ex. 7월 13일 14시)`

const TAP_MAX_MS = 300
const TAP_SLOP = 10
const SELECTION_GRACE_MS = 5000

const GUIDE_TEXT_STYLE = {
  color: '#07091C',
  fontSize: 16,
  fontFamily: 'Pretendard-Medium',
  lineHeight: 26,
  padding: 0,
} as const

export function MasterMessageGuideScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useScreenInsets()
  const [copiedVisible, setCopiedVisible] = useState(false)

  const [copyFailedVisible, setCopyFailedVisible] = useState(false)

  const copyAll = async () => {
    try {
      await Clipboard.setStringAsync(GUIDE_TEXT)
      setCopiedVisible(true)
    } catch (error) {
      Sentry.captureException(error, { tags: { flow: 'copyMessageGuide' } })
      setCopyFailedVisible(true)
    }
  }

  // 짧은 탭(이동·길게 누르기 아님)만 전체 복사로 처리
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null)
  // 길게 눌러 영역 선택한 뒤 선택 해제용 탭이 전체 복사로 이어지지 않도록
  const lastLongPressAt = useRef(0)
  const handleTouchStart = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent
    touchStart.current = { x: pageX, y: pageY, t: Date.now() }
  }
  const handleTouchEnd = (e: GestureResponderEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const { pageX, pageY } = e.nativeEvent
    const now = Date.now()
    if (now - start.t >= TAP_MAX_MS) {
      lastLongPressAt.current = now
      return
    }
    const moved = Math.abs(pageX - start.x) > TAP_SLOP || Math.abs(pageY - start.y) > TAP_SLOP
    if (!moved && now - lastLongPressAt.current > SELECTION_GRACE_MS) void copyAll()
  }

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} />

      <View className="px-6 pb-[35px] pt-[34px]">
        <Text className="text-[28px] font-extrabold text-black">기본 문구 가이드라인</Text>
        <Text className="mt-2 text-[13px] font-medium text-gray2">
          {
            '처음 고객과 소통하는 명인을 위한 가이드 라인입니다!\n필수는 아니며, 오픈 채팅방의 인사말로 복사해 사용 가능합니다'
          }
        </Text>
      </View>

      {/* Figma 1125:5092 — shadow로 상단 경계 표현, bg는 배경과 동일한 #F2F2F2 */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#F2F2F2',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 5,
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 26,
            paddingTop: 36,
            paddingBottom: insets.bottom + 24,
          }}
        >
          {/* 탭 → 전체 복사, 꾹 누르기 → OS 기본 영역 선택 복사.
              onPress를 주면 RN 터치가 길게 누르기를 가져가 영역 선택이 막혀서, 원시 터치 이벤트로 짧은 탭만 감지.
              iOS Text selectable은 전체 복사만 지원해 읽기 전용 TextInput으로 영역 선택 제공 */}
          <View onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {Platform.OS === 'ios' ? (
              <TextInput
                value={GUIDE_TEXT}
                editable={false}
                multiline
                scrollEnabled={false}
                style={GUIDE_TEXT_STYLE}
              />
            ) : (
              <Text selectable style={GUIDE_TEXT_STYLE}>
                {GUIDE_TEXT}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      <ConfirmDialog
        visible={copiedVisible}
        title="복사 완료"
        description="오픈 채팅방 인사말로 붙여넣어 사용하세요"
        onConfirm={() => setCopiedVisible(false)}
      />

      <ConfirmDialog
        visible={copyFailedVisible}
        title="복사 실패"
        description="잠시 후 다시 시도해주세요"
        onConfirm={() => setCopyFailedVisible(false)}
      />
    </View>
  )
}
