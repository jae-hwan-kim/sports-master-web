import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'

import { useState } from 'react'
import { FlatList, ImageBackground, Platform, Pressable, View } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { DiagnosisIncomingItem } from '@/api/diagnosis'
import { ArrowNextIcon, LinkIcon, StarMedalIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DiagnosisRequestCard } from '@/components/DiagnosisRequestCard'
import { useDoubleBackToExit } from '@/hooks/useAndroidBack'
import { useCopyReviewLink } from '@/hooks/useCopyReviewLink'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import type { MasterTabParamList } from '@/navigation/MasterTabNavigator'
import type { components } from '@/types/schema'

import masterBg from '../../assets/icons/master-background.png'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']

const GRADE_LABEL: Record<string, string> = {
  bronze: '브론즈',
  silver: '실버메달',
  gold: '스타메달',
  platinum: '플래티넘',
  diamond: '다이아몬드',
}

async function fetchExpertGrade(): Promise<ExpertProfileResponseDto> {
  const { data } = await apiClient.get<{ data: ExpertProfileResponseDto }>('/home/expert-grade')
  return data.data
}

async function fetchDiagnosisPreview(): Promise<DiagnosisIncomingItem[]> {
  const { data } = await apiClient.get<{ data: DiagnosisIncomingItem[] }>(
    '/home/diagnosis-requests/preview'
  )
  return data.data
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View className="w-14 items-center gap-2">
      <Text className="text-center font-pretendard-extrabold text-lg text-white">{value}</Text>
      <Text className="text-center font-pretendard-medium text-small2 text-white">{label}</Text>
    </View>
  )
}

function StatDivider() {
  return (
    <View
      className="mx-5 h-[38.5px] w-px self-center"
      style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
    />
  )
}

function EmptyNoProfile({ onPressWrite }: { onPressWrite: () => void }) {
  return (
    // Figma: 338×278 — 폭은 좌우 32 여백 안에서 유연, 높이는 남은 공간 안에서 최대 278
    <View className="max-h-[278px] w-full flex-1 items-center justify-center gap-2 rounded-lg bg-gray1">
      <Text className="text-center font-pretendard-extrabold text-lg text-gray2">
        아직 요청 고객이 없습니다
      </Text>
      <Text className="text-center font-pretendard-medium text-small2 text-gray2">
        프로필을 작성해 전문성을 보여주세요!
      </Text>
      <Pressable
        hitSlop={8}
        onPress={onPressWrite}
        className="mt-3 h-[50px] w-[145px] items-center justify-center rounded-lg bg-primary"
      >
        <Text className="font-pretendard-medium text-main text-white">프로필 작성하기</Text>
      </Pressable>
    </View>
  )
}

function EmptyHasTip() {
  return (
    <View className="min-h-[180px] items-center justify-center gap-2 rounded-lg bg-[#F0F0F0] p-6">
      <Text className="text-center font-pretendard-medium text-sm text-gray2">Tip.</Text>
      <Text className="text-center font-pretendard-regular text-small1 leading-5 text-gray2">
        {
          '링크를 통해 외부 고객도 리뷰 작성이 가능합니다\n리뷰 점수를 높여 고객요청 확률을 높여봅시다!'
        }
      </Text>
    </View>
  )
}

