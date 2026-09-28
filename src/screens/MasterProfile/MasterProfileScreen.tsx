import { useNavigation } from '@react-navigation/native'

import { ActivityIndicator, Image, Platform, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { LinearGradient } from 'expo-linear-gradient'

import PersonSvg from '@/assets/icons/person.svg'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { useMyExpertProfile } from '@/hooks/useMyExpertProfile'
import type { components } from '@/types/schema'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']

const MOCK_PROFILE: ExpertProfileResponseDto = {
  id: 1,
  userId: 1,
  region: '서울 강남구',
  centerName: '김명인',
  representativeService: '재활 트레이닝',
  introduction: '10년 경력의 재활 전문 트레이너입니다.',
  kakaoOpenChatUrl: 'https://open.kakao.com/o/example',
  expertGrade: 'gold',
  totalReviewCount: 42,
  averageRating: 4.8,
  certificationStatus: 'approved',
  portfolioImageUrls: [],
  keywordTags: ['재활', '골프', '체형교정'],
  careerText: '2018-현재 강남 스포츠 클리닉 원장\n2015-2018 국가대표 트레이너',
  educationPdfUrl: undefined,
  topPercentile: 5,
  createdAt: '2024-01-15T09:00:00.000Z',
  updatedAt: '2024-06-01T12:00:00.000Z',
}

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
          <View className="flex-1 items-center justify-center bg-[#D9D9D9]">
            <PersonSvg width={136} height={160} />
          </View>

          {/* Logo badge — top-right */}
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('@/assets/icons/logo.png')}
            className="absolute right-3 top-3"
            style={{ width: 52, height: 52 }}
            resizeMode="contain"
          />

          {/* 그라디언트 오버레이 */}
          <LinearGradient
            colors={['transparent', 'rgba(242,242,242,0.6)', 'rgba(242,242,242,0.9)']}
            locations={[0, 0.16, 0.59]}
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 220 }}
          />

          {/* 이름 / 소개 */}
          <View className="absolute bottom-[96px] left-6 right-6">
            <Text className="text-[20px] text-black" style={{ fontFamily: 'Pretendard-SemiBold' }}>
              이름최대8글자
            </Text>
            <Text
              className="mt-1 text-[13px] leading-5 text-gray3"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              {
                '여기에는 고객들에게 보여지는 한줄 소개가\n나타나는 곳으로 띄어쓰기 포함 30자 내로 작성합니다.'
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
              <Text className="text-[13px] text-gray3" style={{ fontFamily: 'Pretendard-Medium' }}>
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
              <Text className="text-[13px] text-gray3" style={{ fontFamily: 'Pretendard-Medium' }}>
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
              <Text className="text-[13px] text-gray3" style={{ fontFamily: 'Pretendard-Medium' }}>
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
  const insets = useSafeAreaInsets()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>()

  const { data: profile, isLoading } = useMyExpertProfile()

  return (
    <View className="flex-1" style={{ backgroundColor: '#F2F2F2', paddingTop: insets.top }}>
      {/* 장식용 블롭 — left area */}
      <View
        style={{
          position: 'absolute',
          left: -46,
          top: 202,
          width: 353,
          height: 353,
          borderRadius: 177,
          backgroundColor: 'rgba(180,170,220,0.25)',
          pointerEvents: 'none',
        }}
      />
      {/* 장식용 블롭 — right-bottom area */}
      <View
        style={{
          position: 'absolute',
          right: -30,
          bottom: 60,
          width: 246,
          height: 246,
          borderRadius: 123,
          backgroundColor: 'rgba(220,200,140,0.25)',
          pointerEvents: 'none',
        }}
      />

      {/* 헤더 */}
      <View className="px-[26px]" style={{ marginTop: 24 }}>
        <Text className="text-[28px] text-black" style={{ fontFamily: 'Pretendard-ExtraBold' }}>
          프로필
        </Text>
        <Text
          className="mt-[10px] text-[13px] text-[#74768E]"
          style={{ fontFamily: 'Pretendard-Medium' }}
        >
          전문성을 강조할 자료로 능력을 보여주세요
        </Text>
      </View>

      {/* 카드 영역 */}
      <View className="px-[26px]" style={{ marginTop: 36, flex: 1 }}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#74768E" />
          </View>
        ) : (profile ?? (__DEV__ ? MOCK_PROFILE : undefined)) ? (
          <ProfileCard
            profile={(profile ?? MOCK_PROFILE) as ExpertProfileResponseDto}
            onReviewPress={() => navigation.navigate('MasterReview')}
          />
        ) : (
          <EmptyProfileCard />
        )}
      </View>

      {/* 상세프로필로 이동 버튼 */}
      <View
        className="items-end px-[26px]"
        style={{ marginTop: 36, marginBottom: insets.bottom + 12 }}
      >
        <Pressable
          hitSlop={8}
          onPress={() => navigation.navigate('MasterDetailProfile')}
          className="flex-row items-center justify-center"
          style={{ backgroundColor: '#74768E', height: 36, width: 156, borderRadius: 76 }}
        >
          <Text className="text-[13px] text-[#F2F2F2]" style={{ fontFamily: 'Pretendard-Medium' }}>
            상세프로필로 이동
          </Text>
          <Text
            className="ml-[6px] text-[13px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-Medium' }}
          >
            {'>'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
