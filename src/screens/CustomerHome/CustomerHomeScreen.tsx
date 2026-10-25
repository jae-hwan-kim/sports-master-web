// src/screens/CustomerHome/CustomerHomeScreen.tsx
import { useCallback, useMemo, useState } from 'react'
import { FlatList, Platform, Pressable, View } from 'react-native'

import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import { LocationOnIcon, SettingsIcon, StarMedalIcon } from '@/assets/icons'
import LogoSvg from '@/assets/icons/logo.svg'
import { Text } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { HomeGreeting } from '@/components/HomeGreeting'
import { ExpertDetailModal } from '@/components/expert/ExpertDetailModal'
import { useDoubleBackToExit } from '@/hooks/useAndroidBack'
import { type FeaturedExpert, useFeaturedExperts } from '@/hooks/useFeaturedExperts'
import { useRootNavigation } from '@/hooks/useRootNavigation'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { useSwitchMode } from '@/hooks/useSwitchMode'
import { useAuthStore } from '@/store/authStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MasterCardData = {
  id: number
  expertProfileId: number
  name: string
  intro: string
  address: string
  categories: string[]
  imageUri?: string
}

function toMasterCard(expert: FeaturedExpert): MasterCardData {
  return {
    id: expert.id,
    expertProfileId: expert.id,
    name: expert.name,
    intro: expert.introduction ?? '',
    address: expert.region,
    categories: expert.keywordTags?.slice(0, 3) ?? [],
    imageUri: expert.imageUrl ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** 고객모드 전환 배지 — 오른쪽(고객모드) 활성 상태 */
function CustomerModeBadge({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      disabled={disabled}
      className="h-[20px] w-[80px] justify-center overflow-hidden rounded-[10px] bg-gray2"
    >
      {/* 활성 영역 (오른쪽 절반 = 고객모드) — Figma 활성 pill bg: #F2F2F2 */}
      <View className="absolute bottom-[2px] right-[2px] top-[2px] w-[37px] rounded-[8px] bg-[#F2F2F2]" />
      <Text
        className="text-center font-pretendard-semibold text-gray3"
        style={{ fontSize: 7, paddingLeft: 41, lineHeight: 14 }}
      >
        고객모드
      </Text>
    </Pressable>
  )
}

/** 카테고리 칩 */
function CategoryChip({ label }: { label: string }) {
  return (
    <View className="h-[20px] items-center justify-center rounded-[18px] bg-black px-[12px]">
      <Text className="font-pretendard-medium text-primary" style={{ fontSize: 8, lineHeight: 14 }}>
        {label}
      </Text>
    </View>
  )
}

/** 이달의 소개 명인 카드 */
function MasterCard({ item, onPressDetail }: { item: MasterCardData; onPressDetail: () => void }) {
  return (
    // Figma node 2321:9044 — h:289, 카드 x:32 → mx-[32px]
    <View className="mx-[32px] h-[289px] overflow-hidden rounded-[12px] bg-gray1">
      {item.imageUri && (
        <Image
          source={{ uri: item.imageUri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
      )}
      {/* 그라디언트 오버레이 (하단 232px) — Figma: from rgba(78,106,169,0) → rgba(19,42,96,0.5) → #1F2A43 */}
      <LinearGradient
        colors={['rgba(78,106,169,0)', 'rgba(19,42,96,0.5)', '#1F2A43']}
        locations={[0, 0.27885, 0.64904]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 232 }}
      />

      {/* 명인명 + 뱃지 — top: 131 (Figma: 559-428) */}
      <View className="absolute left-[16px] top-[131px] flex-row items-center gap-[4px]">
        <Text className="font-pretendard-extrabold text-[#F2F2F2]" style={{ fontSize: 17 }}>
          {item.name}
        </Text>
        <StarMedalIcon size={20} />
      </View>

      {/* 소개글 — top: 155 (Figma: 583-428) */}
      <Text
        className="absolute left-[16px] top-[155px] font-pretendard-semibold"
        style={{ fontSize: 12, color: '#FBBC05' }}
      >
        {item.intro}
      </Text>

      {/* 위치 행 — top: 181 (Figma: 609-428) */}
      <View className="absolute left-[16px] right-[16px] top-[181px] h-[28px] flex-row items-center rounded-[4px] border border-gray2 bg-gray3 px-[6px]">
        {/* 위치 아이콘 — Figma: location_on 12×12, color: #C6A75E */}
        <LocationOnIcon size={12} color="#C6A75E" />
        <Text
          className="ml-[4px] flex-1 font-pretendard-medium text-primary"
          style={{ fontSize: 11 }}
          numberOfLines={1}
        >
          {item.address}
        </Text>
      </View>

      {/* 카테고리 칩 — top: 217 (Figma: 645-428) */}
      <View className="absolute left-[16px] top-[217px] flex-row gap-[4px]">
        {item.categories.map((cat) => (
          <CategoryChip key={cat} label={cat} />
        ))}
      </View>

      {/* 자세히보기 버튼 — top: 245 (Figma: 673-428). h-[289px]이므로 overflow-hidden 내 표시 가능 */}
      <Pressable
        hitSlop={8}
        onPress={onPressDetail}
        className="absolute right-[16px] top-[245px] h-[28px] w-[80px] items-center justify-center rounded-[4px] bg-secondary"
        style={Platform.select({
          ios: {
            shadowColor: '#0D1628',
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          },
          android: { elevation: 2 },
        })}
      >
        <Text className="font-pretendard-medium text-small2 text-[#F2F2F2]">자세히보기</Text>
      </Pressable>
    </View>
  )
}

/** 섹션 패널 헤더 — 이달의 소개 명인 + AD 뱃지 */
function SectionHeader() {
  return (
    <View
      className="mt-[12px] flex-row items-center justify-between rounded-tl-[16px] rounded-tr-[16px] bg-[#F2F2F2] px-[16px] pb-[16px] pt-[23px]"
      style={Platform.select({
        ios: {
          shadowColor: '#000',
          // Figma: '0px -1px 5.5px' — 위쪽으로 shadow
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.1,
          shadowRadius: 5.5,
        },
        android: { elevation: 3 },
      })}
    >
      <Text className="font-pretendard-extrabold text-gray3" style={{ fontSize: 18 }}>
        이달의 소개 명인
      </Text>
      {/* AD 뱃지 */}
      <View className="h-[16px] items-center justify-center rounded-[4px] bg-[#A2A2A2] px-[8px]">
        <Text className="font-pretendard-semibold text-small2 text-[#F2F2F2]">AD</Text>
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export function CustomerHomeScreen() {
  const insets = useScreenInsets()
  useDoubleBackToExit()
  const rootNav = useRootNavigation()
  const { mutate: switchMode, isPending: isSwitching } = useSwitchMode()
  const setModeSelected = useAuthStore((s) => s.setModeSelected)
  const { data: featuredExperts } = useFeaturedExperts()
  const featuredMasters = useMemo(
    () => (featuredExperts ?? []).map(toMasterCard),
    [featuredExperts]
  )

  const [switchModeVisible, setSwitchModeVisible] = useState(false)

  const handleModeSwitchConfirm = () => {
    setSwitchModeVisible(false)
    switchMode(
      { mode: 'expert' },
      {
        onSuccess: () => {
          setModeSelected('expert')
          rootNav?.reset({ index: 0, routes: [{ name: 'MasterHome' }] })
        },
      }
    )
  }

  // 이달의 소개 명인 '자세히보기' — 화면 이동 대신 큰 모달 (Figma 2321:9033)
  const [detailExpertId, setDetailExpertId] = useState<number | null>(null)

  const handleMasterDetail = useCallback((expertProfileId: number) => {
    setDetailExpertId(expertProfileId)
  }, [])

  const handleDetailReview = (expertProfileId: number) => {
    setDetailExpertId(null)
    rootNav?.navigate('MasterReview', { expertProfileId })
  }

  const renderMasterCard = useCallback(
    ({ item }: { item: MasterCardData }) => (
      <MasterCard item={item} onPressDetail={() => handleMasterDetail(item.expertProfileId)} />
    ),
    [handleMasterDetail]
  )

  const renderItemSeparator = useCallback(() => <View className="h-[12px]" />, [])

  /** FlatList ListHeaderComponent — 내비게이션 바 + 배너 + 히어로 카드 + 섹션 헤더 */
  const listHeader = (
    <View>
      {/* ── 내비게이션 바 ────────────────────────────────────────── */}
      {/* bg-transparent: 루트 bg-[#F2F2F2] 투과 */}
      <View className="bg-transparent px-[16px]" style={{ paddingTop: insets.top }}>
        <View className="h-[56px] flex-row items-center">
          {/* 프로필 아바타 + 인사말 — 명인홈과 동일 컴포넌트 */}
          <HomeGreeting />

          {/* 모드전환 배지 + 설정 아이콘 */}
          <View className="flex-row items-center">
            <CustomerModeBadge onPress={() => setSwitchModeVisible(true)} disabled={isSwitching} />
            <Pressable
              hitSlop={8}
              onPress={() => rootNav?.navigate('CustomerSettings')}
              accessibilityRole="button"
              accessibilityLabel="설정"
            >
              <SettingsIcon size={44} color="#1F2A43" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── 리뷰 작성 배너 ────────────────────────────────────────── */}
      {/* bg-transparent: 루트 bg-[#F2F2F2] 투과 */}
      <View className="bg-transparent px-[16px] pb-[4px]">
        <Pressable
          hitSlop={8}
          onPress={() => rootNav?.navigate('MyReviews')}
          // Figma node 2321:9208 — rgba(7,9,28,0.6) 어두운 반투명
          className="h-[44px] justify-center rounded-[8px] bg-[rgba(7,9,28,0.6)] px-[16px]"
        >
          <Text
            className="font-pretendard-medium text-gray1"
            style={{ fontSize: 12 }}
            numberOfLines={1}
          >
            리뷰를 작성해 내가 만난 명인에대해 알려주세요!
          </Text>
        </Pressable>
      </View>

      {/* ── 맞춤 명인탐색 히어로 카드 ─────────────────────────────── */}
      {/* Figma: 2321:9039 — 어두운 그라디언트 카드, 운동선수 마스크 이미지 오버레이 */}
      {/* bg-transparent: 루트 bg-[#F2F2F2] 투과 */}
      <View className="bg-transparent px-[16px] pb-[0px]">
        <Pressable
          hitSlop={8}
          onPress={() => rootNav?.navigate('RegionSelectQ1')}
          className="mt-[12px] h-[176px] overflow-hidden rounded-[16px]"
          style={Platform.select({
            ios: {
              shadowColor: '#164C83',
              shadowOffset: { width: -5, height: -8 },
              shadowOpacity: 1,
              shadowRadius: 8.1,
            },
            android: { elevation: 4 },
          })}
        >
          <LinearGradient
            colors={['#07091C', '#2A69B5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1.2585 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {/* TODO: 운동선수 배경 이미지 — Figma asset: Mask group (node 2321:9215), 370×176
              1. Figma에서 해당 에셋을 PNG로 내보내기
              2. src/assets/images/customer-home-hero.png 로 저장
              3. 아래 주석 해제:
              import { Image } from 'expo-image'
              <Image
                source={require('@/assets/images/customer-home-hero.png')}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                contentFit="cover"
              />
          */}

          {/* 텍스트 — left-[32px] top-[199px] → left=16 from card, top=23 from card */}
          <Text
            className="absolute left-[16px] top-[23px] font-pretendard-extrabold text-[#F2F2F2]"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            맞춤 명인탐색
          </Text>
          <Text
            className="absolute left-[16px] top-[63px] font-pretendard-medium text-[#F2F2F2]"
            style={{ fontSize: 12 }}
          >
            3가지 질문으로 딱 맞는 명인을 발견합니다
          </Text>

          {/* 로고 — Figma 2321:9223 아트보드 4, 101×102, 카드 우하단 (right 11, bottom 10) */}
          <View className="absolute bottom-[10px] right-[11px]">
            <LogoSvg width={101} height={102} />
          </View>
        </Pressable>
      </View>

      {/* ── 이달의 소개 명인 섹션 헤더 ────────────────────────────── */}
      <SectionHeader />
    </View>
  )

  return (
    // 화면 전체 배경색 — Figma 캔버스 bg: #F2F2F2
    <View className="flex-1 bg-[#F2F2F2]">
      <FlatList
        data={featuredMasters}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMasterCard}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={renderItemSeparator}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />

      <ExpertDetailModal
        expertProfileId={detailExpertId}
        onClose={() => setDetailExpertId(null)}
        onPressReview={handleDetailReview}
      />

      {/* ── 모드 전환 확인 팝업 ─────────────────────────────────── */}
      <ConfirmDialog
        visible={switchModeVisible}
        title="명인모드로 전환"
        description="명인모드로 전환합니까?"
        confirmLabel="전환하기"
        cancelLabel="취소"
        confirmLoading={isSwitching}
        onConfirm={handleModeSwitchConfirm}
        onCancel={() => setSwitchModeVisible(false)}
      />
    </View>
  )
}
