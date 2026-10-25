// src/screens/CustomerExplore/CustomerExploreScreen.tsx

import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native'

import { Image } from 'expo-image'

import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import { SearchOutlineIcon, StarFillIcon, StarNoneIcon } from '@/assets/icons'
import { Text, TextInput } from '@/components/AppText'
import { useExperts } from '@/hooks/useExperts'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import type { RootStackParamList } from '@/navigation/RootNavigator'

// ─── 데이터 ──────────────────────────────────────────────────────────────────

const PROVINCES = [
  '서울',
  '경기',
  '인천',
  '대전',
  '세종',
  '충남',
  '충북',
  '전남광주',
  '전북',
  '대구',
  '경북',
  '부산',
  '울산',
  '경남',
  '강원',
  '제주',
  '전국',
]

const DISTRICTS: Record<string, string[]> = {
  서울: [
    '서울전체',
    '강남구',
    '강동구',
    '강북구',
    '강서구',
    '관악구',
    '광진구',
    '구로구',
    '금천구',
    '노원구',
    '도봉구',
    '동대문구',
    '동작구',
    '마포구',
    '서대문구',
    '서초구',
    '성동구',
    '성북구',
    '송파구',
    '양천구',
    '영등포구',
    '용산구',
    '은평구',
    '종로구',
    '중구',
    '중랑구',
  ],
  경기: ['경기전체'],
  인천: ['인천전체'],
  대전: ['대전전체'],
  세종: ['세종전체'],
  충남: ['충남전체'],
  충북: ['충북전체'],
  전남광주: ['전남광주전체'],
  전북: ['전북전체'],
  대구: ['대구전체'],
  경북: ['경북전체'],
  부산: ['부산전체'],
  울산: ['울산전체'],
  경남: ['경남전체'],
  강원: ['강원전체'],
  제주: ['제주전체'],
  전국: ['전국'],
}

type MasterItem = {
  id: number
  nickname: string
  region: string
  bio: string
  specialties: string[]
  profileImageUrl?: string
  isFavorite: boolean
}

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#8B8B8B',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  android: { elevation: 2 },
})

