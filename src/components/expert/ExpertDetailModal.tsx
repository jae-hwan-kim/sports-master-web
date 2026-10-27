import { useRef } from 'react'
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, View } from 'react-native'

import CloseSvg from '@/assets/icons/close.svg'
import { Text } from '@/components/AppText'
import { ExpertProfileDetailBody } from '@/components/expert/ExpertProfileDetailBody'
import { useExpertProfile } from '@/hooks/useExpertProfile'
import { useScreenInsets } from '@/hooks/useScreenInsets'

type Props = {
  // null이면 닫힘
  expertProfileId: number | null
  onClose: () => void
  onPressReview: (expertProfileId: number) => void
}

// Figma 2321:9033 고객홈 — 이달의 소개 명인 '자세히보기' 모달
// overlay rgba(7,9,28,0.6), 패널 좌우 26 · 흰색 70% · radius 16 · 내부 패딩 13
export function ExpertDetailModal({ expertProfileId, onClose, onPressReview }: Props) {
  const insets = useScreenInsets()
  // 닫힘 fade-out 동안 내용이 비지 않도록 마지막 id 유지
  const lastIdRef = useRef(0)
  if (expertProfileId !== null) lastIdRef.current = expertProfileId
  const { data: profile, isLoading } = useExpertProfile(lastIdRef.current)

  return (
    <Modal
      visible={expertProfileId !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-[rgba(7,9,28,0.6)] px-[26px]"
        style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
      >
        <View
          className="flex-1 overflow-hidden rounded-[16px]"
          style={Platform.select({
            ios: {
              backgroundColor: 'rgba(255,255,255,0.7)',
              shadowColor: '#424A56',
              shadowOffset: { width: 2, height: 4 },
              shadowOpacity: 0.31,
              shadowRadius: 18.1,
            },
            android: { backgroundColor: 'rgba(255,255,255,0.85)', elevation: 8 },
          })}
        >
          {/* 헤더 — 명인명 + 닫기 */}
          <View className="h-[56px] flex-row items-center justify-between pl-[13px] pr-[6px]">
            <Text
              className="flex-1 text-[16px] text-[#1F2A43]"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
              numberOfLines={1}
            >
              {profile?.name ?? ''}
            </Text>
            <Pressable
              hitSlop={8}
              onPress={onClose}
              className="h-[44px] w-[44px] items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <CloseSvg width={20} height={20} color="#1F2A43" />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#74768E" />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 13, paddingBottom: 24 }}
            >
              <ExpertProfileDetailBody
                profile={profile}
                onPressReview={() => onPressReview(lastIdRef.current)}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  )
}
