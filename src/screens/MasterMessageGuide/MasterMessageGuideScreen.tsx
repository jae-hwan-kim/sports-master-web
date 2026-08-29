import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ScreenHeader } from '@/components/ScreenHeader'
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

export function MasterMessageGuideScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} />

      <View className="px-6 pt-[34px] pb-[35px]">
        <Text className="text-[28px] font-extrabold text-black">기본 문구 가이드라인</Text>
        <Text className="mt-2 text-[13px] font-medium text-gray2">
          {'처음 고객과 소통하는 명인을 위한 가이드 라인입니다!\n필수는 아니며, 오픈 채팅방의 인사말로 복사해 사용 가능합니다'}
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
          contentContainerStyle={{ paddingHorizontal: 26, paddingTop: 36, paddingBottom: insets.bottom + 24 }}
        >
          <Text style={{ color: '#07091C', fontSize: 16, fontFamily: 'Pretendard-Medium', lineHeight: 26 }}>
            {GUIDE_TEXT}
          </Text>
        </ScrollView>
      </View>
    </View>
  )
}