export function MasterHomeScreen() {
  const insets = useScreenInsets()
  useDoubleBackToExit()
  const tabNav = useNavigation<BottomTabNavigationProp<MasterTabParamList>>()
  const { data: expertProfile, isError: expertProfileError } = useQuery({
    queryKey: ['expertGrade'],
    queryFn: fetchExpertGrade,
    retry: false,
  })

  const { data: diagnosisItems = [] } = useQuery({
    queryKey: ['diagnosisPreview'],
    queryFn: fetchDiagnosisPreview,
  })

  // 프로필 행은 가입 시 빈 값으로 자동 생성됨 → 실제 작성된 내용이 있어야 작성 완료로 판단
  const hasProfile =
    !expertProfileError &&
    !!expertProfile &&
    !!(
      expertProfile.region ||
      expertProfile.centerName ||
      expertProfile.representativeService ||
      expertProfile.introduction ||
      expertProfile.careerText ||
      expertProfile.keywordTags?.length ||
      expertProfile.portfolioImageUrls?.length
    )
  const gradeLabel = expertProfile?.expertGrade
    ? (GRADE_LABEL[expertProfile.expertGrade] ?? expertProfile.expertGrade)
    : '-'
  const reviewCount = expertProfile
    ? String(expertProfile.totalReviewCount > 999 ? '999+' : expertProfile.totalReviewCount)
    : '-'
  const avgRating = expertProfile ? String(Number(expertProfile.averageRating).toFixed(1)) : '-'
  const topPercentile =
    expertProfile?.topPercentile != null ? `${expertProfile.topPercentile}%` : '-'

  // Figma 791:4558 명인홈_링크복사 완료 — 확인 시 리뷰 관리 화면으로 이동
  const [linkCopiedVisible, setLinkCopiedVisible] = useState(false)
  // 리뷰 링크는 명인 프로필 단위 — 프로필이 없으면 작성 유도
  const [noProfileVisible, setNoProfileVisible] = useState(false)
  const [linkErrorVisible, setLinkErrorVisible] = useState(false)
  const { mutate: copyReviewLink, isPending: isCopyingLink } = useCopyReviewLink({
    onCopied: () => setLinkCopiedVisible(true),
    onNoProfile: () => setNoProfileVisible(true),
    onError: () => setLinkErrorVisible(true),
  })

  const goWriteProfile = () =>
    tabNav.navigate('ProfileTab', { screen: 'MasterDetailProfile', initial: false })

  const handleSendLink = () => {
    if (!hasProfile) {
      setNoProfileVisible(true)
      return
    }
    copyReviewLink()
  }

  const handleLinkCopiedConfirm = () => {
    setLinkCopiedVisible(false)
    tabNav.navigate('ProfileTab', { screen: 'MasterReview', initial: false })
  }

  return (
    <View className="flex-1 bg-[#1E2A3A]">
      {/* 상단 배경 사진 영역 */}
      <ImageBackground source={masterBg} resizeMode="cover" style={{ paddingTop: insets.top }}>
        {/* 전체 dark 오버레이 */}
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(7,9,28,0.5)' }} />

        {/* 상단 흰색 그라디언트 오버레이 — height:364 (StatusBar+NavBar+Banner+카드+margin) */}
        <LinearGradient
          colors={['#F2F2F2', 'rgba(242,242,242,0)']}
          locations={[0, 1]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 364,
            pointerEvents: 'none',
          }}
        />

        {/* 상단(인사말 + 모드 토글 + 설정) 자리 — 실제 상단은 ModeHomeNavigator가 overlay로 그림 */}
        <View className="h-14" />

        {/* 리뷰 링크 배너 — height:54 */}
        <Pressable
          hitSlop={8}
          onPress={handleSendLink}
          disabled={isCopyingLink}
          className="mx-4 h-[54px] flex-row items-center rounded-lg px-[3px]"
          style={{ backgroundColor: 'rgba(7,9,28,0.6)' }}
        >
          <LinkIcon size={44} color="#FFFFFF" />
          <Text className="flex-1 font-pretendard-medium text-small2 text-white">
            내 고객이라면 누구나 리뷰 작성 가능
          </Text>
          <Text className="pr-3 font-pretendard-medium text-small2 text-gray1">링크 보내기</Text>
        </Pressable>

        {/* 명인 등급 카드 */}
        <View className="mx-4 mb-[13px] mt-3 h-[175px] overflow-hidden rounded-2xl">
          <LinearGradient
            colors={['rgba(7,9,28,0.6)', 'rgba(87,103,125,0.6)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          <View className="absolute right-0 top-0">
            <StarMedalIcon size={100} />
          </View>

          <View className="flex-1 justify-between pb-6 pl-4 pt-[18px]">
            <View>
              <Text className="font-pretendard-extrabold text-lg text-white">명인 등급</Text>
              <Text className="mt-[7px] font-pretendard-medium text-small2 text-gray1">
                현재 명인 등급 <Text className="text-[#FBBC05]">{gradeLabel}</Text> 입니다
              </Text>
            </View>

            <View className="ml-4 flex-row items-center self-start">
              <StatBox value={reviewCount} label="리뷰" />
              <StatDivider />
              <StatBox value={avgRating} label="평점" />
              <StatDivider />
              <StatBox value={topPercentile} label="상위" />
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* 하단 진단요청 고객 섹션 */}
      <View
        className="flex-1 rounded-t-2xl bg-white pt-[23px]"
        style={Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
          },
          android: { elevation: 5 },
        })}
      >
        {/* 섹션 헤더 — paddingLeft:32, paddingRight:25 → Figma 화살표 좌:333 우:25 여백 */}
        <Pressable
          hitSlop={8}
          onPress={() => tabNav.navigate('DiagnosisTab')}
          className="mb-4 flex-row items-center justify-between pl-8 pr-[25px]"
        >
          <View>
            <Text className="font-pretendard-extrabold text-lg text-gray3">진단요청 고객</Text>
            <Text className="mt-[3px] font-pretendard-medium text-small2 text-gray2">
              나를 찾는 고객 프로필 전부 확인하기
            </Text>
          </View>
          <ArrowNextIcon size={44} />
        </Pressable>

        {/* 진단요청 목록 */}
        <FlatList
          data={diagnosisItems}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 24, flexGrow: 1 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <DiagnosisRequestCard
              item={item}
              onPress={() => tabNav.navigate('DiagnosisTab')}
              cardBg="#F2F2F2"
            />
          )}
          ListEmptyComponent={
            hasProfile ? <EmptyHasTip /> : <EmptyNoProfile onPressWrite={goWriteProfile} />
          }
          ListFooterComponent={
            diagnosisItems.length > 0 ? (
              <Text
                className="mt-4 pb-4 text-right font-pretendard-medium text-[10px]"
                style={{ color: 'rgba(116,118,142,0.5)' }}
              >
                가장 먼저 요청한 3인이 보여집니다
              </Text>
            ) : null
          }
        />
      </View>

      <ConfirmDialog
        visible={linkCopiedVisible}
        title="링크 복사 완료"
        description="복사한 링크로 리뷰 요청이 가능합니다"
        onConfirm={handleLinkCopiedConfirm}
      />

      <ConfirmDialog
        visible={noProfileVisible}
        title="프로필을 먼저 작성해주세요"
        description="프로필 작성 후 리뷰 링크를 보낼 수 있습니다"
        confirmLabel="작성하기"
        cancelLabel="취소"
        onConfirm={() => {
          setNoProfileVisible(false)
          goWriteProfile()
        }}
        onCancel={() => setNoProfileVisible(false)}
      />

      <ConfirmDialog
        visible={linkErrorVisible}
        title="링크 생성 실패"
        description="잠시 후 다시 시도해주세요"
        onConfirm={() => setLinkErrorVisible(false)}
      />

    </View>
  )
}
