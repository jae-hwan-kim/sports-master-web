import { useCallback, useMemo, useState } from 'react'

import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useNavigation } from '@react-navigation/native'

import { ArrowBackIcon, LinkIcon } from '@/assets/icons'
import InfoSvg from '@/assets/icons/info.svg'
import LogoSvg from '@/assets/icons/logo.svg'
import { DeleteRequestDialog } from '@/components/review/DeleteRequestDialog'
import { RatingsSummary } from '@/components/review/RatingsSummary'
import { ReviewFilterTabs, ReviewSort } from '@/components/review/ReviewFilterTabs'
import { ReviewInfoModal } from '@/components/review/ReviewInfoModal'
import { ReviewItem as ReviewItemComponent, ReviewData } from '@/components/review/ReviewItem'
import { useDeleteReviewRequest } from '@/hooks/useDeleteReviewRequest'
import { useMyReviews, ReviewItem as ReviewItemHook } from '@/hooks/useMyReviews'
import { useRequestReviewLink } from '@/hooks/useRequestReviewLink'
import { useReviewSummary } from '@/hooks/useReviewSummary'
import type { components } from '@/types/schema'

type CreateReviewTokenDto = components['schemas']['CreateReviewTokenDto']

// ISO → 'YYYY.MM.DD'
function toDisplayDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '.')
}

function toReviewData(item: ReviewItemHook): ReviewData {
  return {
    id: item.id,
    nickname: item.customerNickname ?? '익명',
    avatarUri: item.customerProfileImageUrl ?? undefined,
    rating: item.rating,
    date: toDisplayDate(item.createdAt),
    content: item.content,
    photoUris: item.imageUrls,
  }
}


