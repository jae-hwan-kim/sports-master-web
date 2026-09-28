import { useCallback, useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
  value: string
  onChange: (region: string) => void
}

type Selection = {
  province: string
  district: string | null // null = 전체
}

type DistrictItem = {
  key: string
  displayName: string
  district: string | null
}

const REGIONS: Record<string, string[]> = {
  서울: [
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
  경기: [
    '수원시',
    '고양시',
    '용인시',
    '성남시',
    '부천시',
    '화성시',
    '안산시',
    '남양주시',
    '안양시',
    '평택시',
    '시흥시',
    '파주시',
    '의정부시',
    '김포시',
    '광주시',
    '광명시',
    '군포시',
    '하남시',
    '오산시',
    '이천시',
    '안성시',
    '양주시',
    '구리시',
    '포천시',
    '의왕시',
    '여주시',
    '동두천시',
    '과천시',
    '가평군',
    '양평군',
    '연천군',
  ],
  인천: [
    '계양구',
    '남동구',
    '동구',
    '미추홀구',
    '부평구',
    '서구',
    '연수구',
    '옹진군',
    '중구',
    '강화군',
  ],
  대전: ['대덕구', '동구', '서구', '유성구', '중구'],
  세종: ['세종시 전체'],
  충남: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시'],
  충북: ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군'],
  '전남·광주': [
    '목포시',
    '여수시',
    '순천시',
    '나주시',
    '광양시',
    '광산구',
    '남구',
    '동구',
    '북구',
    '서구',
  ],
  전북: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시'],
  대구: ['달서구', '달성군', '동구', '북구', '서구', '수성구', '중구', '남구'],
  경북: [
    '포항시',
    '경주시',
    '김천시',
    '안동시',
    '구미시',
    '영주시',
    '영천시',
    '상주시',
    '문경시',
    '경산시',
  ],
  부산: [
    '강서구',
    '금정구',
    '기장군',
    '남구',
    '동구',
    '동래구',
    '부산진구',
    '북구',
    '사상구',
    '사하구',
    '서구',
    '수영구',
    '연제구',
    '영도구',
    '중구',
    '해운대구',
  ],
  울산: ['남구', '동구', '북구', '울주군', '중구'],
  경남: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시'],
  강원: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시'],
  제주: ['제주시', '서귀포시'],
  전국: ['전국 전체'],
}

const PROVINCES = Object.keys(REGIONS)

function parseValue(v: string): Selection[] {
  if (!v.trim()) return []
  return v
    .split(', ')
    .map((s) => {
      const parts = s.split(' > ')
      return { province: parts[0]?.trim() ?? '', district: parts[1]?.trim() ?? null }
    })
    .filter((s) => s.province)
}

function CheckCircle({ selected }: { selected: boolean }) {
  return (
    <View
      className={`h-[20px] w-[20px] items-center justify-center rounded-full border-[1.5px] ${
        selected ? 'border-[#C6A75E] bg-[#C6A75E]' : 'border-[#CCCCCC]'
      }`}
    >
      <Text
        className={`text-[10px] ${selected ? 'text-white' : 'text-[#CCCCCC]'}`}
        style={{ fontFamily: 'Pretendard-Bold', lineHeight: 13 }}
      >
        ✓
      </Text>
    </View>
  )
}

export function RegionSelector({ value, onChange }: Props) {
  const insets = useSafeAreaInsets()
  const [modalVisible, setModalVisible] = useState(false)
  const [activeProvince, setActiveProvince] = useState<string>(PROVINCES[0])
  const [selections, setSelections] = useState<Selection[]>([])

  const openModal = () => {
    const parsed = parseValue(value)
    setSelections(parsed)
    setActiveProvince(parsed[0]?.province ?? PROVINCES[0])
    setModalVisible(true)
  }

  const handleClose = () => setModalVisible(false)

  const handleConfirm = () => {
    const result = selections
      .map((s) => (s.district === null ? s.province : `${s.province} > ${s.district}`))
      .join(', ')
    onChange(result)
    setModalVisible(false)
  }

  const resetSelections = () => setSelections([])

  const removeSelection = useCallback((item: Selection) => {
    setSelections((prev) =>
      prev.filter((s) => !(s.province === item.province && s.district === item.district))
    )
  }, [])

  const handleToggleDistrict = useCallback(
    (district: string | null) => {
      const selected = selections.some(
        (s) => s.province === activeProvince && s.district === district
      )
      if (selected) {
        setSelections((prev) =>
          prev.filter((s) => !(s.province === activeProvince && s.district === district))
        )
      } else {
        // 전체 선택 시 해당 도의 개별 선택 전부 제거, 개별 선택 시 전체 제거
        const without =
          district === null
            ? selections.filter((s) => s.province !== activeProvince)
            : selections.filter((s) => !(s.province === activeProvince && s.district === null))
        if (without.length < 3) {
          setSelections([...without, { province: activeProvince, district }])
        }
      }
    },
    [selections, activeProvince]
  )

  const districtItems = useMemo<DistrictItem[]>(
    () => [
      { key: '__all__', displayName: '전체', district: null },
      ...(REGIONS[activeProvince] ?? []).map((d) => ({ key: d, displayName: d, district: d })),
    ],
    [activeProvince]
  )

  const renderProvince = useCallback(
    ({ item }: { item: string }) => {
      const active = item === activeProvince
      const count = selections.filter((s) => s.province === item).length
      return (
        <Pressable
          onPress={() => setActiveProvince(item)}
          className={`h-[46px] flex-row items-center justify-between px-4 ${active ? 'bg-[#F2F2F2]' : ''}`}
        >
          <Text
            className={`text-[16px] ${active ? 'text-[#07091C]' : 'text-[#7B7B7B]'}`}
            style={{ fontFamily: active ? 'Pretendard-SemiBold' : 'Pretendard-Medium' }}
          >
            {item}
          </Text>
          {count > 0 && (
            <View className="h-[20px] w-[20px] items-center justify-center rounded-full bg-[#C6A75E]">
              <Text className="text-[11px] text-white" style={{ fontFamily: 'Pretendard-Bold' }}>
                {count}
              </Text>
            </View>
          )}
        </Pressable>
      )
    },
    [activeProvince, selections]
  )

  const renderDistrict = useCallback(
    ({ item }: { item: DistrictItem }) => {
      const selected = selections.some(
        (s) => s.province === activeProvince && s.district === item.district
      )
      return (
        <Pressable
          onPress={() => handleToggleDistrict(item.district)}
          className="h-[46px] flex-row items-center gap-3 px-4"
        >
          <CheckCircle selected={selected} />
          <Text
            className={`text-[16px] ${selected ? 'text-[#07091C]' : 'text-[#7B7B7B]'}`}
            style={{ fontFamily: selected ? 'Pretendard-SemiBold' : 'Pretendard-Medium' }}
          >
            {item.displayName}
          </Text>
        </Pressable>
      )
    },
    [selections, activeProvince, handleToggleDistrict]
  )

  const renderChip = useCallback(
    ({ item }: { item: Selection }) => (
      <Pressable
        hitSlop={4}
        onPress={() => removeSelection(item)}
        className="flex-row items-center gap-1 rounded-full border border-[#D9D9D9] bg-[#F2F2F2] px-3 py-[5px]"
        accessibilityRole="button"
      >
        <Text className="text-[13px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-Medium' }}>
          {item.district === null ? item.province : `${item.province} > ${item.district}`}
        </Text>
        <Text className="text-[11px] text-[#74768E]">×</Text>
      </Pressable>
    ),
    [removeSelection]
  )

  return (
    <>
      <Pressable
        hitSlop={8}
        onPress={openModal}
        className="h-[50px] flex-row items-center justify-between rounded-lg border border-[#D9D9D9] bg-white px-4"
        accessibilityRole="button"
        accessibilityLabel="지역 선택"
      >
        <Text
          className={`flex-1 text-[13px] ${value ? 'text-[#1F2A43]' : 'text-[#74768E]'}`}
          style={{ fontFamily: 'Pretendard-Medium' }}
          numberOfLines={1}
        >
          {value || '지역 선택'}
        </Text>
        <Text className="text-[13px] text-[#74768E]">▼</Text>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={handleClose}>
        <View className="flex-1 justify-end">
          {/* 딤 배경 */}
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          />

          {/* 바텀 시트 */}
          <View className="h-[88%] overflow-hidden rounded-t-[24px] bg-white">
            {/* 헤더 */}
            <View className="h-[56px] flex-row items-center justify-center">
              <Text
                className="text-[20px] text-[#07091C]"
                style={{ fontFamily: 'Pretendard-SemiBold' }}
              >
                지역 선택
              </Text>
              <Pressable
                hitSlop={12}
                onPress={handleClose}
                className="absolute right-5"
                accessibilityRole="button"
                accessibilityLabel="닫기"
              >
                <Text className="text-[18px] text-[#07091C]">✕</Text>
              </Pressable>
            </View>

            {/* 구분선 */}
            <View className="h-[1px] bg-[#E9E9E9]" />

            {/* 두 컬럼 */}
            <View className="flex-1 flex-row">
              {/* 왼쪽: 도/시 */}
              <FlatList
                className="flex-1"
                data={PROVINCES}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={renderProvince}
              />
              <View className="w-[1px] bg-[#E9E9E9]" />
              {/* 오른쪽: 구/군 */}
              <FlatList
                key={activeProvince}
                className="flex-1"
                data={districtItems}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                renderItem={renderDistrict}
              />
            </View>

            {/* 하단 바 */}
            <View className="border-t border-[#E9E9E9] bg-white">
              {/* 선택 개수 + 초기화 */}
              <View className="flex-row items-center justify-between px-4 pb-1 pt-3">
                <Text
                  className="text-[13px] text-[#74768E]"
                  style={{ fontFamily: 'Pretendard-Medium' }}
                >
                  선택한 지역 {selections.length}
                </Text>
                <Pressable
                  hitSlop={8}
                  onPress={resetSelections}
                  className="flex-row items-center gap-1"
                  accessibilityRole="button"
                  accessibilityLabel="초기화"
                >
                  <Text
                    className="text-[13px] text-[#74768E]"
                    style={{ fontFamily: 'Pretendard-Medium' }}
                  >
                    ↺ 초기화
                  </Text>
                </Pressable>
              </View>

              {/* 선택된 지역 칩 */}
              {selections.length > 0 && (
                <FlatList
                  horizontal
                  data={selections}
                  keyExtractor={(item) => `${item.province}-${item.district ?? 'all'}`}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6, gap: 8 }}
                  renderItem={renderChip}
                />
              )}
              {selections.length === 0 && <View className="h-[36px]" />}

              {/* 적용하기 버튼 */}
              <View className="px-4 pb-3 pt-1">
                <Pressable
                  hitSlop={0}
                  onPress={handleConfirm}
                  className="h-[50px] items-center justify-center rounded-[10px] bg-[#C6A75E]"
                  accessibilityRole="button"
                  accessibilityLabel="적용하기"
                >
                  <Text
                    className="text-[17px] text-white"
                    style={{ fontFamily: 'Pretendard-SemiBold' }}
                  >
                    적용하기
                  </Text>
                </Pressable>
              </View>
              <View style={{ height: insets.bottom }} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}
