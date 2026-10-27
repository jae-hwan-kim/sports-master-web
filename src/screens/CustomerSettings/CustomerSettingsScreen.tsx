import { useNavigation, usePreventRemove } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useMemo, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'

import { ArrowBackIcon, EditIcon, ProfilePersonIcon } from '@/assets/icons'
import { Text, TextInput } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { KeywordChipInput } from '@/components/profile/KeywordChipInput'
import { RegionSelector } from '@/components/profile/RegionSelector'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { useUpdateCustomerProfile } from '@/hooks/useUpdateCustomerProfile'
import { RootStackParamList } from '@/navigation/RootNavigator'

type Mode = 'view' | 'edit'

const GENDER_OPTIONS: string[] = ['여성', '남성']
const AGE_OPTIONS: string[] = ['10대', '20대', '30대', '40대', '50대', '60대 이상']

const GENDER_TO_KO: Record<string, '여성' | '남성'> = { female: '여성', male: '남성' }
const GENDER_TO_API: Record<string, 'male' | 'female' | 'other'> = {
  여성: 'female',
  남성: 'male',
}
const AGE_TO_KO: Record<string, string> = {
  '10s': '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60s_plus': '60대 이상',
}
const AGE_TO_API: Record<string, '10s' | '20s' | '30s' | '40s' | '50s' | '60s_plus'> = {
  '10대': '10s',
  '20대': '20s',
  '30대': '30s',
  '40대': '40s',
  '50대': '50s',
  '60대 이상': '60s_plus',
}
const INPUT_BOX_SHADOW = Platform.select({
  ios: {
    shadowColor: 'rgba(0,0,0,1)',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 2.9,
  },
  android: { elevation: 2 },
})

