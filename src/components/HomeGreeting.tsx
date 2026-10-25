import { View } from 'react-native'

import { ProfilePersonIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { useMe } from '@/hooks/useMe'

/** 홈 상단 아바타 + 인사말 — Figma 고객홈 2321:9033 / 명인홈_MAX 1136:5002 공통 */
export function HomeGreeting() {
  const { data: me } = useMe()

  return (
    <View className="flex-1 flex-row items-center gap-[8px]">
      {/* 기본 아바타 — Figma: 36 원 #4285F4 + #F2F2F2 인물 실루엣(상단 7, 원 밖은 잘림) */}
      <View className="h-[36px] w-[36px] items-center overflow-hidden rounded-full bg-[#4285F4] pt-[7px]">
        <ProfilePersonIcon size={22} color="#F2F2F2" />
      </View>
      <View className="gap-[5px]">
        <Text className="font-pretendard-medium text-[10px] text-gray3">반갑습니다 👋</Text>
        <Text className="font-pretendard-semibold text-[12px] text-black" numberOfLines={1}>
          {me?.name ? `${me.name} 님` : ' '}
        </Text>
      </View>
    </View>
  )
}