const CARD_TOP_SECTION_SHADOW = Platform.select({
  ios: {
    shadowColor: '#8B8B8B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  android: { elevation: 1 },
})

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

function SpecialtyChip({ label }: { label: string }) {
  return (
    <View className="h-[20px] items-center justify-center rounded-[18px] bg-gray3 px-3">
      <Text className="font-pretendard-medium text-[8px] text-white">{label}</Text>
    </View>
  )
}

type MasterCardProps = {
  item: MasterItem
  onPress: () => void
  onFavoritePress: () => void
}

function MasterCard({ item, onPress, onFavoritePress }: MasterCardProps) {
  return (
    <Pressable hitSlop={8} onPress={onPress} className="rounded-lg bg-white" style={CARD_SHADOW}>
      {/* 상단: 아바타 + 텍스트 */}
      <View className="h-[82px] flex-row items-center px-4" style={CARD_TOP_SECTION_SHADOW}>
        {item.profileImageUrl ? (
          <Image
            source={{ uri: item.profileImageUrl }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-[50px] w-[50px] rounded-full bg-gray1" />
        )}
        <View className="ml-5 flex-1 justify-center gap-2">
          <Text className="font-pretendard-semibold text-[14px] text-secondary" numberOfLines={1}>
            {item.nickname} | {item.region}
          </Text>
          <Text className="font-pretendard-medium text-small2 text-[#A2A2A2]" numberOfLines={1}>
            {item.bio}
          </Text>
        </View>
      </View>

      {/* 하단: 전문분야 칩 + 즐겨찾기 */}
      <View className="h-[54px] flex-row items-center pl-4">
        <View className="flex-1 flex-row flex-wrap gap-1">
          {item.specialties.map((s) => (
            <SpecialtyChip key={s} label={s} />
          ))}
        </View>
        <Pressable
          hitSlop={8}
          onPress={onFavoritePress}
          className="h-[44px] w-[44px] items-center justify-center"
        >
          {item.isFavorite ? <StarFillIcon size={24} /> : <StarNoneIcon size={24} />}
        </Pressable>
      </View>
    </Pressable>
  )
}

// ─── 지역 선택 모달 ────────────────────────────────────────────────────────────

type RegionPickerProps = {
  visible: boolean
  province: string
  district: string
  onProvinceChange: (p: string) => void
  onDistrictChange: (d: string) => void
  onConfirm: () => void
  onClose: () => void
}

function RegionPicker({
  visible,
  province,
  district,
  onProvinceChange,
  onDistrictChange,
  onConfirm,
  onClose,
}: RegionPickerProps) {
  const insets = useScreenInsets()
  const districts = DISTRICTS[province] ?? []

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-[rgba(7,9,28,0.6)]">
        {/* 바깥 영역 탭 → 닫기 */}
        <Pressable className="flex-1" onPress={onClose} />

        {/* 패널 */}
        <View className="rounded-t-2xl bg-white" style={{ paddingBottom: insets.bottom }}>
          {/* 헤더 */}
          <View className="relative h-[75px] items-center justify-center">
            <Text className="font-pretendard-semibold text-[20px] text-black">지역선택</Text>
            <Pressable
              hitSlop={8}
              onPress={onClose}
              className="absolute right-0 top-0 h-[45px] w-[45px] items-center justify-center"
            >
              <Text className="font-pretendard-medium text-[24px] text-gray3">×</Text>
            </Pressable>
          </View>

          {/* 구분선 */}
          <View className="mx-[21px] h-px bg-gray1" />

          {/* 2열 지역 선택기 */}
          <View className="flex-row" style={{ height: 370 }}>
            {/* 좌: 시/도 목록 */}
            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
              <View className="py-2">
                {PROVINCES.map((p) => (
                  <Pressable
                    key={p}
                    hitSlop={8}
                    onPress={() => onProvinceChange(p)}
                    className={`mx-[21px] h-[46px] justify-center rounded-lg pl-[15px] ${
                      p === province ? 'bg-[#E9E9E9]' : ''
                    }`}
                  >
                    <Text
                      className={`font-pretendard-medium text-[16px] ${
                        p === province ? 'text-black' : 'text-[#7B7B7B]'
                      }`}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* 우: 구/군 목록 */}
            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
              <View className="py-2">
                {districts.map((d) => (
                  <Pressable
                    key={d}
                    hitSlop={8}
                    onPress={() => onDistrictChange(d)}
                    className="h-[46px] flex-row items-center pl-[24px]"
                  >
                    {/* 선택 체크마크 */}
                    <View className="mr-1 w-[18px]">
                      {d === district ? (
                        <View
                          style={{
                            width: 14,
                            height: 8,
                            borderLeftWidth: 1.5,
                            borderBottomWidth: 1.5,
                            borderColor: '#7B7B7B',
                            transform: [{ rotate: '-45deg' }],
                          }}
                        />
                      ) : null}
                    </View>
                    <Text
                      className={`font-pretendard-medium text-[16px] ${
                        d === district ? 'text-black' : 'text-[#7B7B7B]'
                      }`}
                    >
                      {d}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 선택 완료 버튼 */}
          <View
            className="px-[26px] py-[20px]"
            style={Platform.select({
              ios: {
                shadowColor: '#8B8B8B',
                shadowOffset: { width: 0, height: -1 },
                shadowOpacity: 0.16,
                shadowRadius: 8,
              },
              android: { elevation: 4 },
            })}
          >
            <Pressable
              hitSlop={8}
              onPress={onConfirm}
              className="h-[50px] items-center justify-center rounded-lg bg-primary"
            >
              <Text className="font-pretendard-semibold text-[17px] text-white">선택완료</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── 메인 화면 ────────────────────────────────────────────────────────────────

export function CustomerExploreScreen() {
  const insets = useScreenInsets()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())

  const { mutate: toggleFavoriteAPI } = useMutation({
    mutationFn: (id: number) => apiClient.post(`/favorite-experts/${id}`),
  })

  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [regionPickerVisible, setRegionPickerVisible] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState('서울')
  const [selectedDistrict, setSelectedDistrict] = useState('서울전체')
  const [pendingProvince, setPendingProvince] = useState('서울')
  const [pendingDistrict, setPendingDistrict] = useState('서울전체')
  const [filterRegion, setFilterRegion] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState(false)

  // 입력마다 요청하지 않도록 300ms 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchText])

  // 필터가 없으면 전체 명인
  const { data: experts, isLoading } = useExperts({
    q: debouncedSearch || undefined,
    region: filterRegion ?? undefined,
    minRating: filterRating ? 4 : undefined,
  })

  const masters = useMemo<MasterItem[]>(
    () =>
      experts?.map((e) => ({
        id: e.id,
        nickname: e.name,
        region: e.region,
        bio: e.representativeService,
        specialties: e.keywordTags ?? [],
        profileImageUrl: e.imageUrl ?? undefined,
        isFavorite: favoriteIds.has(e.id),
      })) ?? [],
    [experts, favoriteIds]
  )

  const openRegionPicker = useCallback(() => {
    setPendingProvince(selectedProvince)
    setPendingDistrict(selectedDistrict)
    setRegionPickerVisible(true)
  }, [selectedProvince, selectedDistrict])

  const handleRegionConfirm = useCallback(() => {
    setSelectedProvince(pendingProvince)
    setSelectedDistrict(pendingDistrict)
    const isWholeRegion = pendingDistrict === '전국' || pendingDistrict === `${pendingProvince}전체`
    const label = isWholeRegion ? pendingProvince : `${pendingProvince} ${pendingDistrict}`
    setFilterRegion(label)
    setRegionPickerVisible(false)
  }, [pendingProvince, pendingDistrict])

  const handleProvinceChange = useCallback((p: string) => {
    setPendingProvince(p)
    const first = DISTRICTS[p]?.[0] ?? ''
    setPendingDistrict(first)
  }, [])

  const toggleFavorite = useCallback(
    (id: number) => {
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      toggleFavoriteAPI(id)
    },
    [toggleFavoriteAPI]
  )

  const renderMasterCard = useCallback(
    ({ item }: { item: MasterItem }) => (
      <MasterCard
        item={item}
        onPress={() => navigation.navigate('CustomerMasterDetail', { expertProfileId: item.id })}
        onFavoritePress={() => toggleFavorite(item.id)}
      />
    ),
    [navigation, toggleFavorite]
  )

  const regionChipLabel = filterRegion ?? '지역'
  const isRegionActive = filterRegion !== null

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 제목 */}
      <View style={{ paddingTop: insets.top + 24 }} className="px-[26px]">
        <Text className="font-pretendard-extrabold text-title text-gray3">명인탐색</Text>
      </View>

      {/* 검색바 + 필터 칩 */}
      <View className="mt-5 flex-row items-center gap-2 px-[26px]">
        {/* 검색창 — Figma 2272:12405: 36h, bg #D9D9D9, radius 8, 테두리 없음, 텍스트 left 16 */}
        <View className="h-[36px] flex-1 flex-row items-center overflow-hidden rounded-lg bg-gray1 pl-4">
          {/* Android TextInput 기본 상하 padding 때문에 36h 안에서 글자 윗부분이 잘려 py-0 + 세로 가운데 정렬 */}
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="명인 직접검색"
            placeholderTextColor="#A2A2A2"
            returnKeyType="search"
            textAlignVertical="center"
            className="h-full flex-1 py-0 font-pretendard-medium text-[13px] text-gray3"
          />
          <View className="items-center justify-center">
            <SearchOutlineIcon size={44} />
          </View>
        </View>

        {/* 지역 필터 칩 — Figma: 36h, radius 18, px 12, 기본 bg #D9D9D9 / 선택 bg #1F2A43, 테두리 없음 */}
        <Pressable
          hitSlop={8}
          onPress={openRegionPicker}
          className={`h-[36px] flex-row items-center gap-2 rounded-[18px] px-3 ${
            isRegionActive ? 'bg-gray3' : 'bg-gray1'
          }`}
        >
          <Text
            className={`font-pretendard-medium text-[13px] ${
              isRegionActive ? 'text-[#F2F2F2]' : 'text-gray3'
            }`}
          >
            {regionChipLabel}
          </Text>
          {/* 드롭다운 화살표 — Figma Vector 9: stroke #74768E 1px (선택 여부 무관) */}
          <View
            style={{
              width: 6,
              height: 6,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderColor: '#74768E',
              transform: [{ rotate: '45deg' }],
              marginBottom: 3,
            }}
          />
        </Pressable>

        {/* 4점 이상 필터 칩 */}
        <Pressable
          hitSlop={8}
          onPress={() => setFilterRating((v) => !v)}
          className={`h-[36px] items-center justify-center rounded-[18px] px-3 ${
            filterRating ? 'bg-gray3' : 'bg-gray1'
          }`}
        >
          <Text
            className={`font-pretendard-medium text-[13px] ${
              filterRating ? 'text-[#F2F2F2]' : 'text-gray3'
            }`}
          >
            4점 이상
          </Text>
        </Pressable>
      </View>

      {/* 명인 목록 */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C6A75E" />
        </View>
      ) : (
        <FlatList
          data={masters}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMasterCard}
          contentContainerStyle={{
            paddingHorizontal: 26,
            paddingTop: 28,
            paddingBottom: 24,
          }}
          ItemSeparatorComponent={() => <View className="h-[20px]" />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View className="items-center pt-20">
              <Text className="font-pretendard-medium text-[14px] text-[#74768E]">
                {debouncedSearch || filterRegion || filterRating
                  ? '조건에 맞는 명인이 없습니다'
                  : '등록된 명인이 없습니다'}
              </Text>
            </View>
          }
        />
      )}

      {/* 지역 선택 모달 */}
      <RegionPicker
        visible={regionPickerVisible}
        province={pendingProvince}
        district={pendingDistrict}
        onProvinceChange={handleProvinceChange}
        onDistrictChange={setPendingDistrict}
        onConfirm={handleRegionConfirm}
        onClose={() => setRegionPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  )
}
