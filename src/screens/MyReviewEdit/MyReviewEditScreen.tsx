import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native'

import { ArrowBackIcon, StarFillIcon, StarNoneIcon } from '@/assets/icons'
import { Text, TextInput } from '@/components/AppText'
import { StarRating } from '@/components/StarRating'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { useUpdateReview } from '@/hooks/useUpdateReview'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList>
type RouteProp = {
  key: string
  name: 'MyReviewEdit'
  params: {
    reviewId: number
    expertName?: string
    initialRating: number
    initialContent: string
  }
}

const MAX_LENGTH = 300

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#8B8B8B',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  android: { elevation: 3 },
})

function ExitModal({
  visible,
  onExit,
  onCancel,
}: {
  visible: boolean
  onExit: () => void
  onCancel: () => void
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(7,9,28,0.6)' }}
      >
        <View
          className="rounded-2xl bg-[#F2F2F2] px-6 pb-6 pt-8"
          style={{
            width: 340,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 12.7,
              },
              android: { elevation: 8 },
            }),
          }}
        >
          {/* 제목 */}
          <Text
            className="text-center text-[24px] text-[#000000]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            수정을 종료할까요?
          </Text>

          {/* 부제목 */}
          <Text
            className="mt-3 text-center text-[16px] text-[#74768E]"
            style={{ fontFamily: 'Pretendard-Medium' }}
          >
            수정사항은 저장되지 않습니다
          </Text>

          {/* 버튼 행 */}
          <View className="mt-8 flex-row gap-3">
            <Pressable
              hitSlop={4}
              onPress={onExit}
              className="h-[50px] flex-1 items-center justify-center rounded-[8px]"
              style={{ backgroundColor: '#C6A75E' }}
            >
              <Text
                className="text-[17px] text-[#F2F2F2]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                종료하기
              </Text>
            </Pressable>
            <Pressable
              hitSlop={4}
              onPress={onCancel}
              className="h-[50px] flex-1 items-center justify-center rounded-[8px] border"
              style={{ backgroundColor: '#102343', borderColor: '#4A5198' }}
            >
              <Text
                className="text-[17px] text-[#F2F2F2]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                취소
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export function MyReviewEditScreen() {
  const navigation = useNavigation<NavProp>()
  const route = useRoute<RouteProp>()
  const insets = useScreenInsets()
  const { mutate: updateReview, isPending } = useUpdateReview()

  const { reviewId, expertName, initialRating, initialContent } = route.params

  const [rating, setRating] = useState(initialRating)
  const [content, setContent] = useState(initialContent)
  const [showExitModal, setShowExitModal] = useState(false)

  const isDirty = rating !== initialRating || content !== initialContent
  const canSubmit = isDirty && !isPending

  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowExitModal(true)
    } else {
      navigation.goBack()
    }
  }, [isDirty, navigation])

  const handleExit = useCallback(() => {
    setShowExitModal(false)
    navigation.goBack()
  }, [navigation])

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return
    updateReview(
      { id: reviewId, rating, comment: content },
      {
        onSuccess: () => {
          navigation.goBack()
        },
        onError: () => {
          Alert.alert('오류', '리뷰 수정에 실패했습니다. 다시 시도해 주세요.')
        },
      }
    )
  }, [canSubmit, updateReview, reviewId, rating, content, navigation])

  return (
    <>
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
            onPress={handleBack}
          >
            <ArrowBackIcon />
          </Pressable>
          <Text
            className="text-[17px] text-[#1F2A43]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            {expertName ?? '리뷰 수정'}
          </Text>
          <View className="w-[44px]" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}
        >
          {/* 명인 이름 */}
          {expertName && (
            <Text
              className="mt-6 text-center text-[24px] text-[#1F2A43]"
              style={{ fontFamily: 'Pretendard-ExtraBold', lineHeight: 32 }}
            >
              {expertName} 님은{'\n'}이런 경험을 제공했습니다
            </Text>
          )}

          {/* 별점 */}
          <View className="mt-8">
            <StarRating
              value={rating}
              size={40}
              onChange={setRating}
              renderStar={({ size, filled }) =>
                filled ? (
                  <StarFillIcon size={size} color="#FBBC05" />
                ) : (
                  <StarNoneIcon size={size} color="#1F2A43" />
                )
              }
            />
          </View>

          {/* 리뷰 내용 */}
          <View className="mt-8 rounded-[8px] bg-[#F2F2F2] px-4 py-3" style={CARD_SHADOW}>
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
                minHeight: 153,
              }}
            />
            <Text
              className="mt-2 text-right text-[14px]"
              style={{ fontFamily: 'Pretendard-Medium', color: '#C6A75E' }}
            >
              {content.length}/{MAX_LENGTH}
            </Text>
          </View>

          {/* 수정완료 버튼 */}
          <Pressable
            hitSlop={8}
            onPress={handleSubmit}
            disabled={!canSubmit}
            className="mt-6 h-[50px] items-center justify-center rounded-[8px]"
            style={{ backgroundColor: canSubmit ? '#C6A75E' : '#D9D9D9' }}
          >
            <Text
              className="text-[17px] text-[#F2F2F2]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              수정완료
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 종료 확인 팝업 */}
      <ExitModal
        visible={showExitModal}
        onExit={handleExit}
        onCancel={() => setShowExitModal(false)}
      />
    </>
  )
}
