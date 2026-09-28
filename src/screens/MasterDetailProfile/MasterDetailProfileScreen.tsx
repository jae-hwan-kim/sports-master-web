import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { FlatList, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Image } from 'expo-image'

import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import { ArrowBackIcon } from '@/assets/icons'
import EditSvg from '@/assets/icons/edit.svg'
import { Chip } from '@/components/Chip'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { useMyExpertProfile } from '@/hooks/useMyExpertProfile'
import { RootStackParamList } from '@/navigation/RootNavigator'
import type { components } from '@/types/schema'

type CertificationResponseDto = components['schemas']['CertificationResponseDto']
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

async function fetchMyCertifications(): Promise<CertificationResponseDto[]> {
  const { data } = await apiClient.get<{ data: CertificationResponseDto[] }>('/certifications/me')
  return data.data
}

// ─── 공용 하위 컴포넌트 ──────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="mb-3 text-popup-md text-gray3" style={{ fontFamily: 'Pretendard-SemiBold' }}>
      {label}
    </Text>
  )
}

function ReadonlyBox({ children }: { children: React.ReactNode }) {
  return <View className="rounded-[4px] bg-[#F2F2F2] px-[13px] py-[15px]">{children}</View>
}

function ReadonlyTextRow({ text }: { text: string }) {
  return (
    <ReadonlyBox>
      <Text
        className="text-small1 text-gray3"
        style={{ fontFamily: 'Pretendard-Medium' }}
        numberOfLines={1}
      >
        {text}
      </Text>
    </ReadonlyBox>
  )
}

function CertFileRow({ url }: { url: string }) {
  const filename = url.split('/').pop() ?? url
  return (
    <ReadonlyBox>
      <View className="flex-row items-center justify-between">
        <Text
          className="mr-3 flex-1 text-small1 text-gray3"
          style={{ fontFamily: 'Pretendard-Medium' }}
          numberOfLines={1}
        >
          {filename}
        </Text>
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="이미지확인"
          onPress={() => Linking.openURL(url)}
          className="rounded-[4px] bg-[#C6A75E] px-3 py-1"
        >
          <Text className="text-[12px] text-[#F2F2F2]" style={{ fontFamily: 'Pretendard-Medium' }}>
            이미지확인
          </Text>
        </Pressable>
      </View>
    </ReadonlyBox>
  )
}

// ─── 메인 화면 ───────────────────────────────────────────────────────────────

