import { RouteProp, useNavigation, usePreventRemove, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native'

import { Text } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { PanelScreen } from '@/components/PanelScreen'
import { ExpertAvatar, REVIEW_CARD_SHADOW, ReviewForm } from '@/components/review/ReviewForm'
import { useCreateReview } from '@/hooks/useCreateReview'
import { useReviewLinkInfo } from '@/hooks/useReviewLinkInfo'
import { DiagnosisSentItem, useReviewableExperts } from '@/hooks/useReviewableExperts'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList>

// ---------------------------------------------------------------------------
// 명인 카드 (단계 1)
// ---------------------------------------------------------------------------

// Figma 리뷰작성: 작성 전 카드는 골드 테두리, 작성 완료(리뷰작성_완료) 카드는 테두리 없음
type ExpertCardProps = {
  item: DiagnosisSentItem
  onSelect: (item: DiagnosisSentItem) => void
}

function ExpertCard({ item, onSelect }: ExpertCardProps) {
  const written = item.hasWrittenReview

  return (
    <Pressable
      hitSlop={8}
      disabled={written}
      onPress={() => onSelect(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.expertName} 리뷰 작성`}
      accessibilityState={{ disabled: written }}
      className={`h-[82px] flex-row items-center rounded-[8px] border bg-white px-4 ${
        written ? 'border-transparent' : 'border-primary'
      }`}
      style={REVIEW_CARD_SHADOW}
    >
      <ExpertAvatar uri={item.expertAvatarUrl} size={50} />
      <View className="ml-4 flex-1 justify-center gap-3">
        <Text className="font-pretendard-medium text-[12px] text-secondary" numberOfLines={1}>
          {item.expertName}
        </Text>
        {!!item.expertIntroduction && (
          <Text className="font-pretendard-medium text-[12px] text-gray2" numberOfLines={1}>
            {item.expertIntroduction}
          </Text>
        )}
      </View>
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
    <PanelScreen
      title="리뷰작성"
      subtitle="내가 만난 명인에 대한 후기를 알려주세요"
      onBack={onBack}
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1F2A43" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[14px] text-[#74768E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            목록을 불러오지 못했습니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={experts ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 32,
            paddingTop: 28,
            paddingBottom: insets.bottom + 32,
            gap: 16,
            flexGrow: 1,
          }}
          ListEmptyComponent={<EmptyState title="리뷰 작성 가능한 명인이 없습니다" />}
        />
      )}
    </PanelScreen>
  )
}

// ---------------------------------------------------------------------------
// 단계 2 — 리뷰 작성 (Figma: 리뷰작성_작성페이지)
// ---------------------------------------------------------------------------

function errorMessage(error: unknown): string {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response
    ?.data?.message
  return (Array.isArray(message) ? message[0] : message) ?? '잠시 후 다시 시도해 주세요'
}

type StepWriteProps = {
  expert: Pick<DiagnosisSentItem, 'expertProfileId' | 'expertName' | 'expertAvatarUrl'>
  reviewToken?: string
  // 작성 종료(뒤로가기 확인) 또는 작성 완료 후 이동
  onExit: () => void
}

function StepWriteReview({ expert, reviewToken, onExit }: StepWriteProps) {
  const { mutate: createReview, isPending } = useCreateReview()

  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [exitDialogVisible, setExitDialogVisible] = useState(false)
  const [completeDialogVisible, setCompleteDialogVisible] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // 종료 확정 후에는 뒤로가기 가로채기 해제
  const [leaving, setLeaving] = useState(false)

  // 헤더·하드웨어 뒤로가기 모두 작성 종료 확인 (Figma: 리뷰작성_작성종료)
  // native-stack은 막는 동안 iOS 스와이프 제스처도 비활성화됨
  usePreventRemove(!leaving, () => setExitDialogVisible(true))

  // 가로채기 해제가 반영된 뒤 이동 (목록 단계 복귀 또는 화면 종료)
  useEffect(() => {
    if (leaving) onExit()
  }, [leaving, onExit])

  const canSubmit = rating > 0 && !isPending

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return
    createReview(
      {
        expertProfileId: expert.expertProfileId,
        rating,
        comment: content.trim() || undefined,
        reviewToken,
      },
      {
        onSuccess: () => setCompleteDialogVisible(true),
        onError: (error) => setSubmitError(errorMessage(error)),
      }
    )
  }, [canSubmit, createReview, expert.expertProfileId, rating, content, reviewToken])

  return (
    <>
      <ReviewForm
        title={`${expert.expertName} 님은\n어떤 경험을 제공했나요?`}
        avatarUri={expert.expertAvatarUrl}
        rating={rating}
        content={content}
        onRatingChange={setRating}
        onContentChange={setContent}
        onBack={() => setExitDialogVisible(true)}
        footer={
          <Pressable
            hitSlop={8}
            onPress={handleSubmit}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="작성완료"
            accessibilityState={{ disabled: !canSubmit }}
            className={`h-[50px] items-center justify-center rounded-[8px] bg-primary ${
              canSubmit ? 'opacity-100' : 'opacity-50'
            }`}
          >
            {isPending ? (
              <ActivityIndicator color="#F2F2F2" />
            ) : (
              <Text className="font-pretendard-medium text-[17px] text-white">작성완료</Text>
            )}
          </Pressable>
        }
      />

      <ConfirmDialog
        visible={exitDialogVisible}
        title="작성을 종료하시겠습니까?"
        description="진행중인 작성사항은 저장되지 않습니다"
        confirmLabel="종료하기"
        onConfirm={() => {
          setExitDialogVisible(false)
          setLeaving(true)
        }}
        onCancel={() => setExitDialogVisible(false)}
      />

      {/* Figma: 리뷰작성_작성완료확인 → 확인 시 목록(리뷰작성_완료)으로 */}
      <ConfirmDialog
        visible={completeDialogVisible}
        title="리뷰 작성 완료"
        description="내가 작성한 리뷰에서 수정 및 삭제 가능"
        onConfirm={() => {
          setCompleteDialogVisible(false)
          setLeaving(true)
        }}
      />

      <ConfirmDialog
        visible={submitError !== null}
        title="리뷰 등록에 실패했습니다"
        description={submitError ?? ''}
        isError
        onConfirm={() => setSubmitError(null)}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Screen (2단계 상태 관리)
// ---------------------------------------------------------------------------

// 리뷰 링크로 진입 — 토큰의 명인으로 바로 작성 단계
function LinkedReviewWrite({ reviewToken }: { reviewToken: string }) {
  const navigation = useNavigation<NavProp>()
  const { data: info, isLoading, isError } = useReviewLinkInfo(reviewToken)
  const goBack = useCallback(() => navigation.goBack(), [navigation])

  if (info && !info.isMine && !info.alreadyReviewed) {
    return (
      <StepWriteReview
        expert={{ ...info, expertAvatarUrl: info.expertAvatarUrl ?? null }}
        reviewToken={reviewToken}
        onExit={goBack}
      />
    )
  }

  const message = isError
    ? '만료되었거나 올바르지 않은 리뷰 링크입니다'
    : info?.isMine
      ? '본인에게는 리뷰를 작성할 수 없습니다'
      : '이미 리뷰를 작성한 명인입니다'

  return (
    <PanelScreen
      title="리뷰작성"
      subtitle="내가 만난 명인에 대한 후기를 알려주세요"
      onBack={() => navigation.goBack()}
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1F2A43" />
        </View>
      ) : (
        <EmptyState title={message} />
      )}
    </PanelScreen>
  )
}

export function ReviewWriteScreen() {
  const navigation = useNavigation<NavProp>()
  const insets = useScreenInsets()
  const reviewToken = useRoute<RouteProp<RootStackParamList, 'ReviewWrite'>>().params?.reviewToken

  const [selectedExpert, setSelectedExpert] = useState<DiagnosisSentItem | null>(null)
  const clearSelection = useCallback(() => setSelectedExpert(null), [])

  if (reviewToken) return <LinkedReviewWrite reviewToken={reviewToken} />

  if (selectedExpert === null) {
    return (
      <StepSelectExpert
        onSelect={setSelectedExpert}
        onBack={() => navigation.goBack()}
        insets={insets}
      />
    )
  }

  return <StepWriteReview expert={selectedExpert} onExit={clearSelection} />
}
