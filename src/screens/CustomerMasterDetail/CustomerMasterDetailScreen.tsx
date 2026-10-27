import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useState } from 'react'
import { Linking, Platform, Pressable, ScrollView, View } from 'react-native'

import { ArrowBackIcon, StarFillIcon, StarNoneIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ExpertProfileDetailBody } from '@/components/expert/ExpertProfileDetailBody'
import { useCreateDiagnosisRequest } from '@/hooks/useCreateDiagnosisRequest'
import { useExpertProfile } from '@/hooks/useExpertProfile'
import { useFavoriteExpert } from '@/hooks/useFavoriteExpert'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CustomerMasterDetail'>
type RouteProp = { key: string; name: 'CustomerMasterDetail'; params: { expertProfileId: number } }

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const BOTTOM_BAR_HEIGHT = 90

export function CustomerMasterDetailScreen() {
  const navigation = useNavigation<NavProp>()
  const route = useRoute<RouteProp>()
  const insets = useScreenInsets()

  const { expertProfileId } = route.params
  const { data: profile, isLoading } = useExpertProfile(expertProfileId)
  const { isFavorited, toggle: toggleFavorite, isToggling } = useFavoriteExpert(expertProfileId)
  const { mutate: createDiagnosis, isPending: isDiagnosing } = useCreateDiagnosisRequest()

  const [showDiagnosisDialog, setShowDiagnosisDialog] = useState(false)
  const [resultMessage, setResultMessage] = useState<{ title: string; isError: boolean } | null>(
    null
  )

  // Figma: 진단요청팝업 — 진단요청 등록 후 명인 오픈채팅으로 이동
  const openChat = () => {
    const url = profile?.kakaoOpenChatUrl
    if (url) {
      Linking.openURL(url).catch(() => {})
    } else {
      setResultMessage({ title: '진단 요청이 전송되었습니다', isError: false })
    }
  }

  const handleDiagnosisConfirm = () => {
    setShowDiagnosisDialog(false)
    createDiagnosis(expertProfileId, {
      onSuccess: openChat,
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status
        // 이미 요청한 명인이면 오픈채팅 이동만 진행
        if (status === 409) {
          openChat()
          return
        }
        setResultMessage({ title: '진단 요청에 실패했습니다. 다시 시도해주세요.', isError: true })
      },
    })
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#D9D9D9]">
        <Text className="text-[14px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-Medium' }}>
          불러오는 중...
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#D9D9D9]" style={{ paddingTop: insets.top }}>
      {/* 네비게이션 바 */}
      <View className="h-[60px] flex-row items-center justify-between px-4">
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          onPress={() => navigation.goBack()}
        >
          <ArrowBackIcon />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + 24 }}
      >
        {/* 명인 이름 */}
        <View className="px-[39px] pb-3">
          <Text
            className="text-[28px] text-[#1F2A43]"
            style={{ fontFamily: 'Pretendard-ExtraBold' }}
          >
            {profile?.name || '-'}
          </Text>
        </View>

        {/* 프로필 카드 — Figma: 흰색 30%(glass) over #D9D9D9 = #E4E4E4.
            반투명 bg는 shadow/elevation이 카드 안으로 비쳐 플랫폼마다 색이 달라지므로 합성색으로 고정 */}
        <View
          className="mx-[26px] rounded-[16px] bg-[#E4E4E4] px-[13px] pb-6"
          style={Platform.select({
            ios: {
              shadowColor: '#424A56',
              shadowOffset: { width: 2, height: 4 },
              shadowOpacity: 0.31,
              shadowRadius: 18.1,
            },
            android: { elevation: 8 },
          })}
        >
          <ExpertProfileDetailBody
            profile={profile}
            onPressReview={() => navigation.navigate('MasterReview', { expertProfileId })}
          />
        </View>

        {/* 하단 인증 문구 (카드 밖) */}
        <Text
          className="mt-6 text-center text-[12px] text-[#A2A2A2]"
          style={{ fontFamily: 'Pretendard-Medium' }}
        >
          본 명인은 증명서를 통해 운동명인에서 검증한 명인입니다
        </Text>
      </ScrollView>

      {/* 고정 하단 바: 찜 + 진단요청 */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center bg-[#F2F2F2] px-8"
        style={{
          paddingBottom: insets.bottom + 8,
          paddingTop: 16,
          ...Platform.select({
            ios: {
              shadowColor: '#8B8B8B',
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
            },
            android: { elevation: 8 },
          }),
        }}
      >
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isFavorited ? '찜 해제' : '찜하기'}
          onPress={() => toggleFavorite()}
          disabled={isToggling}
        >
          {isFavorited ? <StarFillIcon size={60} /> : <StarNoneIcon size={60} />}
        </Pressable>

        <Pressable
          hitSlop={8}
          className="ml-4 h-[52px] flex-1 items-center justify-center rounded-[8px] bg-[#C6A75E]"
          accessibilityRole="button"
          accessibilityLabel="진단요청하기"
          onPress={() => setShowDiagnosisDialog(true)}
          disabled={isDiagnosing}
        >
          <Text
            className="text-[20px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            {isDiagnosing ? '요청 중...' : '진단요청하기'}
          </Text>
        </Pressable>
      </View>

      <ConfirmDialog
        visible={showDiagnosisDialog}
        title="진단요청하기"
        description="명인의 오픈채팅으로 이동할까요?"
        confirmLabel="이동하기"
        onConfirm={handleDiagnosisConfirm}
        onCancel={() => setShowDiagnosisDialog(false)}
      />

      <ConfirmDialog
        visible={resultMessage !== null}
        title={resultMessage?.isError ? '오류' : '완료'}
        description={resultMessage?.title ?? ''}
        isError={resultMessage?.isError}
        onConfirm={() => setResultMessage(null)}
      />
    </View>
  )
}