export function MasterDetailProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()

  const { data: profileData } = useMyExpertProfile()
  const profile = profileData ?? (__DEV__ ? MOCK_PROFILE : undefined)

  const { data: certifications } = useQuery({
    queryKey: ['certifications', 'me'],
    queryFn: fetchMyCertifications,
  })

  // careerText 불릿 아이템
  const careerItems = profile?.careerText ? profile.careerText.split('\n').filter(Boolean) : []

  // 증명서 파일 URL 목록 (flatten)
  const certFileUrls: string[] = (certifications ?? []).flatMap((c) => c.fileUrls)

  return (
    <View className="flex-1 bg-gray1">
      {/* ── 상단 헤더 ── */}
      <View
        className="h-14 flex-row items-center justify-between px-4"
        style={{ marginTop: insets.top }}
      >
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          onPress={() => navigation.goBack()}
        >
          <ArrowBackIcon />
        </Pressable>

        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="편집"
          onPress={() => navigation.navigate('MasterDetailProfileEdit')}
        >
          <EditSvg width={44} height={44} />
        </Pressable>
      </View>

      {/* ── 전체 스크롤 ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 타이틀 영역 */}
        <View className="px-[26px] pb-6 pt-[22px]">
          <Text className="text-title text-black" style={{ fontFamily: 'Pretendard-ExtraBold' }}>
            상세프로필
          </Text>
          <Text
            className="mt-[14px] text-small1 text-gray2"
            style={{ fontFamily: 'Pretendard-Medium' }}
          >
            {'전문성을 나타낼 수 있는 정보를 업로드하고,\n내 정보를 수정할 수 있습니다.'}
          </Text>
        </View>

        {/* ProfileCard */}
        {profile && (
          <View className="mx-[26px] mb-8">
            <ProfileCard profile={profile} />
          </View>
        )}

        {/* ── 섹션들 ── */}
        <View className="gap-y-8 px-[26px]">
          {/* 지역 */}
          <View>
            <SectionLabel label="지역" />
            <ReadonlyTextRow text={profile?.region ?? '-'} />
          </View>

          {/* 센터정보 (URL) */}
          <View>
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
                  className="text-small1 text-gray3"
                  style={{ fontFamily: 'Pretendard-Medium' }}
                  numberOfLines={1}
                >
                  {profile?.kakaoOpenChatUrl ?? '-'}
                </Text>
              </ReadonlyBox>
            </Pressable>
          </View>

          {/* 센터연락처 — BE 스키마 추가 후 profile.centerPhone 연결 */}
          <View>
            <SectionLabel label="센터연락처" />
            <ReadonlyTextRow text="-" />
          </View>

          {/* 키워드 Chip 목록 (가로 스크롤) */}
          <View>
            <SectionLabel label="키워드" />
            {profile?.keywordTags && profile.keywordTags.length > 0 ? (
              <FlatList
                data={profile.keywordTags}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                ItemSeparatorComponent={() => <View className="w-2" />}
                renderItem={({ item }) => <Chip label={item} selected variant="dark" />}
                scrollEnabled
              />
            ) : (
              <Text className="text-small1 text-gray2" style={{ fontFamily: 'Pretendard-Medium' }}>
                키워드 없음
              </Text>
            )}
          </View>

          {/* 이미지 그리드 (가로 스크롤) */}
          <View>
            <SectionLabel label="이미지" />
            {profile?.portfolioImageUrls && profile.portfolioImageUrls.length > 0 ? (
              <FlatList
                data={profile.portfolioImageUrls}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `img-${index}`}
                ItemSeparatorComponent={() => <View className="w-2" />}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width: 80, height: 80, borderRadius: 4 }}
                    contentFit="cover"
                  />
                )}
              />
            ) : (
              <ReadonlyBox>
                <Text
                  className="text-small1 text-gray2"
                  style={{ fontFamily: 'Pretendard-Medium' }}
                >
                  이미지가 없습니다
                </Text>
              </ReadonlyBox>
            )}
          </View>

          {/* 포트폴리오 파일명 */}
          <View>
            <SectionLabel label="포트폴리오" />
            <ReadonlyTextRow
              text={
                profile?.educationPdfUrl
                  ? (profile.educationPdfUrl.split('/').pop() ?? profile.educationPdfUrl)
                  : '-'
              }
            />
          </View>

          {/* 학력 및 경력사항 불릿 */}
          <View>
            <SectionLabel label="학력 및 경력사항" />
            <ReadonlyBox>
              {careerItems.length > 0 ? (
                <FlatList
                  data={careerItems}
                  scrollEnabled={false}
                  keyExtractor={(item, index) => `career-${index}`}
                  renderItem={({ item }) => (
                    <View className="flex-row items-start">
                      <Text
                        className="mr-2 text-small1 text-gray3"
                        style={{ fontFamily: 'Pretendard-Medium' }}
                      >
                        {'•'}
                      </Text>
                      <Text
                        className="flex-1 text-small1 leading-5 text-gray3"
                        style={{ fontFamily: 'Pretendard-Medium' }}
                      >
                        {item}
                      </Text>
                    </View>
                  )}
                />
              ) : (
                <Text
                  className="text-small1 text-gray2"
                  style={{ fontFamily: 'Pretendard-Medium' }}
                >
                  내용 없음
                </Text>
              )}
            </ReadonlyBox>
          </View>

          {/* 증명서 이미지 목록 */}
          <View>
            <SectionLabel label="증명서" />
            {certFileUrls.length > 0 ? (
              <FlatList
                data={certFileUrls}
                scrollEnabled={false}
                keyExtractor={(item, index) => `cert-${index}`}
                ItemSeparatorComponent={() => <View className="h-3" />}
                renderItem={({ item }) => <CertFileRow url={item} />}
              />
            ) : (
              <ReadonlyTextRow text="등록된 증명서 없음" />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
