import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Alert, FlatList, Linking, Platform, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import {
  ArrowBackIcon,
  StarFillIcon,
  StarMedalIcon,
  StarNoneIcon,
} from '@/assets/icons'
import { Text } from '@/components/AppText'
import { useCreateDiagnosisRequest } from '@/hooks/useCreateDiagnosisRequest'
import { useExpertProfile } from '@/hooks/useExpertProfile'
import { useFavoriteExpert } from '@/hooks/useFavoriteExpert'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CustomerMasterDetail'>
type RouteProp = { key: string; name: 'CustomerMasterDetail'; params: { expertProfileId: number } }

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="mb-3 text-[16px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-SemiBold' }}>
      {label}
    </Text>
  )
}

function ReadonlyBox({ children }: { children: React.ReactNode }) {
  return <View className="rounded-[4px] bg-[#F2F2F2] px-[13px] py-[15px]">{children}</View>
}

function PdfRow({ url }: { url: string }) {
  const filename = url.split('/').pop() ?? url
  return (
    <ReadonlyBox>
      <View className="flex-row items-center justify-between">
        <Text
          className="mr-3 flex-1 text-[13px] text-[#1F2A43]"
          style={{ fontFamily: 'Pretendard-Medium' }}
          numberOfLines={1}
        >
          {filename}
        </Text>
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="파일열기"
          onPress={() => Linking.openURL(url)}
          className="h-[24px] w-[60px] items-center justify-center rounded-[4px] bg-[#C6A75E]"
        >
          <Text className="text-[12px] text-[#F2F2F2]" style={{ fontFamily: 'Pretendard-SemiBold' }}>
            파일열기
          </Text>
        </Pressable>
      </View>
    </ReadonlyBox>
  )
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const BOTTOM_BAR_HEIGHT = 90

export function CustomerMasterDetailScreen() {
  const navigation = useNavigation<NavProp>()
  const route = useRoute<RouteProp>()
  const insets = useSafeAreaInsets()

  const { expertProfileId } = route.params
  const { data: profile, isLoading } = useExpertProfile(expertProfileId)
  const { isFavorited, toggle: toggleFavorite, isToggling } = useFavoriteExpert(expertProfileId)
  const { mutate: createDiagnosis, isPending: isDiagnosing } = useCreateDiagnosisRequest()

  const careerItems = profile?.careerText ? profile.careerText.split('\n').filter(Boolean) : []
  const reviewCount =
    (profile?.totalReviewCount ?? 0) > 999 ? '999+' : String(profile?.totalReviewCount ?? 0)

  const handleDiagnosisRequest = () => {
    Alert.alert(
      '진단요청',
      `${profile?.centerName ?? '이 명인'}에게 진단을 요청하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '요청하기',
          onPress: () => {
            createDiagnosis(expertProfileId, {
              onSuccess: () => Alert.alert('완료', '진단 요청이 전송되었습니다.'),
              onError: (err: unknown) => {
                const status = (err as { response?: { status?: number } })?.response?.status
                const msg =
                  status === 409
                    ? '이미 접수된 진단 요청이 있습니다.'
                    : '진단 요청에 실패했습니다. 다시 시도해주세요.'
                Alert.alert('오류', msg)
              },
            })
          },
        },
      ],
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#D9D9D9]">
        <Text className="text-[14px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-Medium' }}>
          불러오는 중...
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#D9D9D9]" style={{ paddingTop: insets.top }}>
      {/* 네비게이션 바 */}
      <View className="h-[60px] flex-row items-center justify-between px-4">
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          onPress={() => navigation.goBack()}
        >
          <ArrowBackIcon />
        </Pressable>
        <StarMedalIcon size={44} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + 24 }}
      >
        {/* 명인 이름 */}
        <View className="px-[39px] pb-3">
          <Text className="text-[28px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-ExtraBold' }}>
            {profile?.centerName ?? '-'}
          </Text>
        </View>

        {/* 프로필 카드 — 이미지부터 학력까지 단일 반투명 카드 */}
        <View
          className="mx-[26px] overflow-hidden rounded-[16px] px-[13px] pb-6"
          style={Platform.select({
            ios: {
              backgroundColor: 'rgba(255,255,255,0.3)',
              shadowColor: '#424A56',
              shadowOffset: { width: 2, height: 4 },
              shadowOpacity: 0.31,
              shadowRadius: 18.1,
            },
            android: {
              backgroundColor: 'rgba(255,255,255,0.5)',
              elevation: 8,
            },
          })}
        >
          {/* 프로필 이미지 */}
          <View className="mt-[11px] h-[470px] overflow-hidden rounded-[12px]">
            {profile?.portfolioImageUrls?.[0] ? (
              <Image
                source={{ uri: profile.portfolioImageUrls[0] }}
                style={{ width: '100%', height: 470 }}
                contentFit="cover"
              />
            ) : (
              <View className="flex-1 bg-[#D9D9D9]" />
            )}

            {/* 훈장 아이콘 */}
            <View className="absolute right-0 top-0">
              <StarMedalIcon size={58} />
            </View>

            {/* 키워드 칩 (이미지 위, 소개글 상단) */}
            <View className="absolute bottom-[139px] left-[24px] flex-row gap-2">
              <FlatList
                horizontal
                scrollEnabled={false}
                data={profile?.keywordTags?.slice(0, 3) ?? []}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <View className="mr-2 h-[20px] items-center justify-center rounded-full bg-[#1F2A43] px-3">
                    <Text
                      className="text-[8px] text-[#F2F2F2]"
                      style={{ fontFamily: 'Pretendard-Medium' }}
                    >
                      {item}
                    </Text>
                  </View>
                )}
              />
            </View>

            {/* 하단 그라디언트 오버레이 */}
            <LinearGradient
              colors={['rgba(242,242,242,0)', 'rgba(242,242,242,0.9)']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220 }}
            />

            {/* 소개글 + 통계 오버레이 (그라디언트 위) */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: 24,
                paddingBottom: 16,
              }}
            >
              <Text
                className="text-[12px] text-[#74768E]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                {profile?.introduction ?? ''}
              </Text>
              <View className="flex-row items-center justify-around py-4">
                <Pressable
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="리뷰 보기"
                  className="flex-1 items-center gap-2"
                  onPress={() => navigation.navigate('MasterReview', { expertProfileId })}
                >
                  <Text
                    className="text-[18px] text-[#1F2A43]"
                    style={{ fontFamily: 'Pretendard-ExtraBold' }}
                  >
                    {reviewCount}
                  </Text>
                  <Text
                    className="text-[12px] text-[#1F2A43]"
                    style={{ fontFamily: 'Pretendard-Medium' }}
                  >
                    리뷰
                  </Text>
                </Pressable>
                <View className="h-[38px] w-[1px] bg-[#1F2A43]" />
                <View className="flex-1 items-center gap-2">
                  <Text
                    className="text-[18px] text-[#1F2A43]"
                    style={{ fontFamily: 'Pretendard-ExtraBold' }}
                  >
                    {profile?.averageRating ?? 0}
                  </Text>
                  <Text
                    className="text-[12px] text-[#1F2A43]"
                    style={{ fontFamily: 'Pretendard-Medium' }}
                  >
                    평점
                  </Text>
                </View>
                <View className="h-[38px] w-[1px] bg-[#1F2A43]" />
                <View className="flex-1 items-center gap-2">
                  <Text
                    className="text-[18px] text-[#1F2A43]"
                    style={{ fontFamily: 'Pretendard-ExtraBold' }}
                  >
                    {profile?.topPercentile ?? 0}%
                  </Text>
                  <Text
                    className="text-[12px] text-[#1F2A43]"
                    style={{ fontFamily: 'Pretendard-Medium' }}
                  >
                    상위
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 센터정보 */}
          <View className="mt-6">
            <SectionLabel label="센터정보" />
            <Pressable
              hitSlop={8}
              onPress={() => {
                const url = profile?.kakaoOpenChatUrl
                if (url) Linking.openURL(url)
              }}
            >
              <ReadonlyBox>
                <Text
                  className="text-[13px] text-[#1F2A43]"
                  style={{ fontFamily: 'Pretendard-Medium' }}
                  numberOfLines={1}
                >
                  {profile?.kakaoOpenChatUrl ?? '-'}
                </Text>
              </ReadonlyBox>
            </Pressable>
          </View>

          {/* 센터연락처 */}
          <View className="mt-6">
            <SectionLabel label="센터연락처" />
            <ReadonlyBox>
              <Text
                className="text-[12px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                -
              </Text>
            </ReadonlyBox>
          </View>

          {/* 키워드 */}
          <View className="mt-6">
            <SectionLabel label="키워드" />
            <FlatList
              horizontal
              scrollEnabled={false}
              data={profile?.keywordTags ?? []}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View className="mr-2 h-[24px] items-center justify-center rounded-full border border-[#74768E] bg-[#1F2A43] px-4">
                  <Text
                    className="text-[13px] text-[#F2F2F2]"
                    style={{ fontFamily: 'Pretendard-Medium' }}
                  >
                    {item}
                  </Text>
                </View>
              )}
            />
          </View>

          {/* 이미지 */}
          {(profile?.portfolioImageUrls?.length ?? 0) > 0 && (
            <View className="mt-6">
              <SectionLabel label="이미지" />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={profile?.portfolioImageUrls ?? []}
                keyExtractor={(item, idx) => `${item}_${idx}`}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width: 80, height: 80, borderRadius: 4, marginRight: 8 }}
                    contentFit="cover"
                  />
                )}
              />
            </View>
          )}

          {/* 포트폴리오 */}
          {!!profile?.educationPdfUrl && (
            <View className="mt-6">
              <SectionLabel label="포트폴리오" />
              <PdfRow url={profile.educationPdfUrl} />
            </View>
          )}

          {/* 학력 및 경력사항 */}
          {careerItems.length > 0 && (
            <View className="mt-6">
              <SectionLabel label="학력 및 경력사항" />
              <View className="gap-1 rounded-[4px] bg-[#F2F2F2] px-[13px] py-[15px]">
                <FlatList
                  scrollEnabled={false}
                  data={careerItems}
                  keyExtractor={(item, idx) => `career_${idx}`}
                  renderItem={({ item }) => (
                    <Text
                      className="text-[13px] text-[#1F2A43]"
                      style={{ fontFamily: 'Pretendard-Medium', lineHeight: 20 }}
                    >
                      • {item}
                    </Text>
                  )}
                />
              </View>
            </View>
          )}
        </View>

        {/* 하단 인증 문구 (카드 밖) */}
        <Text
          className="mt-6 text-center text-[12px] text-[#A2A2A2]"
          style={{ fontFamily: 'Pretendard-Medium' }}
        >
          본 명인은 증명서를 통해 운동명인에서 검증한 명인입니다
        </Text>
      </ScrollView>

      {/* 고정 하단 바: 찜 + 진단요청 */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center bg-[#F2F2F2] px-8"
        style={{
          paddingBottom: insets.bottom + 8,
          paddingTop: 16,
          ...Platform.select({
            ios: {
              shadowColor: '#8B8B8B',
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
            },
            android: { elevation: 8 },
          }),
        }}
      >
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isFavorited ? '찜 해제' : '찜하기'}
          onPress={() => toggleFavorite()}
          disabled={isToggling}
        >
          {isFavorited ? <StarFillIcon size={60} /> : <StarNoneIcon size={60} />}
        </Pressable>

        <Pressable
          hitSlop={8}
          className="ml-4 h-[52px] flex-1 items-center justify-center rounded-[8px] bg-[#C6A75E]"
          accessibilityRole="button"
          accessibilityLabel="진단요청하기"
          onPress={handleDiagnosisRequest}
          disabled={isDiagnosing}
        >
          <Text
            className="text-[20px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            {isDiagnosing ? '요청 중...' : '진단요청하기'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
