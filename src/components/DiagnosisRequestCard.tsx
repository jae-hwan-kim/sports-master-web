import { useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'

import type { DiagnosisIncomingItem } from '@/api/diagnosis'
import { formatDate } from '@/utils/date'

import { ConfirmDialog } from './ConfirmDialog'

type Props = {
  item: DiagnosisIncomingItem
  onPress: () => void
  onDelete?: () => void
}

export function DiagnosisRequestCard({ item, onPress, onDelete }: Props) {
  const { customerProfile, createdAt, isViewed } = item
  const [deleteVisible, setDeleteVisible] = useState(false)

  return (
    <>
      <Pressable
        hitSlop={8}
        onPress={onPress}
        style={{
          height: 82,
          borderRadius: 8,
          backgroundColor: '#F2F2F2',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          shadowColor: '#8B8B8B',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        {/* 프로필 이미지 — left:16, size:50, top:16 (Figma) */}
        {customerProfile.profileImageUrl ? (
          <Image source={{ uri: customerProfile.profileImageUrl }} style={{ width: 50, height: 50, borderRadius: 25 }} />
        ) : (
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#B0B0B0' }} />
        )}

        {/* 텍스트 영역 — marginLeft:22 (Figma: 88-50-16=22), gap:20 (Figma gap-y:20) */}
        <View style={{ flex: 1, marginLeft: 22, alignSelf: 'stretch', paddingTop: 16, gap: 20 }}>
          {/* 상단 행: personalCode + 삭제 버튼(정상 카드만) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#B48247', fontSize: 13, fontFamily: 'Pretendard-Medium' }}>
              #{customerProfile.personalCode}
            </Text>
            {isViewed && (
              <Pressable
                hitSlop={8}
                onPress={() => setDeleteVisible(true)}
                style={{ backgroundColor: '#B48247', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontFamily: 'Pretendard-SemiBold' }}>삭제</Text>
              </Pressable>
            )}
          </View>

          {/* 하단 행: 지역 + 날짜 */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#74768E', fontSize: 13, fontFamily: 'Pretendard-Medium' }}>
              {customerProfile.region ?? '-'}
            </Text>
            <Text style={{ color: '#74768E', fontSize: 12, fontFamily: 'Pretendard-Regular' }}>
              {formatDate(createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>

      <ConfirmDialog
        visible={deleteVisible}
        title="요청을 삭제할까요?"
        description="삭제 항목 복구는 불가합니다"
        confirmLabel="삭제하기"
        cancelLabel="취소"
        onConfirm={() => { setDeleteVisible(false); onDelete?.() }}
        onCancel={() => setDeleteVisible(false)}
      />
    </>
  )
}
