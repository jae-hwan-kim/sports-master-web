import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native'

import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'

import { ArrowBackIcon } from '@/assets/icons'
import { Text, TextInput } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TextField } from '@/components/TextField'
import { ImageUploadGrid } from '@/components/profile/ImageUploadGrid'
import { KeywordChipInput } from '@/components/profile/KeywordChipInput'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { RegionSelector } from '@/components/profile/RegionSelector'
import { useAndroidBack } from '@/hooks/useAndroidBack'
import { useMyExpertProfile } from '@/hooks/useMyExpertProfile'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { useCreateCertification } from '@/hooks/useCreateCertification'
import { useUpdateExpertProfile } from '@/hooks/useUpdateExpertProfile'
import { isLocalUri, uploadExpertFiles } from '@/hooks/useUploadExpertFiles'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { formatPhone, isValidPhone, toPhoneDigits } from '@/utils/phone'

export function MasterDetailProfileEditScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useScreenInsets()
  const { data: profile } = useMyExpertProfile()
  const updateMutation = useUpdateExpertProfile()

  const [region, setRegion] = useState('')
  const [openChatUrl, setOpenChatUrl] = useState('')
  const [centerPhone, setCenterPhone] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  // 프로필 카드 대표 사진 — 하단 이미지(images)와 별개. 원격 URL 또는 새로 고른 로컬 uri
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  // 기존 PDF는 원격 URL, 새로 고르면 로컬 uri — 저장 시 로컬만 업로드
  const [portfolioPdf, setPortfolioPdf] = useState<{ uri: string; name: string } | null>(null)
  const [careerText, setCareerText] = useState('')
  const [certifications, setCertifications] = useState<string[]>([])

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  // 저장 단계 문구 — null이 아니면 저장 중 (업로드·등록이 순차라 수 초 걸림 → 진행 상황 노출)
  const [savingLabel, setSavingLabel] = useState<string | null>(null)
  const saving = savingLabel !== null
  // 저장 중 Android 뒤로가기 차단 — 업로드 도중 화면 이탈 방지
  useAndroidBack(useCallback(() => saving, [saving]))
  const { mutateAsync: createCertification } = useCreateCertification()

  useEffect(() => {
    if (!profile) return
    setRegion(profile.region ?? '')
    setOpenChatUrl(profile.kakaoOpenChatUrl ?? '')
    setCenterPhone(profile.centerPhone ?? '')
    setProfileImage(profile.profileImageUrl ?? null)
    setKeywords(profile.keywordTags ?? [])
    setImages(profile.portfolioImageUrls ?? [])
    setCareerText(profile.careerText ?? '')
    setPortfolioPdf(
      profile.educationPdfUrl
        ? { uri: profile.educationPdfUrl, name: 'portfolio.pdf' }
        : null
    )
  }, [profile])

  const regionCount = region ? region.split(', ').length : 0

  const handlePickCoverPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri)
    }
  }, [])

  const handlePickPdf = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    })
    if (!result.canceled && result.assets[0]) {
      setPortfolioPdf({ uri: result.assets[0].uri, name: result.assets[0].name })
    }
  }, [])

  const handleAddCertification = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      setCertifications((prev) => [...prev, ...result.assets.map((a) => a.uri)])
    }
  }, [])

  const handleRemoveCertification = useCallback((index: number) => {
    setCertifications((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handlePressSave = () => {
    if (centerPhone && !isValidPhone(centerPhone)) {
      setSaveError('센터연락처를 정확히 입력해 주세요 (예: 010-1234-5678)')
      return
    }
    setShowConfirmDialog(true)
  }

  const handleConfirmedSave = async () => {
    setShowConfirmDialog(false)
    setSavingLabel('저장 중...')
    try {
      // 새로 고른 로컬 이미지만 R2에 올리고, 원래 순서 그대로 원격 URL로 치환
      const localImages = images.filter(isLocalUri)
      if (localImages.length > 0) setSavingLabel('이미지 업로드 중...')
      const uploaded = await uploadExpertFiles(
        'image',
        localImages.map((uri) => ({ uri }))
      )
      let uploadedIndex = 0
      const portfolioImageUrls = images.map((uri) =>
        isLocalUri(uri) ? uploaded[uploadedIndex++] : uri
      )

      let profileImageUrl = profileImage ?? ''
      if (profileImage && isLocalUri(profileImage)) {
        setSavingLabel('프로필 사진 업로드 중...')
        ;[profileImageUrl] = await uploadExpertFiles('image', [{ uri: profileImage }])
      }

      let educationPdfUrl = portfolioPdf?.uri ?? ''
      if (portfolioPdf && isLocalUri(portfolioPdf.uri)) {
        setSavingLabel('포트폴리오 업로드 중...')
        const [pdfUrl] = await uploadExpertFiles('pdf', [
          { uri: portfolioPdf.uri, name: portfolioPdf.name, mimeType: 'application/pdf' },
        ])
        educationPdfUrl = pdfUrl
      }

      // 증명서는 자격증 검수 요청으로 1장씩 등록 — 성공분은 목록에서 비워 재시도 시 중복 등록 방지
      if (certifications.length > 0) setSavingLabel('증명서 등록 중...')
      for (const uri of certifications) {
        await createCertification({ fileUri: uri, type: 'license' })
        setCertifications((prev) => prev.filter((item) => item !== uri))
      }

      setSavingLabel('프로필 저장 중...')
      await updateMutation.mutateAsync({
        region: region || undefined,
        openChatUrl: openChatUrl || undefined,
        keywordTags: keywords.length > 0 ? keywords : undefined,
        careerText,
        portfolioImageUrls,
        profileImageUrl,
        // 빈 문자열이면 서버에서 삭제
        centerPhone,
        educationPdfUrl,
      })
      setShowSuccessDialog(true)
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message
      setSaveError(
        (Array.isArray(message) ? message[0] : message) ??
          '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      )
    } finally {
      setSavingLabel(null)
    }
  }

  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false)
    navigation.goBack()
  }

  const renderCertItem = useCallback(
    ({ item: uri, index }: { item: string; index: number }) => (
      <CertificationRow
        label={uri.split('/').pop() ?? `자격증 이미지 ${index + 1}`}
        onRemove={() => handleRemoveCertification(index)}
      />
    ),
    [handleRemoveCertification]
  )

  return (
    <View className="flex-1 bg-gray1">
      {/* 헤더 */}
      <View style={{ paddingTop: insets.top }}>
        <View className="h-14 flex-row items-center justify-between px-4">
          <Pressable
            hitSlop={8}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
          >
            <ArrowBackIcon />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={handlePressSave}
            disabled={saving}
            className="h-[24px] w-[56px] items-center justify-center rounded-[4px] bg-[#1F2A43]"
            accessibilityRole="button"
            accessibilityLabel="수정완료"
          >
            <Text
              className="text-[12px] text-[#F2F2F2]"
              style={{
                fontFamily: 'Pretendard-SemiBold',
                opacity: saving ? 0.4 : 1,
              }}
            >
              수정완료
            </Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 타이틀 */}
          <View className="px-6 pb-4 pt-2">
            <Text
              className="text-[28px] text-[#07091C]"
              style={{ fontFamily: 'Pretendard-ExtraBold' }}
            >
              상세프로필
            </Text>
            <Text
              className="mt-1 text-[12px] text-[#74768E]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              {'전문성을 나타낼 수 있는 정보를 업로드하고,\n내 정보를 수정할 수 있습니다.'}
            </Text>
          </View>

          {/* 프로필 카드 */}
          {profile && (
            <View className="mx-6">
              <View>
                <ProfileCard profile={{ ...profile, profileImageUrl: profileImage }} />
                <Pressable
                  hitSlop={8}
                  onPress={handlePickCoverPhoto}
                  className="absolute inset-0"
                  accessibilityRole="button"
                  accessibilityLabel="대표 사진 변경"
                >
                  <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-black/50">
                    <Text className="text-white" style={{ fontSize: 14 }}>
                      ✎
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}

          {/* 지역 */}
          <SectionLabel label="지역" count={regionCount} max={3} />
          <View className="mx-6">
            <RegionSelector value={region} onChange={setRegion} />
          </View>

          {/* 센터정보 */}
          <SectionLabel label="센터정보" />
          <View className="mx-6">
            <TextField
              value={openChatUrl}
              onChangeText={setOpenChatUrl}
              label="URL 입력 (예: 카카오 오픈채팅)"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 센터연락처 — 숫자만 입력, 하이픈은 자동 표시 (state·서버는 숫자만) */}
          <SectionLabel label="센터연락처" />
          <View className="mx-6">
            <TextField
              value={formatPhone(centerPhone)}
              onChangeText={(text) => setCenterPhone(toPhoneDigits(text))}
              label="연락처 입력 (예: 010-0000-0000)"
              keyboardType="number-pad"
              maxLength={13}
              autoCorrect={false}
            />
          </View>

          {/* 키워드 */}
          <SectionLabel label="키워드" count={keywords.length} max={3} />
          <View className="mx-6">
            <KeywordChipInput keywords={keywords} onChange={setKeywords} />
          </View>

          {/* 이미지 */}
          <SectionLabel label="이미지" count={images.length} max={3} />
          <View className="mx-6">
            <ImageUploadGrid images={images} onChange={setImages} maxCount={3} />
          </View>

          {/* 포트폴리오 */}
          <SectionLabel label="포트폴리오" />
          <View className="mx-6">
            <Pressable
              hitSlop={8}
              onPress={handlePickPdf}
              className="flex-row items-center rounded-[4px] bg-[#F2F2F2] px-[13px] py-[15px]"
              accessibilityRole="button"
              accessibilityLabel="PDF 선택"
            >
              <Text
                className="flex-1 text-[13px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-Medium' }}
                numberOfLines={1}
              >
                {portfolioPdf?.name || 'PDF 용량 99MB 이하'}
              </Text>
            </Pressable>
          </View>

          {/* 학력 및 경력사항 */}
          <SectionLabel label="학력 및 경력사항" />
          <View className="mx-6">
            <View
              className="rounded-[4px] bg-[#F2F2F2] px-[13px] py-[15px]"
              style={{ minHeight: 164 }}
            >
              <TextInput
                value={careerText}
                onChangeText={setCareerText}
                multiline
                placeholder="출신학교, 경력사항, 논문, 이력 등을 입력하세요"
                placeholderTextColor="#74768E"
                className="text-[13px] text-[#1F2A43]"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  fontFamily: 'Pretendard-Medium',
                  minHeight: 140,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </View>

          {/* 증명서 */}
          <SectionLabel label="증명서" />
          <View className="mx-6 gap-3">
            <FlatList
              data={certifications}
              keyExtractor={(uri, index) => `cert-${index}-${uri}`}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={renderCertItem}
              ListFooterComponent={
                <View style={{ marginTop: certifications.length > 0 ? 12 : 0 }}>
                  <Pressable
                    hitSlop={8}
                    onPress={handleAddCertification}
                    className="flex-row items-center rounded-[4px] bg-[#F2F2F2] px-[13px] py-[15px]"
                    accessibilityRole="button"
                    accessibilityLabel="자격증 이미지 추가"
                  >
                    <Text
                      className="text-[13px] text-[#74768E]"
                      style={{ fontFamily: 'Pretendard-Medium' }}
                    >
                      + 자격증 이미지 추가
                    </Text>
                  </Pressable>
                </View>
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 저장 확인 다이얼로그 — Figma: 저장하기(골드) / 취소 */}
      <ConfirmDialog
        visible={showConfirmDialog}
        title="프로필을 저장할까요?"
        description="수정사항이 즉시 반영됩니다"
        confirmLabel="저장하기"
        cancelLabel="취소"
        onConfirm={handleConfirmedSave}
        onCancel={() => setShowConfirmDialog(false)}
      />

      {/* 저장 중 오버레이 — 화면 전체 터치 차단. 완료/실패 다이얼로그(Modal)와 겹쳐도 iOS에서
          Modal 전환 충돌이 없도록 Modal이 아닌 absolute View 사용 */}
      {saving && (
        <View className="absolute inset-0 items-center justify-center bg-black/40">
          <View className="items-center gap-3 rounded-2xl bg-white px-8 py-6">
            <ActivityIndicator size="large" color="#1F2A43" />
            <Text
              className="text-[14px] text-[#1F2A43]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              {savingLabel}
            </Text>
          </View>
        </View>
      )}

      {/* 저장 완료 다이얼로그 */}
      <ConfirmDialog
        visible={showSuccessDialog}
        title="저장이 완료되었습니다!"
        description="언제든 수정이 가능합니다"
        onConfirm={handleSuccessConfirm}
      />

      {/* 저장 실패 다이얼로그 */}
      <ConfirmDialog
        visible={saveError !== null}
        title="저장에 실패했습니다"
        description={saveError ?? ''}
        isError
        onConfirm={() => setSaveError(null)}
      />
    </View>
  )
}

function SectionLabel({ label, count, max }: { label: string; count?: number; max?: number }) {
  return (
    <View className="mx-6 mb-2 mt-6 flex-row items-center gap-2">
      <Text className="text-[16px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-Medium' }}>
        {label}
      </Text>
      {count !== undefined && max !== undefined && (
        <Text className="text-[12px] text-[#B48247]" style={{ fontFamily: 'Pretendard-SemiBold' }}>
          {count}/{max}
        </Text>
      )}
    </View>
  )
}

function CertificationRow({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <View className="flex-row items-center rounded-[4px] bg-[#F2F2F2] px-[13px] py-[15px]">
      <Text
        className="flex-1 text-[13px] text-[#1F2A43]"
        style={{ fontFamily: 'Pretendard-Medium' }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Pressable
        hitSlop={8}
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel="삭제"
      >
        <Text className="text-[#74768E]" style={{ fontSize: 14 }}>
          ✕
        </Text>
      </Pressable>
    </View>
  )
}
