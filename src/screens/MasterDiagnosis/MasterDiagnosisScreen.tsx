import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { DiagnosisIncomingItem } from '@/api/diagnosis'
import { DiagnosisRequestCard } from '@/components/DiagnosisRequestCard'
import { DiagnosisRequestModal } from '@/components/DiagnosisRequestModal'
import { useDeleteDiagnosisRequest } from '@/hooks/useDeleteDiagnosisRequest'
import { useIncomingDiagnosisRequests } from '@/hooks/useIncomingDiagnosisRequests'
import { useMarkDiagnosisViewed } from '@/hooks/useMarkDiagnosisViewed'
import LogoSvg from '@/assets/icons/logo.svg'

function EmptyState() {
  return (
    <View style={{ flex: 1 }}>
      {/* 텍스트: 패널 내 상대 위치 기준 약 36% 지점 (Figma top:414, 패널top:178, 패널h:696) */}
      <View style={{ paddingTop: '36%', alignItems: 'center', gap: 12 }}>
        <Text style={{ color: '#74768E', fontSize: 18, fontFamily: 'Pretendard-ExtraBold', textAlign: 'center' }}>
          아직 요청 고객이 없습니다
        </Text>
        <Text style={{ color: '#74768E', fontSize: 13, fontFamily: 'Pretendard-Medium', textAlign: 'center' }}>
          Tip. 리뷰로 점수를 높여 진단요청 확률을 높여봅시다!
        </Text>
      </View>
      {/* 일러스트: 텍스트 아래, 우측으로 삐져나옴 (Figma left:200/402, bottom 영역) */}
      <View style={{ position: 'absolute', bottom: 0, right: -40 }}>
        <LogoSvg width={276} height={278} />
      </View>
    </View>
  )
}

export function MasterDiagnosisScreen() {
  const insets = useSafeAreaInsets()
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
              paddingTop: 16,
              paddingBottom: insets.bottom + 16,
              flexGrow: 1,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={renderItem}
            ListEmptyComponent={<EmptyState />}
          />
        )}
      </View>

      {/* 상세 모달 */}
      <DiagnosisRequestModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </View>
  )
}
