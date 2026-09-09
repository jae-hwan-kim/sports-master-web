import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'

import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArrowBackIcon, SettingsIcon } from '@/assets/icons'
import { ImageUploadGrid } from '@/components/profile/ImageUploadGrid'
import { KeywordChipInput } from '@/components/profile/KeywordChipInput'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { RegionSelector } from '@/components/profile/RegionSelector'
import { TextField } from '@/components/TextField'
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
  const [keywords, setKeywords] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [portfolioPdfName, setPortfolioPdfName] = useState('')
  const [portfolioPdfUri, setPortfolioPdfUri] = useState('')
  const [careerText, setCareerText] = useState('')
  const [certifications, setCertifications] = useState<string[]>([])

  useEffect(() => {
    if (!profile) return
    setRegion(profile.region ?? '')
    setOpenChatUrl(profile.kakaoOpenChatUrl ?? '')
    setKeywords(profile.keywordTags ?? [])
    setImages(profile.portfolioImageUrls ?? [])
    setCareerText(profile.careerText ?? '')
    if (profile.educationPdfUrl) {
      const segments = profile.educationPdfUrl.split('/')
      setPortfolioPdfName(segments[segments.length - 1] ?? 'portfolio.pdf')
      setPortfolioPdfUri(profile.educationPdfUrl)
    }
  }, [profile])

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
      setPortfolioPdfUri(result.assets[0].uri)
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

  const handleSave = () => {
    updateMutation.mutate(
      {
        region: region || undefined,
        openChatUrl: openChatUrl || undefined,
        keywordTags: keywords.length > 0 ? keywords : undefined,
        // careerText maps to bio in the current PATCH endpoint
        bio: careerText || undefined,
        portfolioImageUrls: images.length > 0 ? images : undefined,
        educationPdfUrl: portfolioPdfUri || undefined,
        certificationUris: certifications.length > 0 ? certifications : undefined,
      },
      { onSuccess: () => navigation.goBack() }
    )
  }

  return (
    <View className="flex-1 bg-[#D9D9D9]">
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
          <View className="flex-row items-center gap-2">
            <Pressable
              hitSlop={8}
              onPress={() => navigation.navigate('Settings' as never)}
              accessibilityRole="button"
              accessibilityLabel="설정"
            >
              <SettingsIcon size={44} />
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={handleSave}
              disabled={updateMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="저장"
            >
              <Text
                className="text-[16px] text-[#1F2A43]"
                style={{
                  fontFamily: 'Pretendard-SemiBold',
                  opacity: updateMutation.isPending ? 0.4 : 1,
                }}
              >
                저장
              </Text>
            </Pressable>
          </View>
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
              className="text-[28px] text-black"
              style={{ fontFamily: 'Pretendard-ExtraBold' }}
            >
              상세프로필
            </Text>
            <Text
              className="mt-1 text-[13px] text-[#74768E]"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              {'전문성을 나타낼 수 있는 정보를 업로드하고,\n내 정보를 수정할 수 있습니다.'}
            </Text>
          </View>

          {/* 프로필 카드 — 탭으로 대표 사진 변경 */}
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
                  {/* 투명 오버레이 — 우상단 편집 배지 */}
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
          <SectionLabel label="지역" />
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

          {/* 키워드 */}
          <SectionLabel label="키워드" />
          <View className="mx-6">
            <KeywordChipInput keywords={keywords} onChange={setKeywords} />
          </View>

          {/* 이미지 */}
          <SectionLabel label="이미지" />
          <View className="mx-6">
            <ImageUploadGrid images={images} onChange={setImages} maxCount={5} />
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
                {portfolioPdfName || 'PDF 용량 99MB 이하'}
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
              renderItem={({ item: uri, index }) => (
                <CertificationRow
                  label={`자격증 이미지 ${index + 1}`}
                  onRemove={() => handleRemoveCertification(index)}
                />
              )}
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
    </View>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <View className="mx-6 mb-2 mt-6">
      <Text
        className="text-[20px] text-[#1F2A43]"
        style={{ fontFamily: 'Pretendard-SemiBold' }}
      >
        {label}
      </Text>
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
      <Pressable hitSlop={8} onPress={onRemove} accessibilityRole="button" accessibilityLabel="삭제">
        <Text className="text-[#74768E]" style={{ fontSize: 14 }}>
          ✕
        </Text>
      </Pressable>
    </View>
  )
}
