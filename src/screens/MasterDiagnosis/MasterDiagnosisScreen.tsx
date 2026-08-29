import { useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { DiagnosisIncomingItem } from '@/api/diagnosis'
import { DiagnosisRequestCard } from '@/components/DiagnosisRequestCard'
import { DiagnosisRequestModal } from '@/components/DiagnosisRequestModal'
import { useDeleteDiagnosisRequest } from '@/hooks/useDeleteDiagnosisRequest'
import { useIncomingDiagnosisRequests } from '@/hooks/useIncomingDiagnosisRequests'

function EmptyState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 }}>
      <Text style={{ color: '#74768E', fontSize: 18, fontFamily: 'Pretendard-ExtraBold', textAlign: 'center' }}>
        아직 요청 고객이 없습니다
      </Text>
      <Text style={{ color: '#A0A2B8', fontSize: 13, fontFamily: 'Pretendard-Regular', textAlign: 'center', lineHeight: 20 }}>
        {'Tip. 리뷰로 점수를 높여\n진단요청 확률을 높여봅시다!'}
      </Text>
    </View>
  )
}

export function MasterDiagnosisScreen() {
  const insets = useSafeAreaInsets()
  const { data: items = [], isLoading } = useIncomingDiagnosisRequests()
  const { mutate: deleteDiagnosis } = useDeleteDiagnosisRequest()
  const [selectedItem, setSelectedItem] = useState<DiagnosisIncomingItem | null>(null)

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
      {/* 헤더 */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 26, paddingBottom: 16 }}>
        <Text style={{ color: '#07091C', fontSize: 28, fontFamily: 'Pretendard-ExtraBold' }}>
          진단요청
        </Text>
        <Text style={{ color: '#74768E', fontSize: 13, fontFamily: 'Pretendard-Medium', marginTop: 4, lineHeight: 20 }}>
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
        {!isLoading && (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 32,
              paddingTop: 16,
              paddingBottom: insets.bottom + 16,
              flexGrow: 1,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={({ item }) => (
              <DiagnosisRequestCard
                item={item}
                onPress={() => setSelectedItem(item)}
                onDelete={() => deleteDiagnosis(item.id)}
              />
            )}
            ListEmptyComponent={<EmptyState />}
          />
        )}
      </View>

      {/* 상세 모달 */}
      <DiagnosisRequestModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </View>
  )
}
