import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'

import { Alert, FlatList, ImageBackground, Platform, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { LinearGradient } from 'expo-linear-gradient'

import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { DiagnosisIncomingItem } from '@/api/diagnosis'
import { ArrowNextIcon, LinkIcon, ProfilePersonIcon, SettingsIcon, StarMedalIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { DiagnosisRequestCard } from '@/components/DiagnosisRequestCard'
import { useRootNavigation } from '@/hooks/useRootNavigation'
import { useSwitchMode } from '@/hooks/useSwitchMode'
import type { MasterTabParamList } from '@/navigation/MasterTabNavigator'
import { useAuthStore } from '@/store/authStore'
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

function MasterModeBadge({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      disabled={disabled}
      className="w-20 h-5 rounded-[10px] border border-[#1C236E] bg-black overflow-hidden justify-center"
    >
      {/* 네이비 그라디언트 pill — Figma: LinearGradient -11.3deg #181E5D→#20287F */}
      <LinearGradient
        colors={['#181E5D', '#20287F']}
        start={{ x: 0.4, y: 1 }}
        end={{ x: 0.6, y: 0 }}
        style={{
          position: 'absolute',
          top: 2,
          left: 3,
          bottom: 2,
          width: 36,
          borderRadius: 8,
        }}
      />
      <Text className="text-[7px] text-white font-pretendard-semibold text-center">명인모드</Text>
    </Pressable>
  )
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View className="w-14 items-center gap-2">
      <Text className="text-lg font-pretendard-extrabold text-white text-center">{value}</Text>
      <Text className="text-small2 font-pretendard-medium text-white text-center">{label}</Text>
    </View>
  )
}

function StatDivider() {
  return (
    <View
      className="w-px h-[38.5px] self-center mx-5"
      style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
    />
  )
}

function EmptyNoProfile() {
  return (
    <View className="rounded-lg bg-gray1 h-[278px] w-[338px] items-center justify-center gap-2">
      <Text className="text-gray2 text-lg font-pretendard-extrabold text-center">
        아직 요청 고객이 없습니다
      </Text>
      <Text className="text-gray2 text-small2 font-pretendard-medium text-center">
        프로필을 작성해 전문성을 보여주세요!
      </Text>
      <Pressable
        hitSlop={8}
        onPress={() => Alert.alert('준비 중', '프로필 작성 기능을 준비 중입니다.')}
        className="mt-3 bg-primary rounded-lg h-[50px] w-[145px] items-center justify-center"
      >
        <Text className="text-white text-main font-pretendard-medium">프로필 작성하기</Text>
      </Pressable>
    </View>
  )
}

function EmptyHasTip() {
  return (
    <View className="rounded-lg bg-[#F0F0F0] p-6 items-center justify-center min-h-[180px] gap-2">
      <Text className="text-gray2 text-sm font-pretendard-medium text-center">Tip.</Text>
      <Text className="text-gray2 text-small1 font-pretendard-regular text-center leading-5">
        {'링크를 통해 외부 고객도 리뷰 작성이 가능합니다\n리뷰 점수를 높여 고객요청 확률을 높여봅시다!'}
      </Text>
    </View>
  )
}

export function MasterHomeScreen() {
  const insets = useSafeAreaInsets()
  const rootNav = useRootNavigation()
  const tabNav = useNavigation<BottomTabNavigationProp<MasterTabParamList>>()
  const setModeSelected = useAuthStore((s) => s.setModeSelected)
  const { mutate: switchMode, isPending: isSwitching } = useSwitchMode()
  const { data: expertProfile, isError: expertProfileError } = useQuery({
    queryKey: ['expertGrade'],
    queryFn: fetchExpertGrade,
    retry: false,
  })

  const { data: diagnosisItems = [] } = useQuery({
    queryKey: ['diagnosisPreview'],
    queryFn: fetchDiagnosisPreview,
  })

  const hasProfile = expertProfile !== undefined && !expertProfileError
  const nickname = expertProfile?.centerName ?? '-'
  const gradeLabel = expertProfile?.expertGrade
    ? (GRADE_LABEL[expertProfile.expertGrade] ?? expertProfile.expertGrade)
    : '-'
  const reviewCount = expertProfile
    ? String(expertProfile.totalReviewCount > 999 ? '999+' : expertProfile.totalReviewCount)
    : '-'
  const avgRating = expertProfile ? String(Number(expertProfile.averageRating).toFixed(1)) : '-'
  const topPercentile =
    expertProfile?.topPercentile != null ? `${expertProfile.topPercentile}%` : '-'

  const handleModeSwitch = () => {
    switchMode(
      { mode: 'customer' },
      {
        onSuccess: () => {
          setModeSelected('customer')
          rootNav?.reset({ index: 0, routes: [{ name: 'CustomerHome' }] })
        },
      }
    )
  }

  const handleReviewLink = () => {
    Alert.alert('안내', '채팅방에서 고객에게 리뷰 링크를 보낼 수 있습니다.')
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

        {/* 내비게이션 바 */}
        <View className="h-14 flex-row items-center justify-between px-4">
          {/* 좌측: 아바타 + 인사말 */}
          <View className="flex-row items-center gap-2">
            <ProfilePersonIcon size={36} color="#1F2A43" />
            <View>
              <Text className="text-[10px] text-gray3 font-pretendard-medium">반갑습니다 👋</Text>
              <Text className="text-small2 text-black font-pretendard-semibold">{nickname} 님</Text>
            </View>
          </View>
          {/* 우측: 모드 배지 + 설정 */}
          <View className="flex-row items-center gap-2">
            <MasterModeBadge onPress={handleModeSwitch} disabled={isSwitching} />
            <Pressable
              hitSlop={8}
              onPress={() => rootNav?.navigate('MasterSettings')}
              accessibilityRole="button"
              accessibilityLabel="설정"
            >
              <SettingsIcon size={44} color="#F2F2F2" />
            </Pressable>
          </View>
        </View>

        {/* 리뷰 링크 배너 — height:54 */}
        <Pressable
          hitSlop={8}
          onPress={handleReviewLink}
          className="h-[54px] mx-4 rounded-lg flex-row items-center px-[3px]"
          style={{ backgroundColor: 'rgba(7,9,28,0.6)' }}
        >
          <LinkIcon size={44} color="#FFFFFF" />
          <Text className="flex-1 text-white text-small2 font-pretendard-medium">
            내 고객이라면 누구나 리뷰 작성 가능
          </Text>
          <Text className="text-gray1 text-small2 font-pretendard-medium pr-3">링크 보내기</Text>
        </Pressable>

        {/* 명인 등급 카드 */}
        <View className="h-[175px] mx-4 mt-3 mb-[13px] rounded-2xl overflow-hidden">
          <LinearGradient
            colors={['rgba(7,9,28,0.6)', 'rgba(87,103,125,0.6)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          <View className="absolute right-0 top-0">
            <StarMedalIcon size={100} />
          </View>

          <View className="flex-1 pl-4 pt-[18px] justify-between pb-6">
            <View>
              <Text className="text-white text-lg font-pretendard-extrabold">명인 등급</Text>
              <Text className="text-gray1 text-small2 font-pretendard-medium mt-[7px]">
                현재 명인 등급 <Text className="text-[#FBBC05]">{gradeLabel}</Text> 입니다
              </Text>
            </View>

            <View className="flex-row items-center self-start ml-4">
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
        className="flex-1 bg-white rounded-t-2xl pt-[23px]"
        style={Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 5 },
          android: { elevation: 5 },
        })}
      >
        {/* 섹션 헤더 — paddingLeft:32, paddingRight:25 → Figma 화살표 좌:333 우:25 여백 */}
        <Pressable
          hitSlop={8}
          onPress={() => tabNav.navigate('DiagnosisTab')}
          className="flex-row items-center justify-between pl-8 pr-[25px] mb-4"
        >
          <View>
            <Text className="text-gray3 text-lg font-pretendard-extrabold">진단요청 고객</Text>
            <Text className="text-gray2 text-small2 font-pretendard-medium mt-[3px]">
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
          contentContainerStyle={{ paddingHorizontal: 32 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <DiagnosisRequestCard
              item={item}
              onPress={() => tabNav.navigate('DiagnosisTab')}
              cardBg="#F2F2F2"
            />
          )}
          ListEmptyComponent={hasProfile ? <EmptyHasTip /> : <EmptyNoProfile />}
          ListFooterComponent={
            diagnosisItems.length > 0 ? (
              <Text
                className="text-[10px] font-pretendard-medium text-right mt-4 pb-4"
                style={{ color: 'rgba(116,118,142,0.5)' }}
              >
                가장 먼저 요청한 3인이 보여집니다
              </Text>
            ) : null
          }
        />
      </View>

    </View>
  )
}
