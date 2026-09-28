import { useState } from 'react'

import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AddCircleIcon } from '@/assets/icons'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useCreateCertification } from '@/hooks/useCreateCertification'
import { useSignUp } from '@/hooks/useSignUp'
import { useSwitchMode } from '@/hooks/useSwitchMode'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'
import { useSignUpDraftStore } from '@/store/signupDraftStore'
import { mapSignUpError } from '@/utils/signupValidation'

// 팝업 3종(앨범 접근 권한 안내 / 미첨부 경고 / 나중에 선택하기 확인)을 모두
// 이 화면의 모달 state로 흡수 — 별도 화면/프레임으로 분리하지 않음
type ModalKind = 'albumPermission' | 'missingImage' | 'skipConfirm' | 'submitError' | null

export function MasterVerificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const [certificateImageUri, setCertificateImageUri] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalKind>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const { mutate: createCertification, isPending: submitting } = useCreateCertification()
  const { mutate: signUp, isPending: registering } = useSignUp()
  const { mutate: switchMode, isPending: switchingMode } = useSwitchMode()
  const setAuthSession = useAuthStore((state) => state.setAuthSession)
  const setModeSelected = useAuthStore((state) => state.setModeSelected)
  const draft = useSignUpDraftStore((state) => state.draft)
  const clearDraft = useSignUpDraftStore((state) => state.clearDraft)
  const setPendingError = useSignUpDraftStore((state) => state.setPendingError)

  // 명인 인증 화면의 '선택완료'/'나중에' 시점에 모드를 확정한다.
  // - draft가 있으면(이메일 가입) 이 시점에 실제 계정을 생성(mode: expert)
  // - draft가 없으면(소셜 가입 — 계정은 이미 생성돼 있음) 모드만 지정
  const confirmExpertMode = (onSuccess: () => void) => {
    if (draft) {
      signUp(
        { ...draft, mode: 'expert' },
        {
          onSuccess: (data) => {
            setAuthSession(data.accessToken, data.refreshToken, data.user)
            clearDraft()
            onSuccess()
          },
          onError: (error) => {
            setPendingError(mapSignUpError(error))
            navigation.navigate('SignUp')
          },
        }
      )
      return
    }

    switchMode(
      { mode: 'expert' },
      {
        onSuccess: (data) => {
          setModeSelected(data.currentMode)
          onSuccess()
        },
        onError: (error) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            '모드 설정에 실패했습니다. 잠시 후 다시 시도해 주세요.'
          setErrorMessage(message)
          setModal('submitError')
        },
      }
    )
  }

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permission.status !== 'granted') {
      setModal('albumPermission')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setCertificateImageUri(result.assets[0].uri)
    }
  }

  const handleSubmit = () => {
    if (!certificateImageUri) {
      setModal('missingImage')
      return
    }

    confirmExpertMode(() => {
      createCertification(
        { fileUri: certificateImageUri, type: 'license' },
        {
          // 성공 시 심사 대기(pending) 상태로 전환됨 — 서버가 status: 'pending'으로 응답
          onSuccess: () => {
            navigation.navigate('MasterWelcome')
          },
          onError: (error) => {
            const message =
              (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              '자격증 이미지 업로드에 실패했습니다. 다시 시도해 주세요.'
            setErrorMessage(message)
            setModal('submitError')
          },
        }
      )
    })
  }

  const handleSkipConfirm = () => {
    setModal(null)
    // 인증 보류(skip) 처리: 별도 스킵 API가 없어 모드 확정 후 바로 이동
    // (목적에 맞는 "인증 보류" 엔드포인트가 백엔드에 없음 — notes 참고)
    confirmExpertMode(() => navigation.navigate('MasterWelcome'))
  }

  const handleOpenSettings = () => {
    setModal(null)
    Linking.openSettings()
  }

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1 px-[26px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title — Figma: 헤더(상단여백54+네비바56=110) 아래 34px 고정 */}
        <Text className="mt-[34px] text-[28px] font-pretendard-extrabold text-black">명인 인증</Text>
        <Text className="mt-2 text-[13px] font-medium text-gray2">
          물리치료사, 건강운동관리사 자격증 이미지 첨부
        </Text>

        {/* Upload Card — Figma 구조: 바깥 카드(300x200, radius 16) 안에 25px 인셋의
            보더 박스(250x150, radius 12)가 있고, 그 안에 타이틀+설명+업로드 버튼이 배치됨 */}
        <View
          className="mt-[60px] h-[200px] w-[300px] self-center rounded-2xl bg-white"
          style={Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 12.7,
            },
            android: { elevation: 4 },
          })}
        >
          <View className="absolute left-[25px] top-[25px] h-[150px] w-[250px] items-center justify-center rounded-xl border border-[#C6A75E] px-4">
            {certificateImageUri ? (
              <Image
                source={{ uri: certificateImageUri }}
                className="h-[120px] w-[120px] rounded-xl"
                contentFit="cover"
              />
            ) : (
              <>
                <Text className="text-center text-[20px] font-semibold text-black">
                  이미지 업로드
                </Text>
                <Text className="mt-2 text-center text-[13px] font-medium text-gray2">
                  식별 가능한 물리치료사 or 건강운동관리사{'\n'}자격증 이미지를 첨부해 주세요
                </Text>
              </>
            )}

            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                certificateImageUri ? '자격증 이미지 다시 첨부' : '자격증 이미지 첨부'
              }
              onPress={handlePickImage}
              className="mt-4 h-[44px] w-[44px] items-center justify-center"
            >
              <AddCircleIcon />
            </Pressable>
          </View>
        </View>

        {/* Actions — Figma: 카드 하단에서 36px, 두 버튼 사이 16px 고정 */}
        <View className="mt-9 gap-4">
          <Button
            label="선택완료"
            variant="gold"
            onPress={handleSubmit}
            loading={submitting || registering || switchingMode}
          />
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="나중에 선택하기"
            onPress={() => setModal('skipConfirm')}
            className="h-[50px] w-full items-center justify-center rounded-lg border border-gray2 bg-gray3"
          >
            <Text className="text-main font-medium text-white">나중에 선택하기</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 명인_앨범 엑세스 팝업 */}
      <ConfirmDialog
        visible={modal === 'albumPermission'}
        title="엑세스 권한 요청"
        description={'이미지 업로드를 위해서 기기 앨범\n접근 허용이 필요합니다'}
        confirmLabel="접근 허용"
        cancelLabel="나중에"
        onConfirm={handleOpenSettings}
        onCancel={() => setModal(null)}
      />

      {/* 팝업_주의사항 — 이미지 미첨부 상태로 선택완료 터치 시, 단일 버튼 */}
      <ConfirmDialog
        visible={modal === 'missingImage'}
        title="이미지를 업로드 해주세요"
        description="업로드 후 선택완료를 눌러야 합니다."
        confirmLabel="확인"
        onConfirm={() => setModal(null)}
      />

      {/* 나중에 선택하기 확인 팝업 — 왼쪽(골드) 지금 업로드=취소, 오른쪽(네이비) 나중에=스킵 확정 */}
      <ConfirmDialog
        visible={modal === 'skipConfirm'}
        title="나중에 업로드 하시겠습니까?"
        description="업로드 전까지 이용에 제한이 있습니다."
        confirmLabel="지금 업로드"
        cancelLabel="나중에"
        onConfirm={() => setModal(null)}
        onCancel={handleSkipConfirm}
      />

      {/* 자격증 업로드 실패 팝업 */}
      <ConfirmDialog
        visible={modal === 'submitError'}
        title="업로드에 실패했습니다"
        description={errorMessage}
        confirmLabel="확인"
        cancelLabel="닫기"
        onConfirm={() => setModal(null)}
        onCancel={() => setModal(null)}
      />
    </View>
  )
}
