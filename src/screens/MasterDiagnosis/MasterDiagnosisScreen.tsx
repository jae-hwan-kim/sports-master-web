import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'

import type { DiagnosisIncomingItem } from '@/api/diagnosis'
import { Text } from '@/components/AppText'
import { DiagnosisRequestCard } from '@/components/DiagnosisRequestCard'
import { DiagnosisRequestModal } from '@/components/DiagnosisRequestModal'
import { EmptyState } from '@/components/EmptyState'
import { useDeleteDiagnosisRequest } from '@/hooks/useDeleteDiagnosisRequest'
import { useIncomingDiagnosisRequests } from '@/hooks/useIncomingDiagnosisRequests'
import { useMarkDiagnosisViewed } from '@/hooks/useMarkDiagnosisViewed'
import { useScreenInsets } from '@/hooks/useScreenInsets'

export function MasterDiagnosisScreen() {
  const insets = useScreenInsets()
  const { data: items = [], isLoading } = useIncomingDiagnosisRequests()
  const { mutate: deleteDiagnosis } = useDeleteDiagnosisRequest()
  const { mutate: markViewed } = useMarkDiagnosisViewed()
  const [selectedItem, setSelectedItem] = useState<DiagnosisIncomingItem | null>(null)

  const renderItem = useCallback(
    ({ item }: { item: DiagnosisIncomingItem }) => (
      <DiagnosisRequestCard
        item={item}
        onPress={() => {
          setSelectedItem(item)
          if (!item.isViewed) markViewed(item.id)
        }}
        onDelete={() => deleteDiagnosis(item.id)}
      />
    ),
    [deleteDiagnosis, markViewed]
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
      {/* 헤더 */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 26, paddingBottom: 16 }}>
        <Text style={{ color: '#07091C', fontSize: 28, fontFamily: 'Pretendard-ExtraBold' }}>
          진단요청
        </Text>
        <Text
          style={{
            color: '#74768E',
            fontSize: 12,
            fontFamily: 'Pretendard-Medium',
            marginTop: 4,
            lineHeight: 20,
          }}
        >
          {'먼저 요청한 순으로 보여지며,\n프로필을 눌러 세부 사항을 확인할 수 있습니다.'}
        </Text>
      </View>

      {/* 목록 컨테이너 — 상단 radius + 위쪽 shadow */}
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
          elevation: 4,
        }}
      >
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#C6A75E" />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 32,
              paddingTop: 24,
              paddingBottom: insets.bottom + 16,
              flexGrow: 1,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={renderItem}
            ListEmptyComponent={
              <EmptyState
                title="아직 요청 고객이 없습니다"
                tip="Tip. 리뷰로 점수를 높여 진단요청 확률을 높여봅시다!"
              />
            }
          />
        )}
      </View>

      {/* 상세 모달 */}
      <DiagnosisRequestModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </View>
  )
}
