import { FlatList, Platform, Pressable, View } from 'react-native'

import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import { LocationOnIcon, StarMedalIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'

// TODO: GET /recommendations/masters API 구현 확정 후 ExpertProfileResponseDto 기준으로 재정의
// - profileImage → imageUrls[0]
// - intro → introduction
// - location → region
// - specialties → keywordTags
// - isMaster → certificationStatus === 'approved' 또는 expertGrade 존재 여부
// - name: 응답 DTO 포함 여부 백엔드 협의 필요
export type MasterItem = {
  id: number
  name: string
  profileImage: string
  intro: string
  location: string
  specialties: string[]
  isMaster: boolean
}

type Props = {
  item: MasterItem
  onDetail: () => void
}

export function MasterCard({ item, onDetail }: Props) {
  return (
    <View className="relative h-[289] w-full overflow-hidden rounded-[12]">
      {/* Image container: h:289, w full, zoom-crop via contentFit cover */}
      {item.profileImage ? (
        <Image
          source={{ uri: item.profileImage }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      ) : (
        <View className="flex-1 bg-[#1F2A43]" />
      )}

      {/* Gradient overlay: rgba(78,106,169,0) → rgba(19,42,96,0.5) 27.9% → #1F2A43 64.9% */}
      <LinearGradient
        colors={['rgba(78,106,169,0)', 'rgba(19,42,96,0.5)', '#1F2A43']}
        locations={[0, 0.279, 0.649]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 232 }}
      />

      {/* Content overlay — absolute, anchored to bottom of image */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} className="pb-4">
        {/* Name + master badge */}
        <View className="flex-row items-center gap-1 pl-4">
          <Text
            className="text-[17px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-ExtraBold' }}
          >
            {item.name}
          </Text>
          {item.isMaster && <StarMedalIcon size={20} />}
        </View>

        {/* Intro — max 30 chars, 1 line */}
        <Text
          className="mt-1 pl-4 text-[12px] text-[#FBBC05]"
          numberOfLines={1}
          style={{ fontFamily: 'Pretendard-SemiBold' }}
        >
          {item.intro}
        </Text>

        {/* Location row: w:306px fixed, internal left margin 16pt */}
        <View className="ml-4 mt-2 w-[306] min-h-[28] flex-row items-center gap-1 rounded-[4] border border-[#74768E] bg-[#1F2A43] px-2">
          <LocationOnIcon size={12} />
          <Text className="text-[11px] text-[#C6A75E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            {item.location}
          </Text>
        </View>

        {/* Specialty chips — read-only, horizontal, no scroll */}
        <View className="mt-2 pl-4">
          <FlatList
            horizontal
            scrollEnabled={false}
            data={item.specialties}
            keyExtractor={(specialty, idx) => `chip_${item.id}_${idx}`}
            ItemSeparatorComponent={() => <View className="w-2" />}
            renderItem={({ item: specialty }) => (
              <View className="h-[20] items-center justify-center rounded-[18] bg-[#07091C] px-3">
                <Text
                  className="text-[8px] text-[#C6A75E]"
                  style={{ fontFamily: 'Pretendard-Medium', lineHeight: 16 }}
                >
                  {specialty}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Detail button — right-aligned, outer 44pt touch target, inner 28pt visual */}
        <View className="mt-2 flex-row justify-end pr-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name} 자세히보기`}
            accessibilityHint={item.intro}
            onPress={onDetail}
            className="h-[44] w-[80] items-center justify-center"
          >
            <View
              className="h-[28] w-full items-center justify-center rounded-[4] bg-[#4285F4]"
              style={Platform.select({
                ios: {
                  shadowColor: '#0D1628',
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                },
                android: { elevation: 3 },
              })}
            >
              <Text
                className="text-[12px] text-[#F2F2F2]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                자세히보기
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