export function MasterReviewScreen() {
  const insets = useSafeAreaInsets()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = useNavigation<any>()

  const [activeSort, setActiveSort] = useState<ReviewSort>('latest')
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(false)

  const sortParam = activeSort === 'latest' ? 'latest' : activeSort === 'best' ? 'best' : undefined
  const photoOnly = activeSort === 'photo' ? true : undefined

  const { data: summary } = useReviewSummary()

  const { data: reviewsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyReviews({
    sort: sortParam,
    photoOnly,
  })

  const { mutate: deleteReviewRequest, isPending: isDeleting } = useDeleteReviewRequest()
  const { mutate: requestReviewLink, isPending: isRequestingLink } = useRequestReviewLink()

  // 페이지 목록 flatten
  const reviews = useMemo(
    () => reviewsData?.pages.flatMap((page) => page.data) ?? [],
    [reviewsData]
  )

  // 별점 분포 배열 [5점, 4점, 3점, 2점, 1점]
  const distribution = useMemo<[number, number, number, number, number]>(() => {
    const d = summary?.ratingDistribution ?? {}
    return [d['5'] ?? 0, d['4'] ?? 0, d['3'] ?? 0, d['2'] ?? 0, d['1'] ?? 0]
  }, [summary])

  const handleBack = useCallback(() => {
    nav.goBack()
  }, [nav])

  const handleDeleteModeToggle = useCallback(() => {
    if (!isDeleteMode) {
      setIsDeleteMode(true)
    } else if (selectedIds.size > 0) {
      setDeleteDialogVisible(true)
    }
    // 선택 없을 때는 동작 안함
  }, [isDeleteMode, selectedIds])

  const handleSelectChange = useCallback((id: number, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      selected ? next.add(id) : next.delete(id)
      return next
    })
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    const ids = Array.from(selectedIds)
    Promise.allSettled(ids.map((id) => new Promise<void>((resolve, reject) =>
      deleteReviewRequest(id, { onSuccess: () => resolve(), onError: (e) => reject(e) })
    ))).then((results) => {
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        // 일부 실패 — 상태 초기화는 하되 실패 사실을 로그로만 남김
        // (toast/alert 연동은 알림 컴포넌트 구현 후 추가)
        console.warn(`삭제 요청 실패 항목: ${failed.length}건`)
      }
    })
    setDeleteDialogVisible(false)
    setIsDeleteMode(false)
    setSelectedIds(new Set())
  }, [selectedIds, deleteReviewRequest])

  const handleSortChange = useCallback((sort: ReviewSort) => {
    setActiveSort(sort)
    setSelectedIds(new Set())
  }, [])

  const handleReviewLinkPress = useCallback(() => {
    requestReviewLink({} as CreateReviewTokenDto)
  }, [requestReviewLink])

  const renderItem = useCallback(
    ({ item }: { item: ReviewItemHook }) => (
      <View style={{ paddingHorizontal: 22 }}>
        <ReviewItemComponent
          review={toReviewData(item)}
          isDeleteMode={isDeleteMode}
          selected={selectedIds.has(item.id)}
          onSelectChange={(sel) => handleSelectChange(item.id, sel)}
        />
      </View>
    ),
    [isDeleteMode, selectedIds, handleSelectChange]
  )

  // FlatList ListHeaderComponent — 별점 요약 + 필터 탭
  const ListHeader = (
    <>
      {/* 제목 + 부제목 */}
      <View style={{ paddingHorizontal: 26, paddingTop: 16, paddingBottom: 12 }}>
        <Text
          style={{
            fontFamily: 'Pretendard-ExtraBold',
            fontSize: 28,
            lineHeight: 36,
            color: '#07091C',
          }}
        >
          리뷰
        </Text>
        <Text
          style={{
            fontFamily: 'Pretendard-Medium',
            fontSize: 13,
            color: '#74768E',
            marginTop: 4,
            lineHeight: 20,
          }}
        >
          {'총 별점과 작성된 리뷰를 확인할 수 있습니다.\n리뷰 삭제를 원할 경우, 삭제 요청을 통해 심사 후 처리됩니다.'}
        </Text>
      </View>

      {/* RatingsSummary 카드 (Figma: mx:26, h:120) */}
      <View style={{ marginHorizontal: 26, marginBottom: 10 }}>
        <RatingsSummary
          avg={summary?.averageRating ?? 0}
          distribution={distribution}
          totalCount={summary?.totalCount ?? 0}
        />
      </View>

      {/* 필터 탭 — 위아래 1px 구분선 */}
      <View
        style={{
          paddingHorizontal: 26,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: '#D9D9D9',
          backgroundColor: '#F2F2F2',
        }}
      >
        <ReviewFilterTabs
          activeSort={activeSort}
          onSortChange={handleSortChange}
          isDeleteMode={isDeleteMode}
          onDeleteModeToggle={handleDeleteModeToggle}
        />
      </View>
    </>
  )

  // 빈 상태 (Figma: 텍스트 + 링크 버튼 + 우측 하단 로고 배경)
  const ListEmpty = (
    <View style={{ minHeight: 360, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, gap: 12 }}>
      {/* 배경 로고 — 우측 하단 */}
      <LogoSvg
        width={220}
        height={220}
        style={{ position: 'absolute', right: -20, bottom: -20 }}
      />

      <Text
        style={{
          fontFamily: 'Pretendard-ExtraBold',
          fontSize: 18,
          color: '#74768E',
          textAlign: 'center',
        }}
      >
        아직 고객의 리뷰가 없습니다
      </Text>
      <Text
        style={{
          fontFamily: 'Pretendard-Medium',
          fontSize: 13,
          color: '#74768E',
          textAlign: 'center',
        }}
      >
        Tip. 아래 링크를 통해 고객에게 리뷰를 받을 수 있습니다.
      </Text>
      {/* 링크 버튼 */}
      <Pressable
        hitSlop={8}
        onPress={handleReviewLinkPress}
        disabled={isRequestingLink}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 54,
          paddingHorizontal: 4,
          borderRadius: 8,
          backgroundColor: 'rgba(7,9,28,0.6)',
          marginTop: 8,
        }}
      >
        <LinkIcon size={44} color="#F2F2F2" />
        <Text
          style={{
            fontFamily: 'Pretendard-Medium',
            fontSize: 13,
            color: '#F2F2F2',
            paddingRight: 12,
          }}
        >
          링크로 리뷰 요청하기
        </Text>
      </Pressable>
    </View>
  )

  const ListFooter = isFetchingNextPage ? (
    <ActivityIndicator style={{ marginVertical: 16 }} color="#C6A75E" />
  ) : null

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
      {/* 헤더: 뒤로가기 + i 버튼 */}
      <View style={{ paddingTop: insets.top }}>
        <View
          style={{
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}
        >
          <Pressable
            hitSlop={8}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
          >
            <ArrowBackIcon />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => setInfoModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="리뷰 안내"
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <InfoSvg width={44} height={44} />
          </Pressable>
        </View>
      </View>

      {/* 리뷰 목록 */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{
          paddingBottom: isDeleteMode && selectedIds.size > 0 ? 120 : 40,
        }}
      />

      {/* 삭제 모드 하단 버튼 — 선택 항목 있을 때만 표시 */}
      {isDeleteMode && selectedIds.size > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            paddingTop: 12,
            paddingHorizontal: 24,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Pressable
            hitSlop={8}
            onPress={() => setDeleteDialogVisible(true)}
            disabled={isDeleting}
            style={{
              height: 50,
              borderRadius: 8,
              backgroundColor: '#07091C',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#F2F2F2',
                fontSize: 16,
                fontFamily: 'Pretendard-SemiBold',
              }}
            >
              삭제 요청하기 ({selectedIds.size})
            </Text>
          </Pressable>
        </View>
      )}

      {/* 삭제 요청 확인 다이얼로그 */}
      <DeleteRequestDialog
        visible={deleteDialogVisible}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogVisible(false)}
      />

      {/* 리뷰 안내 모달 (i 버튼) */}
      <ReviewInfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />
    </View>
  )
}
