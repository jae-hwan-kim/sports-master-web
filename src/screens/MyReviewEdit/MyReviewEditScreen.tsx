import { RouteProp, useNavigation, usePreventRemove, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'

import { Text } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ReviewForm } from '@/components/review/ReviewForm'
import { useDeleteReview, useUpdateReview } from '@/hooks/useUpdateReview'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList>

type Dialog = 'exitEdit' | 'updated' | 'confirmDelete' | 'deleted' | null

// Figma: 내가작성한리뷰확인(보기) ↔ 내가작성한리뷰_수정(수정) — 같은 화면에서 모드 전환
export function MyReviewEditScreen() {
  const navigation = useNavigation<NavProp>()
  const { reviewId, expertName, expertAvatarUrl, initialRating, initialContent } =
    useRoute<RouteProp<RootStackParamList, 'MyReviewEdit'>>().params
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview()
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview()

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  // 저장된 값 — 수정 완료 후 보기 모드에 반영
  const [saved, setSaved] = useState({ rating: initialRating, content: initialContent ?? '' })
  const [rating, setRating] = useState(saved.rating)
  const [content, setContent] = useState(saved.content)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [error, setError] = useState<string | null>(null)

  const isDirty = rating !== saved.rating || content !== saved.content

  // 수정 중 뒤로가기(헤더·하드웨어) → 변경 있으면 종료 확인, 없으면 보기 모드로
  const handleEditBack = () => {
    if (isDirty) setDialog('exitEdit')
    else setMode('view')
  }
  usePreventRemove(mode === 'edit', handleEditBack)

  const leaveEdit = () => {
    setRating(saved.rating)
    setContent(saved.content)
    setMode('view')
  }

  const handleUpdate = () => {
    if (!isDirty || isUpdating) return
    updateReview(
      { id: reviewId, rating, comment: content },
      {
        onSuccess: () => {
          setSaved({ rating, content })
          setDialog('updated')
        },
        onError: () => setError('리뷰 수정에 실패했습니다. 다시 시도해 주세요.'),
      }
    )
  }

  const handleDelete = () => {
    setDialog(null)
    deleteReview(reviewId, {
      onSuccess: () => setDialog('deleted'),
      onError: () => setError('리뷰 삭제에 실패했습니다. 다시 시도해 주세요.'),
    })
  }

  const title = `${expertName ?? ''} 님은\n이런 경험을 제공했습니다`

  return (
    <>
      {mode === 'view' ? (
        <ReviewForm
          title={title}
          avatarUri={expertAvatarUrl}
          rating={saved.rating}
          content={saved.content}
          onBack={() => navigation.goBack()}
          footer={
            <View className="flex-row justify-center gap-3">
              <Pressable
                hitSlop={8}
                onPress={() => setMode('edit')}
                accessibilityRole="button"
                accessibilityLabel="리뷰수정"
                className="h-[50px] w-[145px] items-center justify-center rounded-lg bg-primary"
              >
                <Text className="font-pretendard-medium text-[17px] text-white">리뷰수정</Text>
              </Pressable>
              <Pressable
                hitSlop={8}
                onPress={() => setDialog('confirmDelete')}
                disabled={isDeleting}
                accessibilityRole="button"
                accessibilityLabel="삭제"
                className="h-[50px] w-[145px] items-center justify-center rounded-lg border border-dialogBorder bg-dialogBg"
              >
                {isDeleting ? (
                  <ActivityIndicator color="#F2F2F2" />
                ) : (
                  <Text className="font-pretendard-medium text-[17px] text-white">삭제</Text>
                )}
              </Pressable>
            </View>
          }
        />
      ) : (
        <ReviewForm
          title={title}
          avatarUri={expertAvatarUrl}
          rating={rating}
          content={content}
          onRatingChange={setRating}
          onContentChange={setContent}
          onBack={handleEditBack}
          footer={
            <Pressable
              hitSlop={8}
              onPress={handleUpdate}
              disabled={!isDirty || isUpdating}
              accessibilityRole="button"
              accessibilityLabel="수정완료"
              className={`h-[50px] items-center justify-center rounded-lg bg-primary ${
                isDirty ? 'opacity-100' : 'opacity-50'
              }`}
            >
              {isUpdating ? (
                <ActivityIndicator color="#F2F2F2" />
              ) : (
                <Text className="font-pretendard-medium text-[17px] text-white">수정완료</Text>
              )}
            </Pressable>
          }
        />
      )}

      {/* Figma: 내가작성한리뷰_종료 */}
      <ConfirmDialog
        visible={dialog === 'exitEdit'}
        title="수정을 종료할까요?"
        description="수정사항은 저장되지 않습니다"
        confirmLabel="종료하기"
        onConfirm={() => {
          setDialog(null)
          leaveEdit()
        }}
        onCancel={() => setDialog(null)}
      />

      {/* Figma: 내가작성한리뷰_수정완료 */}
      <ConfirmDialog
        visible={dialog === 'updated'}
        title="리뷰 수정 완료"
        description="언제나 수정 및 삭제 가능합니다"
        onConfirm={() => {
          setDialog(null)
          setMode('view')
        }}
      />

      {/* Figma: 내가작성한리뷰_삭제 */}
      <ConfirmDialog
        visible={dialog === 'confirmDelete'}
        title="리뷰를 삭제할까요?"
        description="삭제시 복구 불가합니다"
        confirmLabel="삭제하기"
        onConfirm={handleDelete}
        onCancel={() => setDialog(null)}
      />

      {/* Figma: 내가작성한리뷰_삭제완료 */}
      <ConfirmDialog
        visible={dialog === 'deleted'}
        title="리뷰가 삭제되었습니다"
        description=""
        onConfirm={() => {
          setDialog(null)
          navigation.goBack()
        }}
      />

      <ConfirmDialog
        visible={error !== null}
        title="오류"
        description={error ?? ''}
        isError
        onConfirm={() => setError(null)}
      />
    </>
  )
}
