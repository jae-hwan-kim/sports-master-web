import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'

import { ArrowBackIcon } from '@/assets/icons'
import { TextField } from '@/components/TextField'
import { ImageUploadGrid } from '@/components/profile/ImageUploadGrid'
import { KeywordChipInput } from '@/components/profile/KeywordChipInput'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { RegionSelector } from '@/components/profile/RegionSelector'
import { useMyExpertProfile } from '@/hooks/useMyExpertProfile'
import { useUpdateExpertProfile } from '@/hooks/useUpdateExpertProfile'
import { RootStackParamList } from '@/navigation/RootNavigator'

export function MasterDetailProfileEditScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const { data: profile } = useMyExpertProfile()
  const updateMutation = useUpdateExpertProfile()

  const [region, setRegion] = useState('')
  const [openChatUrl, setOpenChatUrl] = useState('')
  const [centerPhone, setCenterPhone] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [portfolioPdfName, setPortfolioPdfName] = useState('')
  const [careerText, setCareerText] = useState('')
  const [certifications, setCertifications] = useState<string[]>([])

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  useEffect(() => {
    if (!profile) return
    setRegion(profile.region ?? '')
    setOpenChatUrl(profile.kakaoOpenChatUrl ?? '')
    // centerPhone — BE 스키마 추가 후 setCenterPhone(profile.centerPhone ?? '') 연결
    setKeywords(profile.keywordTags ?? [])
    setImages(profile.portfolioImageUrls ?? [])
    setCareerText(profile.careerText ?? '')
    if (profile.educationPdfUrl) {
      const segments = profile.educationPdfUrl.split('/')
      setPortfolioPdfName(segments[segments.length - 1] ?? 'portfolio.pdf')
    }
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
      const uri = result.assets[0].uri
      setImages((prev) => [uri, ...prev.slice(1)])
    }
  }, [])

  const handlePickPdf = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    })
    if (!result.canceled && result.assets[0]) {
      setPortfolioPdfName(result.assets[0].name)
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

  const handleConfirmedSave = () => {
    setShowConfirmDialog(false)
    updateMutation.mutate(
      {
        region: region || undefined,
        openChatUrl: openChatUrl || undefined,
        keywordTags: keywords.length > 0 ? keywords : undefined,
        bio: careerText || undefined,
        // portfolioImageUrls, educationPdfUrl, certificationUris — BE 스키마 추가 후 generate-types 실행 필요
      },
      { onSuccess: () => setShowSuccessDialog(true) }
    )
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
    <View className="flex-1 bg-[#F2F2F2]">
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
            onPress={() => setShowConfirmDialog(true)}
            disabled={updateMutation.isPending}
            className="h-[24px] w-[56px] items-center justify-center rounded-[4px] bg-[#1F2A43]"
            accessibilityRole="button"
            accessibilityLabel="수정완료"
          >
            <Text
              className="text-[12px] text-[#F2F2F2]"
              style={{
                fontFamily: 'Pretendard-SemiBold',
                opacity: updateMutation.isPending ? 0.4 : 1,
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
            <Text className="text-[28px] text-black" style={{ fontFamily: 'Pretendard-ExtraBold' }}>
              상세프로필
            </Text>
            <Text
              className="mt-1 text-[13px] text-[#74768E]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              {'전문성을 나타낼 수 있는 정보를 업로드하고,\n내 정보를 수정할 수 있습니다.'}
            </Text>
          </View>

          {/* 프로필 카드 */}
          {profile && (
            <View className="mx-6">
              <View>
                <ProfileCard profile={{ ...profile, portfolioImageUrls: images }} />
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

          {/* 센터연락처 — BE 스키마 추가 후 mutation에 centerPhone 포함 */}
          <SectionLabel label="센터연락처" />
          <View className="mx-6">
            <TextField
              value={centerPhone}
              onChangeText={setCenterPhone}
              label="연락처 입력 (예: 010-0000-0000)"
              keyboardType="phone-pad"
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
              className="flex-row items-center rounded-[4px] bg-white px-[13px] py-[15px]"
              accessibilityRole="button"
              accessibilityLabel="PDF 선택"
            >
              <Text
                className="flex-1 text-[13px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-Medium' }}
                numberOfLines={1}
              >
                {portfolioPdfName || 'PDF 용량 99MB 이하'}
              </Text>
            </Pressable>
          </View>

          {/* 학력 및 경력사항 */}
          <SectionLabel label="학력 및 경력사항" />
          <View className="mx-6">
            <View className="rounded-[4px] bg-white px-[13px] py-[15px]" style={{ minHeight: 164 }}>
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
                    className="flex-row items-center rounded-[4px] bg-white px-[13px] py-[15px]"
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

      {/* 저장 확인 다이얼로그 */}
      <Modal visible={showConfirmDialog} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="w-[340px] overflow-hidden rounded-[16px] bg-[#F2F2F2]">
            <View className="items-center gap-2 px-6 pb-6 pt-8">
              <Text
                className="text-[24px] text-[#07091C]"
                style={{ fontFamily: 'Pretendard-SemiBold' }}
              >
                프로필을 저장할까요?
              </Text>
              <Text
                className="text-[16px] text-[#74768E]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                수정사항이 즉시 반영됩니다
              </Text>
            </View>
            <View className="h-[1px] bg-[#D9D9D9]" />
            <View className="flex-row">
              <Pressable
                hitSlop={0}
                onPress={() => setShowConfirmDialog(false)}
                className="h-[50px] flex-1 items-center justify-center bg-[#102343]"
                accessibilityRole="button"
                accessibilityLabel="취소"
              >
                <Text
                  className="text-[16px] text-white"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  취소
                </Text>
              </Pressable>
              <View className="w-[1px] bg-[#D9D9D9]" />
              <Pressable
                hitSlop={0}
                onPress={handleConfirmedSave}
                className="h-[50px] flex-1 items-center justify-center bg-[#C6A75E]"
                accessibilityRole="button"
                accessibilityLabel="저장하기"
              >
                <Text
                  className="text-[16px] text-white"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  저장하기
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 저장 완료 다이얼로그 */}
      <Modal visible={showSuccessDialog} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="w-[340px] overflow-hidden rounded-[16px] bg-[#F2F2F2]">
            <View className="items-center gap-2 px-6 pb-6 pt-8">
              <Text
                className="text-[24px] text-[#07091C]"
                style={{ fontFamily: 'Pretendard-SemiBold' }}
              >
                저장이 완료되었습니다!
              </Text>
              <Text
                className="text-[16px] text-[#74768E]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                언제든 수정이 가능합니다
              </Text>
            </View>
            <View className="h-[1px] bg-[#D9D9D9]" />
            <View className="items-center py-3">
              <Pressable
                hitSlop={8}
                onPress={handleSuccessConfirm}
                className="h-[50px] w-[145px] items-center justify-center rounded-[8px] bg-[#C6A75E]"
                accessibilityRole="button"
                accessibilityLabel="확인"
              >
                <Text
                  className="text-[16px] text-white"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  확인
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function SectionLabel({ label, count, max }: { label: string; count?: number; max?: number }) {
  return (
    <View className="mx-6 mb-2 mt-6 flex-row items-center gap-2">
      <Text className="text-[20px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-SemiBold' }}>
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
    <View className="flex-row items-center rounded-[4px] bg-white px-[13px] py-[15px]">
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
