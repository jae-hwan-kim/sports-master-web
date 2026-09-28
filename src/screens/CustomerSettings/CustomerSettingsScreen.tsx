import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArrowBackIcon, EditIcon, ProfilePersonIcon } from '@/assets/icons'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TextField } from '@/components/TextField'
import { KeywordChipInput } from '@/components/profile/KeywordChipInput'
import { RegionSelector } from '@/components/profile/RegionSelector'
import { RootStackParamList } from '@/navigation/RootNavigator'

type Mode = 'view' | 'edit'

const GENDER_OPTIONS: string[] = ['여성', '남성']
const AGE_OPTIONS: string[] = ['10대', '20대', '30대', '40대', '50대', '60대 이상']

// KeywordChipInput의 PRESET_KEYWORDS와 동일 — VIEW 모드 표시용
const PRESET_KEYWORDS = [
  '컨디셔닝',
  '재활운동',
  '체형교정',
  '기능성운동',
  '선수트레이닝',
  '아동발달',
  '방문재활',
  '1:1 지도',
  '필라테스',
  '특수치료',
  '체형분석',
  '식단관리',
  '시니어운동',
  '수술재활',
  '원장직강',
]

export function CustomerSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()

  // 저장된 실제 상태
  const [region, setRegion] = useState('')
  const [sport, setSport] = useState('')
  const [gender, setGender] = useState<'여성' | '남성' | null>(null)
  const [ageGroup, setAgeGroup] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])

  // 편집 모드 초안 상태
  const [draftRegion, setDraftRegion] = useState('')
  const [draftSport, setDraftSport] = useState('')
  const [draftGender, setDraftGender] = useState<'여성' | '남성' | null>(null)
  const [draftAgeGroup, setDraftAgeGroup] = useState<string | null>(null)
  const [draftKeywords, setDraftKeywords] = useState<string[]>([])

  const [mode, setMode] = useState<Mode>('view')
  const [saveDialogVisible, setSaveDialogVisible] = useState(false)
  const [exitDialogVisible, setExitDialogVisible] = useState(false)

  const enterEditMode = useCallback(() => {
    setDraftRegion(region)
    setDraftSport(sport)
    setDraftGender(gender)
    setDraftAgeGroup(ageGroup)
    setDraftKeywords([...keywords])
    setMode('edit')
  }, [region, sport, gender, ageGroup, keywords])

  const handleBack = useCallback(() => {
    if (mode === 'edit') {
      setExitDialogVisible(true)
    } else {
      navigation.goBack()
    }
  }, [mode, navigation])

  const handleSaveConfirm = useCallback(() => {
    setRegion(draftRegion)
    setSport(draftSport)
    setGender(draftGender)
    setAgeGroup(draftAgeGroup)
    setKeywords([...draftKeywords])
    setSaveDialogVisible(false)
    setMode('view')
  }, [draftRegion, draftSport, draftGender, draftAgeGroup, draftKeywords])

  const handleExitConfirm = useCallback(() => {
    setExitDialogVisible(false)
    setMode('view')
  }, [])

  // VIEW 모드 — 성별/연령 선택된 항목 칩 렌더
  const renderViewGenderAgeChip = useCallback(
    ({ item }: { item: string }) => (
      <View className="mr-2 h-[34px] items-center justify-center rounded-full bg-[#1F2A43] px-4">
        <Text className="text-[13px] text-[#F2F2F2]" style={{ fontFamily: 'Pretendard-Medium' }}>
          {item}
        </Text>
      </View>
    ),
    []
  )

  // VIEW 모드 — 키워드 칩 렌더 (선택: 진남색, 미선택: 회색)
  const renderViewKeyword = useCallback(
    ({ item }: { item: string }) => {
      const selected = keywords.includes(item)
      return (
        <View
          className={`m-1 h-[34px] flex-1 items-center justify-center rounded-[82px] border px-2 ${
            selected ? 'border-[#1F2A43] bg-[#1F2A43]' : 'border-[#74768E] bg-[#F2F2F2]'
          }`}
        >
          <Text
            className={`text-[13px] ${selected ? 'text-[#F2F2F2]' : 'text-[#07091C]'}`}
            style={{ fontFamily: 'Pretendard-Medium' }}
            numberOfLines={1}
          >
            {item}
          </Text>
        </View>
      )
    },
    [keywords]
  )

  // EDIT 모드 — 성별 토글 칩
  const renderGenderChip = useCallback(
    ({ item }: { item: string }) => {
      const selected = draftGender === item
      return (
        <Pressable
          hitSlop={4}
          onPress={() => setDraftGender(selected ? null : (item as '여성' | '남성'))}
          className={`mr-2 h-[34px] min-w-[60px] items-center justify-center rounded-full px-4 ${
            selected ? 'bg-[#1F2A43]' : 'bg-[#A2A2A2]'
          }`}
          accessibilityRole="button"
          accessibilityLabel={item}
        >
          <Text className="text-[13px] text-[#F2F2F2]" style={{ fontFamily: 'Pretendard-Medium' }}>
            {item}
          </Text>
        </Pressable>
      )
    },
    [draftGender]
  )

  // EDIT 모드 — 연령 토글 칩 (numColumns={3} 그리드)
  const renderAgeChip = useCallback(
    ({ item }: { item: string }) => {
      const selected = draftAgeGroup === item
      return (
        <Pressable
          hitSlop={4}
          onPress={() => setDraftAgeGroup(selected ? null : item)}
          className={`m-1 h-[34px] flex-1 items-center justify-center rounded-full px-2 ${
            selected ? 'bg-[#1F2A43]' : 'bg-[#A2A2A2]'
          }`}
          accessibilityRole="button"
          accessibilityLabel={item}
        >
          <Text
            className="text-[13px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-Medium' }}
            numberOfLines={1}
          >
            {item}
          </Text>
        </Pressable>
      )
    },
    [draftAgeGroup]
  )

  const viewGenderAgeChips = [...(gender ? [gender] : []), ...(ageGroup ? [ageGroup] : [])]

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F2F2F2]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <View
        className="h-14 flex-row items-center justify-between px-4"
        style={{ marginTop: insets.top }}
      >
        <Pressable
          hitSlop={8}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <ArrowBackIcon />
        </Pressable>

        {mode === 'view' ? (
          <Pressable
            hitSlop={8}
            onPress={enterEditMode}
            accessibilityRole="button"
            accessibilityLabel="편집"
          >
            <EditIcon size={24} />
          </Pressable>
        ) : (
          <Pressable
            hitSlop={8}
            onPress={() => setSaveDialogVisible(true)}
            className="h-[24px] w-[56px] items-center justify-center rounded-[4px] bg-[#1F2A43]"
            accessibilityRole="button"
            accessibilityLabel="수정완료"
          >
            <Text
              className="text-[11px] text-[#F2F2F2]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              수정완료
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* 타이틀 영역 — VIEW 전용 */}
        {mode === 'view' && (
          <View className="px-6 pb-2 pt-4">
            <Text
              className="text-[28px] text-[#07091C]"
              style={{ fontFamily: 'Pretendard-ExtraBold' }}
            >
              계정설정
            </Text>
            <Text
              className="mt-1 text-[13px] text-[#74768E]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              전문가에게 보여질 내 정보를 수정합니다
            </Text>
          </View>
        )}

        {/* 프로필 */}
        <View className="items-center py-6">
          <View className="h-[80px] w-[80px] items-center justify-center rounded-full bg-[#C6A75E]">
            <ProfilePersonIcon size={54} />
          </View>
          <Text
            className="mt-2 text-[17px] text-[#07091C]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            닉네임
          </Text>
          <Text className="text-[13px] text-[#C6A75E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            #USER00001
          </Text>
        </View>

        {/* 지역 */}
        <View className="px-6 pb-6">
          <Text
            className="mb-3 text-[17px] text-[#07091C]"
            style={{ fontFamily: 'Pretendard-Bold' }}
          >
            지역
          </Text>
          {mode === 'view' ? (
            <View className="h-[50px] flex-row items-center justify-between rounded-lg border border-[#D9D9D9] bg-[#FFFFFF] px-4">
              <Text
                className={`flex-1 text-[13px] ${region ? 'text-[#1F2A43]' : 'text-[#74768E]'}`}
                style={{ fontFamily: 'Pretendard-Medium' }}
                numberOfLines={1}
              >
                {region || '거주지 or 이동가능지역'}
              </Text>
              <Text className="text-[13px] text-[#74768E]">{'>'}</Text>
            </View>
          ) : (
            <RegionSelector value={draftRegion} onChange={setDraftRegion} />
          )}
        </View>

        {/* 대표운동 */}
        <View className="px-6 pb-6">
          <Text
            className="mb-3 text-[17px] text-[#07091C]"
            style={{ fontFamily: 'Pretendard-Bold' }}
          >
            대표운동
          </Text>
          {mode === 'view' ? (
            <View className="h-[50px] flex-row items-center rounded-lg border border-[#D9D9D9] bg-[#FFFFFF] px-4">
              <Text
                className={`text-[13px] ${sport ? 'text-[#1F2A43]' : 'text-[#74768E]'}`}
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                {sport || '내가 즐기는 스포츠'}
              </Text>
            </View>
          ) : (
            <TextField value={draftSport} onChangeText={setDraftSport} label="내가 즐기는 스포츠" />
          )}
        </View>

        {/* 성별/연령 */}
        <View className="px-6 pb-6">
          <Text
            className="mb-3 text-[17px] text-[#07091C]"
            style={{ fontFamily: 'Pretendard-Bold' }}
          >
            성별/연령
          </Text>
          {mode === 'view' ? (
            viewGenderAgeChips.length > 0 ? (
              <FlatList
                horizontal
                scrollEnabled={false}
                data={viewGenderAgeChips}
                keyExtractor={(item) => item}
                renderItem={renderViewGenderAgeChip}
              />
            ) : (
              <Text
                className="text-[13px] text-[#74768E]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                미설정
              </Text>
            )
          ) : (
            <View>
              {/* 성별 칩 */}
              <FlatList
                horizontal
                scrollEnabled={false}
                data={GENDER_OPTIONS}
                keyExtractor={(item) => item}
                renderItem={renderGenderChip}
              />
              {/* 연령 칩 — 3열 그리드 */}
              <FlatList
                className="mt-2"
                data={AGE_OPTIONS}
                keyExtractor={(item) => item}
                numColumns={3}
                scrollEnabled={false}
                renderItem={renderAgeChip}
              />
            </View>
          )}
        </View>

        {/* 탐색키워드 */}
        <View className="px-6 pb-6">
          <View className="mb-3 flex-row items-center gap-2">
            <Text className="text-[17px] text-[#07091C]" style={{ fontFamily: 'Pretendard-Bold' }}>
              탐색키워드
            </Text>
            {mode === 'edit' && (
              <Text
                className="text-[13px] text-[#74768E]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                {draftKeywords.length}/3
              </Text>
            )}
          </View>
          {mode === 'view' ? (
            // VIEW: 전체 프리셋 표시, 선택된 것만 진남색 강조
            <FlatList
              data={PRESET_KEYWORDS}
              keyExtractor={(item) => item}
              numColumns={3}
              scrollEnabled={false}
              renderItem={renderViewKeyword}
            />
          ) : (
            <KeywordChipInput keywords={draftKeywords} onChange={setDraftKeywords} />
          )}
        </View>
      </ScrollView>

      {/* 저장 확인 다이얼로그 */}
      <ConfirmDialog
        visible={saveDialogVisible}
        title="저장하시겠습니까?"
        description="변경된 내용이 저장됩니다"
        confirmLabel="저장"
        cancelLabel="취소"
        onConfirm={handleSaveConfirm}
        onCancel={() => setSaveDialogVisible(false)}
      />

      {/* 수정 종료 확인 다이얼로그 */}
      <ConfirmDialog
        visible={exitDialogVisible}
        title="수정을 종료하시겠습니까?"
        description="변경된 내용은 저장되지 않습니다"
        confirmLabel="종료"
        cancelLabel="취소"
        onConfirm={handleExitConfirm}
        onCancel={() => setExitDialogVisible(false)}
      />
    </KeyboardAvoidingView>
  )
}
