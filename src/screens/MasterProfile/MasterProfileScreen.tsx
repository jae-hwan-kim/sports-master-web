import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { ActivityIndicator, Image, Platform, Pressable, ScrollView, View } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { StarMedalIcon } from '@/assets/icons'
import ArrowNextSvg from '@/assets/icons/arrow-next.svg'
import ProfilePersonSvg from '@/assets/icons/profile-person.svg'
import { Text } from '@/components/AppText'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { useMyExpertProfile } from '@/hooks/useMyExpertProfile'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import type { MasterProfileStackParamList } from '@/navigation/MasterProfileStackNavigator'


function EmptyProfileCard() {
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
      <View className="p-[13px] pt-[11px]">
        <View className="overflow-hidden rounded-xl" style={{ height: 470 }}>
          {/* 플레이스홀더 배경 + 실루엣 */}
          <View className="flex-1 items-center justify-center bg-[#E8E8E8]">
            <ProfilePersonSvg width={88} height={104} color="#BDBDBD" />
          </View>

          {/* Logo badge — top-right */}
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/icons/logo.png')}
            className="absolute right-3 top-3"
            style={{ width: 37, height: 48 }}
            resizeMode="contain"
          />

          {/* 그라디언트 오버레이 */}
          <LinearGradient
            // Figma: fill 0.9 × stops #F2F2F2/0 → /0.67 → /1 — 'transparent'(투명 검정)는 중간이 회색으로 탁해짐
            colors={['rgba(242,242,242,0)', 'rgba(242,242,242,0.6)', 'rgba(242,242,242,0.9)']}
            locations={[0, 0.16, 0.59]}
            // LinearGradient는 className 미지원(cssInterop 미등록) → style로 배치
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 220 }}
          />

          {/* 이름 / 소개 */}
          <View className="absolute bottom-[96px] left-6 right-6">
            <View className="flex-row items-center gap-1">
              <Text
                className="text-[20px] text-black"
                style={{ fontFamily: 'Pretendard-SemiBold' }}
              >
                이름최대8글자
              </Text>
              <StarMedalIcon size={24} />
            </View>
            <Text
              className="mt-[12px] text-[12px] leading-5 text-gray3"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              {
                '여기에는 고객들에게 보여지는 한줄 소개가\n나타나는 곳으로 띄어쓰기 포함 50자 내로 작성합니다.'
              }
            </Text>
          </View>

          {/* 통계 행 */}
          <View
            className="absolute left-0 right-0 flex-row items-center"
            style={{ height: 56, bottom: 20 }}
          >
            <View className="flex-1 items-center justify-center" style={{ gap: 8 }}>
              <Text
                className="text-[18px] leading-5 text-gray3"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                0
              </Text>
              <Text className="text-[12px] text-gray3" style={{ fontFamily: 'Pretendard-Medium' }}>
                리뷰
              </Text>
            </View>
            <View className="w-px bg-gray2" style={{ height: 38.5 }} />
            <View className="flex-1 items-center justify-center" style={{ gap: 8 }}>
              <Text
                className="text-[18px] leading-5 text-gray3"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                0.0
              </Text>
              <Text className="text-[12px] text-gray3" style={{ fontFamily: 'Pretendard-Medium' }}>
                평점
              </Text>
            </View>
            <View className="w-px bg-gray2" style={{ height: 38.5 }} />
            <View className="flex-1 items-center justify-center" style={{ gap: 8 }}>
              <Text
                className="text-[18px] leading-5 text-gray3"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                100%
              </Text>
              <Text className="text-[12px] text-gray3" style={{ fontFamily: 'Pretendard-Medium' }}>
                상위
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export function MasterProfileScreen() {
  const insets = useScreenInsets()
  const navigation = useNavigation<NativeStackNavigationProp<MasterProfileStackParamList>>()

  const { data: profile, isLoading } = useMyExpertProfile()

  return (
    <View className="flex-1" style={{ backgroundColor: '#F2F2F2', paddingTop: insets.top }}>
      {/* 카드(고정 높이)와 버튼이 겹치지 않도록 세로 스크롤로 쌓음 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* 헤더 */}
        <View className="px-[26px]" style={{ marginTop: 28 }}>
          <Text
            className="text-[28px] text-[#07091C]"
            style={{ fontFamily: 'Pretendard-ExtraBold' }}
          >
            프로필
          </Text>
          <Text
            className="mt-[8px] text-[12px] text-[#74768E]"
            style={{ fontFamily: 'Pretendard-Medium' }}
          >
            전문성을 강조할 자료로 능력을 보여주세요
          </Text>
        </View>

        {/* 카드 영역 */}
        <View className="px-[26px]" style={{ marginTop: 34 }}>
          {isLoading ? (
            <View className="h-[470px] items-center justify-center">
              <ActivityIndicator size="large" color="#74768E" />
            </View>
          ) : profile ? (
            <ProfileCard profile={profile} onReviewPress={() => navigation.navigate('MasterReview')} />
          ) : (
            <EmptyProfileCard />
          )}
        </View>

        {/* 상세프로필로 이동 버튼 */}
        <View className="items-end px-[26px]" style={{ marginTop: 36 }}>
          <Pressable
            hitSlop={8}
            onPress={() => navigation.navigate('MasterDetailProfile')}
            className="flex-row items-center justify-center"
            style={{ backgroundColor: '#74768E', height: 36, width: 156, borderRadius: 76 }}
          >
            <Text
              className="text-[12px] text-[#F2F2F2]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              상세프로필로 이동
            </Text>
            <View className="ml-[6px]">
              <ArrowNextSvg width={15} height={15} />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}
