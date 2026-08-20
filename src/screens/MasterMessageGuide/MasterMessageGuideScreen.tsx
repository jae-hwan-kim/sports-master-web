import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { FlatList, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ScreenHeader } from '@/components/ScreenHeader'
import { RootStackParamList } from '@/navigation/RootNavigator'

type GuideItem = { id: string; text: string }

// TODO: API 연동 후 서버에서 가져올 데이터
const GUIDE_MESSAGES: GuideItem[] = [
  { id: '1', text: '안녕하세요. 운동 관련 문의가 있으시면 편하게 연락해 주세요.' },
  { id: '2', text: '진단 요청을 해주시면 최대한 빠르게 답변드리겠습니다.' },
  { id: '3', text: '운동 목표와 현재 상태를 알려주시면 더 정확한 도움을 드릴 수 있습니다.' },
  { id: '4', text: '궁금한 점은 언제든지 채팅으로 문의해 주세요.' },
  { id: '5', text: '전문적인 운동 관리 서비스를 제공해 드리겠습니다.' },
]

export function MasterMessageGuideScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} />

      <View className="px-6 pt-[34px] pb-4">
        <Text className="text-[28px] font-extrabold text-black">기본 문구 가이드라인</Text>
        <Text className="mt-2 text-[13px] font-medium text-gray2">
          고객에게 발송되는 기본 안내 문구입니다
        </Text>
      </View>

      <FlatList
        data={GUIDE_MESSAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        renderItem={({ item }) => (
          <View>
            <View className="bg-white px-6 py-5">
              <Text className="text-[15px] font-medium leading-6 text-gray3">{item.text}</Text>
            </View>
            <View className="h-px bg-gray1" />
          </View>
        )}
      />
    </View>
  )
}
