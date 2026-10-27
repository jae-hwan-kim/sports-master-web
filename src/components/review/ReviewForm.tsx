import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'

import { Image } from 'expo-image'

import { StarFillIcon, StarNoneIcon } from '@/assets/icons'
import { Text, TextInput } from '@/components/AppText'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useScreenInsets } from '@/hooks/useScreenInsets'

export const REVIEW_MAX_LENGTH = 200

const PANEL_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  android: { elevation: 4 },
})

export const REVIEW_CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#8B8B8B',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  android: { elevation: 3 },
})

const STARS = [1, 2, 3, 4, 5]

export function ExpertAvatar({ uri, size }: { uri: string | null | undefined; size: number }) {
  return uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
    />
  ) : (
    <View className="rounded-full bg-primary" style={{ width: size, height: size }} />
  )
}

type Props = {
  title: string
  avatarUri: string | null | undefined
  rating: number
  content: string
  // 없으면 읽기 전용 (내가작성한리뷰확인)
  onRatingChange?: (rating: number) => void
  onContentChange?: (content: string) => void
  onBack: () => void
  footer: React.ReactNode
}

// Figma 리뷰작성_작성페이지 / 내가작성한리뷰확인·수정 공통 — 제목, 명인 사진(104), 별점(41, 간격 50),
// 후기 입력칸(350x196), 하단 버튼
export function ReviewForm({
  title,
  avatarUri,
  rating,
  content,
  onRatingChange,
  onContentChange,
  onBack,
  footer,
}: Props) {
  const insets = useScreenInsets()
  const editable = !!onContentChange

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader onBack={onBack} />

      <View className="mt-4 flex-1 rounded-t-2xl bg-white" style={PANEL_SHADOW}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: insets.bottom + 32 }}
        >
          <Text className="mt-[41px] text-center font-pretendard-extrabold text-[24px] leading-[32px] text-gray3">
            {title}
          </Text>

          <View className="mt-7 items-center">
            <ExpertAvatar uri={avatarUri} size={104} />
          </View>

          <View className="flex-row justify-center">
            {STARS.map((star) => (
              <Pressable
                key={star}
                disabled={!onRatingChange}
                onPress={() => onRatingChange?.(star)}
                accessibilityRole="button"
                accessibilityLabel={`${star}점`}
                accessibilityState={{ selected: star <= rating }}
                className="h-[75px] w-[50px] items-center justify-center"
              >
                {star <= rating ? <StarFillIcon size={75} /> : <StarNoneIcon size={75} />}
              </Pressable>
            ))}
          </View>

          <View
            className="mt-[14px] h-[196px] rounded-[8px] bg-white px-4 pb-4 pt-[18px]"
            style={REVIEW_CARD_SHADOW}
          >
            <TextInput
              value={content}
              editable={editable}
              onChangeText={(t) => onContentChange?.(t.slice(0, REVIEW_MAX_LENGTH))}
              placeholder={editable ? '명인과의 경험을 자유롭게 작성해 주세요' : ''}
              placeholderTextColor="#A2A2A2"
              multiline
              textAlignVertical="top"
              className="flex-1 font-pretendard-medium text-[14px] text-gray3"
              style={{ paddingVertical: 0 }}
            />
            {editable && (
              <Text className="text-right font-pretendard-medium text-[14px] text-primary">
                {content.length}/{REVIEW_MAX_LENGTH}
              </Text>
            )}
          </View>

          <View className="mt-[35px]">{footer}</View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}