export function CustomerSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useScreenInsets()

  const { data: profile } = useCustomerProfile()
  const { mutate: updateProfile, isPending: isSaving } = useUpdateCustomerProfile()

  // 저장된 실제 상태 — API 데이터 기반
  const region = profile?.region ?? ''
  const sport = profile?.mainSport ?? ''
  const gender = profile?.gender ? (GENDER_TO_KO[profile.gender] ?? null) : null
  const ageGroup = profile?.ageGroup ? (AGE_TO_KO[profile.ageGroup] ?? null) : null
  const keywords = useMemo(() => profile?.keywordTags ?? [], [profile?.keywordTags])

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

  // 수정 중에는 헤더·하드웨어 뒤로가기·iOS 스와이프 모두 수정 종료 확인 팝업 (확인 시 보기 모드로 복귀)
  usePreventRemove(mode === 'edit', () => setExitDialogVisible(true))

  const handleBack = useCallback(() => navigation.goBack(), [navigation])

  const handleSaveConfirm = useCallback(() => {
    updateProfile(
      {
        // 빈 값도 그대로 보내야 지운 항목이 서버에 반영됨
        region: draftRegion,
        sports: draftSport ? [draftSport] : [],
        gender: draftGender ? GENDER_TO_API[draftGender] : undefined,
        ageGroup: draftAgeGroup ? AGE_TO_API[draftAgeGroup] : undefined,
        keywords: draftKeywords,
      },
      {
        onSuccess: () => {
          setSaveDialogVisible(false)
          setMode('view')
        },
      }
    )
  }, [draftRegion, draftSport, draftGender, draftAgeGroup, draftKeywords, updateProfile])

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

  // VIEW 모드 — 선택된 키워드 칩 렌더 (horizontal)
  const renderViewKeyword = useCallback(
    ({ item }: { item: string }) => (
      <View className="mr-2 h-[34px] items-center justify-center rounded-[82px] bg-[#1F2A43] px-3">
        <Text className="text-[13px] text-[#F2F2F2]" style={{ fontFamily: 'Pretendard-Medium' }}>
          {item}
        </Text>
      </View>
    ),
    []
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
        className="h-[60px] flex-row items-center justify-between px-4"
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
          <Pressable onPress={enterEditMode} accessibilityRole="button" accessibilityLabel="편집">
            {/* edit.svg는 44 viewBox 안에 24 글리프 — Figma edit 인스턴스(44×44) 그대로 */}
            <EditIcon size={44} />
          </Pressable>
        ) : (
          <Pressable
            hitSlop={8}
            onPress={() => setSaveDialogVisible(true)}
            disabled={isSaving}
            className="h-[24px] w-[56px] items-center justify-center rounded-[4px] bg-[#1F2A43]"
            accessibilityRole="button"
            accessibilityLabel="수정완료"
          >
            <Text
              className="text-[11px] text-[#F2F2F2]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              {isSaving ? '저장중' : '수정완료'}
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
              className="text-[28px] text-[#1F2A43]"
              style={{ fontFamily: 'Pretendard-ExtraBold' }}
            >
              계정설정
            </Text>
            <Text
              className="mt-1 text-[13px] text-[#74768E]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              전문가에게 보여질 내 정보를 저장하고 수정합니다
            </Text>
          </View>
        )}

        {/* 프로필 */}
        <View className="items-center py-6">
          <View className="h-[80px] w-[80px] items-center justify-center rounded-full bg-[#C6A75E]">
            <ProfilePersonIcon size={54} />
          </View>
          <Text
            className="mt-2 text-[20px] text-[#1F2A43]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            {profile?.nickname || profile?.name || '닉네임'}
          </Text>
          <Text
            className="text-[13px] text-[#B48247]"
            style={{ fontFamily: 'Pretendard-Medium', textDecorationLine: 'underline' }}
          >
            {`#USER${String(profile?.userId ?? 0).padStart(5, '0')}`}
          </Text>
        </View>

        {/* 지역 */}
        <View className="px-6 pb-6">
          <Text
            className="mb-3 text-[16px] text-[#1F2A43]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            지역
          </Text>
          {mode === 'view' ? (
            <View
              className="h-[46px] flex-row items-center justify-between rounded-[4px] bg-[#F2F2F2] px-4"
              style={INPUT_BOX_SHADOW}
            >
              <Text
                className={`flex-1 text-[13px] ${region ? 'text-[#1F2A43]' : 'text-[#74768E]'}`}
                style={{ fontFamily: 'Pretendard-Medium' }}
                numberOfLines={1}
              >
                {region || '거주지 or 이동가능지역을 알려주세요'}
              </Text>
              <Text className="text-[13px] text-[#74768E]">{'>'}</Text>
            </View>
          ) : (
            <RegionSelector value={draftRegion} onChange={setDraftRegion} />
          )}
        </View>

        {/* 내 증상 */}
        <View className="px-6 pb-6">
          <Text
            className="mb-3 text-[16px] text-[#1F2A43]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            내 증상
          </Text>
          {mode === 'view' ? (
            <View
              className="h-[46px] flex-row items-center rounded-[4px] bg-[#F2F2F2] px-4"
              style={INPUT_BOX_SHADOW}
            >
              <Text
                className={`text-[13px] ${sport ? 'text-[#1F2A43]' : 'text-[#74768E]'}`}
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                {sport || '입력된 정보가 없습니다'}
              </Text>
            </View>
          ) : (
            // Figma 정보수정: 보기 모드와 같은 #F2F2F2 + shadow 박스
            <View
              className="h-[46px] flex-row items-center rounded-[4px] bg-[#F2F2F2] px-4"
              style={INPUT_BOX_SHADOW}
            >
              <TextInput
                value={draftSport}
                onChangeText={setDraftSport}
                placeholder="입력된 정보가 없습니다"
                placeholderTextColor="#74768E"
                className="flex-1 text-[13px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-Medium', paddingVertical: 0 }}
                numberOfLines={1}
              />
            </View>
          )}
        </View>

        {/* 성별/연령 */}
        <View className="px-6 pb-6">
          <Text
            className="mb-3 text-[16px] text-[#1F2A43]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
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
                {'• 선택된 정보가 없습니다'}
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
            <Text
              className="text-[16px] text-[#1F2A43]"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
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
            keywords.length > 0 ? (
              <FlatList
                horizontal
                scrollEnabled={false}
                data={keywords}
                keyExtractor={(item) => item}
                renderItem={renderViewKeyword}
              />
            ) : (
              <Text
                className="text-[13px] text-[#74768E]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                {'• 선택된 키워드가 없습니다'}
              </Text>
            )
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
        confirmLabel="저장하기"
        cancelLabel="취소"
        onConfirm={handleSaveConfirm}
        onCancel={() => setSaveDialogVisible(false)}
      />

      {/* 수정 종료 확인 다이얼로그 */}
      <ConfirmDialog
        visible={exitDialogVisible}
        title="수정을 종료하시겠습니까?"
        description="변경된 내용은 저장되지 않습니다"
        confirmLabel="종료하기"
        cancelLabel="취소"
        onConfirm={handleExitConfirm}
        onCancel={() => setExitDialogVisible(false)}
      />
    </KeyboardAvoidingView>
  )
}
