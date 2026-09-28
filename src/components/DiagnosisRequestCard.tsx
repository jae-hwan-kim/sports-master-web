import { useState } from 'react'
import { Image } from 'expo-image'
import { Platform, Pressable, Text, View } from 'react-native'

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
        className="h-[82px] rounded-lg bg-white flex-row items-center px-4"
        style={Platform.select({
          ios: { shadowColor: '#8B8B8B', shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.25, shadowRadius: 6 },
          android: { elevation: 2 },
        })}
      >
        {/* 프로필 이미지 — left:16, size:50, top:16 (Figma) */}
        {customerProfile.profileImageUrl ? (
          <Image source={{ uri: customerProfile.profileImageUrl }} style={{ width: 50, height: 50, borderRadius: 25 }} contentFit="cover" />
        ) : (
          <View className="w-[50px] h-[50px] rounded-full bg-[#B0B0B0]" />
        )}

        {/* 텍스트 영역 — marginLeft:22 (Figma: 88-50-16=22), gap:20 (Figma gap-y:20) */}
        <View className="flex-1 ml-[22px] self-stretch pt-4 gap-5">
          {/* 상단 행: personalCode + 삭제 버튼(isViewed 카드만) */}
          <View className="flex-row justify-between items-center">
            <Text className="text-secondary text-small1 font-pretendard-medium">
              #{customerProfile.personalCode}
            </Text>
            {isViewed && (
              <Pressable
                hitSlop={8}
                onPress={() => setDeleteVisible(true)}
                className="bg-primary rounded px-2 py-0.5"
              >
                <Text className="text-[#FFFFFF] text-[11px] font-pretendard-semibold">삭제</Text>
              </Pressable>
            )}
          </View>

          {/* 하단 행: 지역 + 날짜 */}
          <View className="flex-row justify-between items-center">
            <Text className="text-gray2 text-small1 font-pretendard-medium">
              {customerProfile.region ?? '-'}
            </Text>
            <Text className="text-gray2 text-small2 font-pretendard-regular">
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
