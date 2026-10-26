import { useState } from 'react'
import { Pressable, View } from 'react-native'

import { Image } from 'expo-image'

import type { DiagnosisIncomingItem } from '@/api/diagnosis'
import ProfilePersonSvg from '@/assets/icons/profile-person.svg'
import { Text } from '@/components/AppText'
import { formatDate } from '@/utils/date'

import { ConfirmDialog } from './ConfirmDialog'

type Props = {
  item: DiagnosisIncomingItem
  onPress: () => void
  onDelete?: () => void
  cardBg?: string
}

export function DiagnosisRequestCard({ item, onPress, onDelete, cardBg = '#D9D9D9' }: Props) {
  const { customerProfile, createdAt, isViewed } = item
  const [deleteVisible, setDeleteVisible] = useState(false)

  return (
    <>
      <Pressable
        hitSlop={8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="진단 요청 상세 보기"
        className="h-[82px] flex-row items-center rounded-lg px-4"
        style={{ backgroundColor: cardBg }}
      >
        {/* 프로필 이미지 — left:16, size:50, top:16 (Figma) */}
        {customerProfile.profileImageUrl ? (
          <Image
            source={{ uri: customerProfile.profileImageUrl }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full">
            <ProfilePersonSvg width={50} height={50} />
          </View>
        )}

        {/* 텍스트 영역 — marginLeft:22 (Figma: 88-50-16=22), gap:20 (Figma gap-y:20) */}
        <View className="ml-[22px] flex-1 gap-5 self-stretch pt-4">
          {/* 상단 행: personalCode + 삭제 버튼(isViewed 카드만) */}
          <View className="flex-row items-center justify-between">
            <Text className="font-pretendard-medium text-small1 text-secondary">
              #{customerProfile.personalCode}
            </Text>
            {isViewed && onDelete && (
              <Pressable
                hitSlop={8}
                onPress={() => setDeleteVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="진단 요청 삭제"
                className="rounded bg-primary px-2 py-0.5"
              >
                <Text className="font-pretendard-semibold text-[11px] text-[#FFFFFF]">삭제</Text>
              </Pressable>
            )}
          </View>

          {/* 하단 행: 지역 + 날짜 */}
          <View className="flex-row items-center justify-between">
            <Text className="font-pretendard-medium text-small1 text-gray2">
              {customerProfile.region ?? '-'}
            </Text>
            <Text className="font-pretendard-regular text-small2 text-gray2">
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
        onConfirm={() => {
          setDeleteVisible(false)
          onDelete?.()
        }}
        onCancel={() => setDeleteVisible(false)}
      />
    </>
  )
}
