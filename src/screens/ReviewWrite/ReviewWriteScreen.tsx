import { useCallback, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { ArrowBackIcon, StarFillIcon, StarNoneIcon } from '@/assets/icons'
import { Text, TextInput } from '@/components/AppText'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList>
type RouteProp = { key: string; name: 'ReviewWrite'; params: { expertProfileId: number; expertName?: string } }

const MAX_LENGTH = 500

export function ReviewWriteScreen() {
  const navigation = useNavigation<NavProp>()
  const route = useRoute<RouteProp>()
  const insets = useSafeAreaInsets()

  const { expertName } = route.params

  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')

  const canSubmit = rating > 0

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return
    // TODO: POST /reviews API 연동 확정 후 구현
    navigation.goBack()
  }, [canSubmit, navigation])

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F2F2F2]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: insets.top }}
    >
      {/* 네비바 */}
      <View className="h-[60px] flex-row items-center justify-between px-4">
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          onPress={() => navigation.goBack()}
        >
          <ArrowBackIcon />
        </Pressable>
        <Text
          className="text-[17px] text-[#1F2A43]"
          style={{ fontFamily: 'Pretendard-SemiBold' }}
        >
          리뷰 작성
        </Text>
        <View className="w-[44px]" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
      >
        {/* 명인명 */}
        {expertName && (
          <Text
            className="mt-4 text-[20px] text-[#1F2A43]"
            style={{ fontFamily: 'Pretendard-ExtraBold' }}
          >
            {expertName}
          </Text>
        )}

        {/* 별점 */}
        <Text
          className="mt-6 mb-3 text-[16px] text-[#1F2A43]"
          style={{ fontFamily: 'Pretendard-SemiBold' }}
        >
          별점
        </Text>
        <View className="flex-row gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} hitSlop={8} onPress={() => setRating(n)}>
              {n <= rating ? <StarFillIcon size={36} /> : <StarNoneIcon size={36} />}
            </Pressable>
          ))}
        </View>

        {/* 리뷰 내용 */}
        <Text
          className="mt-6 mb-3 text-[16px] text-[#1F2A43]"
          style={{ fontFamily: 'Pretendard-SemiBold' }}
        >
          리뷰 내용
        </Text>
        <View
          className="rounded-[4px] bg-white px-4 py-3"
          style={Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 0.11,
              shadowRadius: 2.9,
            },
            android: { elevation: 2 },
          })}
        >
          <TextInput
            value={content}
            onChangeText={(t) => setContent(t.slice(0, MAX_LENGTH))}
            placeholder="명인과의 경험을 자유롭게 작성해 주세요"
            placeholderTextColor="#A2A2A2"
            multiline
            textAlignVertical="top"
            style={{
              fontFamily: 'Pretendard-Medium',
              fontSize: 14,
              color: '#1F2A43',
              minHeight: 140,
            }}
          />
          <Text
            className="mt-2 text-right text-[11px] text-[#A2A2A2]"
            style={{ fontFamily: 'Pretendard-Medium' }}
          >
            {content.length}/{MAX_LENGTH}
          </Text>
        </View>

        {/* 제출 버튼 */}
        <Pressable
          hitSlop={8}
          onPress={handleSubmit}
          disabled={!canSubmit}
          className="mt-8 h-[52px] items-center justify-center rounded-[8px]"
          style={{ backgroundColor: canSubmit ? '#1F2A43' : '#D9D9D9' }}
        >
          <Text
            className="text-[16px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            등록하기
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
