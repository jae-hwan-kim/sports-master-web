import { Platform, Pressable, Image as RNImage, View } from 'react-native'

import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import { GradeMedalIcon } from '@/assets/icons'
import ProfilePersonSvg from '@/assets/icons/profile-person.svg'
import { Text } from '@/components/AppText'
import { components } from '@/types/schema'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']

type Props = {
  profile: ExpertProfileResponseDto
  onReviewPress?: () => void
  // 이름·소개글 탭 → 편집 (상세 수정 화면에서만 전달)
  onNamePress?: () => void
  onIntroPress?: () => void
  onCoverPress?: () => void
}

export function ProfileCard({
  profile,
  onReviewPress,
  onNamePress,
  onIntroPress,
  onCoverPress,
}: Props) {
  const { name, introduction, totalReviewCount, averageRating, topPercentile, profileImageUrl } =
    profile

  // 입력 제한과 동일 (표시명 20자, 소개글 50자). 카드 줄 수 제한은 numberOfLines가 담당
  const displayName = (name ?? '').slice(0, 20)
  const displayIntro = (introduction ?? '').slice(0, 50)
  // 대표 사진은 하단 소개 이미지(portfolioImageUrls)와 별개
  const coverUri = profileImageUrl ?? undefined

  return (
    <View
      className="overflow-hidden rounded-2xl"
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
        <View className="overflow-hidden rounded-xl" style={{ height: 470 }}>
          {/* Cover image */}
          {coverUri ? (
            <>
              <Image
                source={{ uri: coverUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              <LinearGradient
                // Figma: fill 0.9 × stops #F2F2F2/0 → /0.67 → /1 — 'transparent'(투명 검정)는 중간이 회색으로 탁해짐
                colors={['rgba(242,242,242,0)', 'rgba(242,242,242,0.6)', 'rgba(242,242,242,0.9)']}
                locations={[0, 0.16, 0.59]}
                // LinearGradient는 className 미지원(cssInterop 미등록) → style로 배치
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 220 }}
              />
            </>
          ) : (
            <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-[#E8E8E8]">
              <ProfilePersonSvg width={88} height={104} color="#BDBDBD" />
            </View>
          )}

          {/* Logo badge — top-right */}
          <RNImage
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/icons/logo.png')}
            className="absolute right-3 top-3"
            style={{ width: 37, height: 48 }}
            resizeMode="contain"
          />

          {/* 사진 영역 탭 → 대표 사진 변경 (상세 수정 화면에서만 전달). 텍스트 오버레이보다 먼저 그려 이름·소개글 탭과 겹치지 않음 */}
          {onCoverPress && (
            <Pressable
              onPress={onCoverPress}
              className="absolute bottom-[170px] left-0 right-0 top-0"
              accessibilityRole="button"
              accessibilityLabel="대표 사진 변경"
            >
              <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-black/50">
                <Text className="text-white" style={{ fontSize: 14 }}>
                  ✎
                </Text>
              </View>
            </Pressable>
          )}

          {/* Text overlay */}
          <View className="absolute bottom-[96px] left-6 right-6">
            <View className="flex-row items-center gap-1">
              {/* 터치 영역 확대: 패딩으로 위아래 6px 넓히고 음수 마진으로 레이아웃은 그대로 유지 */}
              <Pressable
                disabled={!onNamePress}
                onPress={onNamePress}
                hitSlop={8}
                className="-mt-[6px] pt-[6px] -mb-[12px] pb-[12px]"
              >
                <Text
                  className="text-[20px] text-black"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </Pressable>
              <GradeMedalIcon grade={profile.expertGrade} size={24} />
            </View>
            {/* margin은 Pressable 바깥에 둬야 터치 영역이 이름 아래로 겹치지 않음 */}
            <Pressable disabled={!onIntroPress} onPress={onIntroPress} className="mt-[12px]">
              <Text
                className="text-[12px] text-gray3"
                style={{ fontFamily: 'Pretendard-Medium' }}
                numberOfLines={2}
              >
                {displayIntro}
              </Text>
            </Pressable>
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
                className="text-[18px] leading-5 text-gray3"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                {totalReviewCount != null
                  ? totalReviewCount >= 999
                    ? '999+'
                    : String(totalReviewCount)
                  : '-'}
              </Text>
              <Text className="text-[12px] text-gray3" style={{ fontFamily: 'Pretendard-Medium' }}>
                리뷰
              </Text>
            </View>

            {/* Divider */}
            <View className="w-px bg-gray2" style={{ height: 38.5 }} />

            {/* 평점 */}
            <View className="flex-1 items-center justify-center gap-2">
              <Text
                className="text-[18px] leading-5 text-gray3"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                {averageRating != null ? averageRating.toFixed(1) : '-'}
              </Text>
              <Text className="text-[12px] text-gray3" style={{ fontFamily: 'Pretendard-Medium' }}>
                평점
              </Text>
            </View>

            {/* Divider */}
            <View className="w-px bg-gray2" style={{ height: 38.5 }} />

            {/* 상위% */}
            <View className="flex-1 items-center justify-center gap-2">
              <Text
                className="text-[18px] leading-5 text-gray3"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                {profile.expertGrade == null ? '100%' : topPercentile != null ? `${topPercentile}%` : '-'}
              </Text>
              <Text className="text-[12px] text-gray3" style={{ fontFamily: 'Pretendard-Medium' }}>
                상위
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
