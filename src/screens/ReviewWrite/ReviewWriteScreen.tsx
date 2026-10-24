import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from 'react-native'

import { Image } from 'expo-image'

import { ArrowBackIcon, StarFillIcon, StarNoneIcon } from '@/assets/icons'
import { Text, TextInput } from '@/components/AppText'
import { StarRating } from '@/components/StarRating'
import { useCreateReview } from '@/hooks/useCreateReview'
import { DiagnosisSentItem, useReviewableExperts } from '@/hooks/useReviewableExperts'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList>

const MAX_LENGTH = 300

// ---------------------------------------------------------------------------
// 명인 카드 (단계 1)
// ---------------------------------------------------------------------------

type ExpertCardProps = {
  item: DiagnosisSentItem
  onSelect: (item: DiagnosisSentItem) => void
}

function ExpertCard({ item, onSelect }: ExpertCardProps) {
  const disabled = item.hasWrittenReview

  return (
    <Pressable
      hitSlop={8}
      disabled={disabled}
      onPress={() => onSelect(item)}
      className={`flex-row items-center rounded-[8px] bg-white px-4 py-3 ${disabled ? 'opacity-45' : 'border-[1.5px] border-[#1F2A43]'}`}
      style={Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: { elevation: 2 },
      })}
    >
      {/* 아바타 */}
      {item.expertAvatarUrl ? (
        <Image
          source={{ uri: item.expertAvatarUrl }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          contentFit="cover"
        />
      ) : (
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 44, height: 44, backgroundColor: '#C6A75E' }}
        />
      )}

      {/* 명인 정보 */}
      <View className="ml-3 flex-1">
        <Text className="text-[15px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-SemiBold' }}>
          {item.expertName}
        </Text>
        <Text
          className="mt-[2px] text-[12px] text-[#74768E]"
          style={{ fontFamily: 'Pretendard-Medium' }}
        >
          {item.expertGrade}
        </Text>
      </View>

      {/* 리뷰 작성 완료 뱃지 */}
      {item.hasWrittenReview && (
        <View className="rounded-full bg-[#D9D9D9] px-3 py-1">
          <Text className="text-[11px] text-[#74768E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            작성완료
          </Text>
        </View>
      )}
    </Pressable>
  )
}

// ---------------------------------------------------------------------------
// 단계 1 — 명인 선택
// ---------------------------------------------------------------------------

type StepSelectProps = {
  onSelect: (item: DiagnosisSentItem) => void
  onBack: () => void
  insets: { top: number; bottom: number }
}

function StepSelectExpert({ onSelect, onBack, insets }: StepSelectProps) {
  const { data: experts, isLoading, isError } = useReviewableExperts()

  const renderItem = useCallback(
    ({ item }: { item: DiagnosisSentItem }) => <ExpertCard item={item} onSelect={onSelect} />,
    [onSelect]
  )

  const keyExtractor = useCallback((item: DiagnosisSentItem) => String(item.expertProfileId), [])

  return (
    <View className="flex-1 bg-[#F2F2F2]" style={{ paddingTop: insets.top }}>
      {/* 네비바 */}
      <View className="h-[60px] flex-row items-center justify-between px-4">
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          onPress={onBack}
        >
          <ArrowBackIcon />
        </Pressable>
        <Text className="text-[17px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-SemiBold' }}>
          리뷰 작성
        </Text>
        <View className="w-[44px]" />
      </View>

      {/* 안내 텍스트 */}
      <View className="px-5 pb-3">
        <Text className="text-[13px] text-[#74768E]" style={{ fontFamily: 'Pretendard-Medium' }}>
          진단을 요청한 명인을 선택하세요
        </Text>
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1F2A43" />
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[14px] text-[#74768E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            목록을 불러오지 못했습니다
          </Text>
        </View>
      )}

      {!isLoading && !isError && (!experts || experts.length === 0) && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[14px] text-[#74768E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            진단을 요청한 명인이 없습니다
          </Text>
        </View>
      )}

      {!isLoading && !isError && experts && experts.length > 0 && (
        <FlatList
          data={experts}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 32,
            gap: 10,
          }}
        />
      )}
    </View>
  )
}

// ---------------------------------------------------------------------------
// 단계 2 — 리뷰 작성
// ---------------------------------------------------------------------------

type StepWriteProps = {
  expert: DiagnosisSentItem
  onBack: () => void
  insets: { top: number; bottom: number }
}

function StepWriteReview({ expert, onBack, insets }: StepWriteProps) {
  const navigation = useNavigation<NavProp>()
  const { mutate: createReview, isPending } = useCreateReview()

  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')

  const canSubmit = rating > 0 && !isPending

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return
    createReview(
      {
        expertProfileId: expert.expertProfileId,
        rating,
        comment: content.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigation.goBack()
        },
      }
    )
  }, [canSubmit, createReview, expert.expertProfileId, rating, content, navigation])

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
          onPress={onBack}
        >
          <ArrowBackIcon />
        </Pressable>
        <Text className="text-[17px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-SemiBold' }}>
          리뷰 작성
        </Text>
        <View className="w-[44px]" />
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
        ListHeaderComponent={
          <>
            {/* 선택된 명인 */}
            <View className="mt-4 flex-row items-center rounded-[8px] bg-white px-4 py-3">
              {expert.expertAvatarUrl ? (
                <Image
                  source={{ uri: expert.expertAvatarUrl }}
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                  contentFit="cover"
                />
              ) : (
                <View
                  className="items-center justify-center rounded-full"
                  style={{ width: 44, height: 44, backgroundColor: '#C6A75E' }}
                />
              )}
              <View className="ml-3 flex-1">
                <Text
                  className="text-[15px] text-[#1F2A43]"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  {expert.expertName}
                </Text>
                <Text
                  className="mt-[2px] text-[12px] text-[#74768E]"
                  style={{ fontFamily: 'Pretendard-Medium' }}
                >
                  {expert.expertGrade}
                </Text>
              </View>
            </View>

            {/* 별점 */}
            <Text
              className="mb-3 mt-6 text-[16px] text-[#1F2A43]"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              별점
            </Text>
            <StarRating
              value={rating}
              size={36}
              onChange={setRating}
              renderStar={({ size, filled }) =>
                filled ? <StarFillIcon size={size} /> : <StarNoneIcon size={size} />
              }
            />

            {/* 리뷰 내용 */}
            <Text
              className="mb-3 mt-6 text-[16px] text-[#1F2A43]"
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
              className={`mt-8 h-[52px] items-center justify-center rounded-[8px] ${canSubmit ? 'bg-[#1F2A43]' : 'bg-[#D9D9D9]'}`}
            >
              {isPending ? (
                <ActivityIndicator color="#F2F2F2" />
              ) : (
                <Text
                  className="text-[16px] text-[#F2F2F2]"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  등록하기
                </Text>
              )}
            </Pressable>
          </>
        }
      />
    </KeyboardAvoidingView>
  )
}

// ---------------------------------------------------------------------------
// Screen (2단계 상태 관리)
// ---------------------------------------------------------------------------

export function ReviewWriteScreen() {
  const navigation = useNavigation<NavProp>()
  const insets = useScreenInsets()

  const [selectedExpert, setSelectedExpert] = useState<DiagnosisSentItem | null>(null)

  if (selectedExpert === null) {
    return (
      <StepSelectExpert
        onSelect={setSelectedExpert}
        onBack={() => navigation.goBack()}
        insets={insets}
      />
    )
  }

  return (
    <StepWriteReview
      expert={selectedExpert}
      onBack={() => setSelectedExpert(null)}
      insets={insets}
    />
  )
}
