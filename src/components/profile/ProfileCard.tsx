import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Image as RNImage, Platform, Pressable, Text, View } from 'react-native'

import { StarMedalIcon } from '@/assets/icons'
import ProfilePersonSvg from '@/assets/icons/profile-person.svg'
import { components } from '@/types/schema'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']

type Props = {
  profile: ExpertProfileResponseDto
  onReviewPress?: () => void
}

export function ProfileCard({ profile, onReviewPress }: Props) {
  const {
    centerName,
    introduction,
    totalReviewCount,
    averageRating,
    topPercentile,
    portfolioImageUrls,
  } = profile

  const displayName = (centerName ?? '').slice(0, 8)
  const displayIntro = (introduction ?? '').slice(0, 30)
  const coverUri = portfolioImageUrls?.[0]

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'rgba(255,255,255,0.3)',
        ...Platform.select({
          ios: {
            shadowColor: 'rgba(66,74,86,1)',
            shadowOffset: { width: 2, height: 4 },
            shadowOpacity: 0.31,
            shadowRadius: 18,
          },
          android: { elevation: 6 },
        }),
      }}
    >
      {/* Image frame with padding */}
      <View className="p-[13px] pt-[11px]">
        <View className="rounded-xl overflow-hidden" style={{ height: 470 }}>
          {/* Cover image */}
          {coverUri ? (
            <>
              <Image
                source={{ uri: coverUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(242,242,242,0.6)', 'rgba(242,242,242,0.9)']}
                locations={[0, 0.16, 0.59]}
                className="absolute bottom-0 left-0 right-0"
                style={{ height: 220 }}
              />
            </>
          ) : (
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-gray1 items-center justify-center">
              <ProfilePersonSvg width={108} height={128} />
            </View>
          )}

          {/* Logo badge — top-right */}
          <RNImage
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/icons/logo.png')}
            className="absolute top-3 right-3"
            style={{ width: 52, height: 52 }}
            resizeMode="contain"
          />

{/* Text overlay */}
          <View className="absolute bottom-[96px] left-6 right-6">
            <View className="flex-row items-center gap-1">
              <Text
                className="text-black text-[20px]"
                style={{ fontFamily: 'Pretendard-SemiBold' }}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <StarMedalIcon size={20} />
            </View>
            <Text
              className="text-gray3 text-small1 mt-[12px]"
              style={{ fontFamily: 'Pretendard-Medium' }}
              numberOfLines={2}
            >
              {displayIntro}
            </Text>
          </View>

          {/* Stats row */}
          <Pressable
            hitSlop={8}
            onPress={onReviewPress}
            className="absolute left-0 right-0 flex-row items-center"
            style={{ height: 56, bottom: 20 }}
          >
            {/* 리뷰 */}
            <View className="flex-1 items-center justify-center gap-2">
              <Text
                className="text-gray3 text-[18px] leading-5"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                {totalReviewCount != null
                ? totalReviewCount >= 999
                  ? '999+'
                  : String(totalReviewCount)
                : '-'}
              </Text>
              <Text
                className="text-gray3 text-small1"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                리뷰
              </Text>
            </View>

            {/* Divider */}
            <View className="w-px bg-gray2" style={{ height: 38.5 }} />

            {/* 평점 */}
            <View className="flex-1 items-center justify-center gap-2">
              <Text
                className="text-gray3 text-[18px] leading-5"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                {averageRating != null ? averageRating.toFixed(1) : '-'}
              </Text>
              <Text
                className="text-gray3 text-small1"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                평점
              </Text>
            </View>

            {/* Divider */}
            <View className="w-px bg-gray2" style={{ height: 38.5 }} />

            {/* 상위% */}
            <View className="flex-1 items-center justify-center gap-2">
              <Text
                className="text-gray3 text-[18px] leading-5"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                {topPercentile != null ? `${topPercentile}%` : '-'}
              </Text>
              <Text
                className="text-gray3 text-small1"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                상위
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
